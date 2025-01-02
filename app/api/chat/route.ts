import {
  type Message,
  convertToCoreMessages,
  createDataStreamResponse,
  streamObject,
  streamText,
  tool,
} from "ai";
import { z } from "zod";

import { customModel } from "@/lib/ai";
import { models } from "@/lib/ai/models";
import { systemPrompt, updateDocumentPrompt } from "@/lib/ai/prompts";
import {
  createResource,
  deleteChatById,
  listPostsByChatId,
  getChatById,
  getDocumentById,
  saveChat,
  saveDocument,
  saveMessages,
  saveSuggestions,
  listCommentsByChatId,
} from "@/lib/db/queries";
import type { Suggestion } from "@/lib/db/schemas";
import { auth } from "@clerk/nextjs/server";
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from "@/lib/utils";
import { InsertCommentType, InsertPostType } from "@/lib/db/schemas";

import { generateTitleFromUserMessage } from "../../(protected)/chat/_lib/actions";
import { findRelevantContent } from "@/lib/ai/embeddings";
import { revalidatePath, revalidateTag } from "next/cache";
import { getCurrentPlanName, getUsage } from "@/lib/actions";
import { USAGE_LIMIT } from "@/lib/constants";

type AllowedTools =
  | "createDocument"
  | "updateDocument"
  | "requestSuggestions"
  | "getInformation";

const blocksTools: AllowedTools[] = [
  "createDocument",
  "updateDocument",
  "requestSuggestions",
];

const knowledgeTools: AllowedTools[] = ["getInformation"];

const allTools: AllowedTools[] = [...blocksTools, ...knowledgeTools];

export const maxDuration = 60;

export async function POST(request: Request) {
  const {
    id,
    messages,
    modelId,
    posts,
    comments,
  }: {
    id: string;
    messages: Array<Message>;
    modelId: string;
    posts: InsertPostType[];
    comments: InsertCommentType[];
  } = await request.json();

  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  const cuurentPlanName = (await getCurrentPlanName())?.data ?? "free";
  const { tokens, resources } = await getUsage();
  const postsList = (await listPostsByChatId({ chatId: id }))?.data ?? [];

  if (tokens > USAGE_LIMIT[cuurentPlanName].tokens) {
    return new Response("LIMIT_REACHED", { status: 400 });
  }

  if (resources > USAGE_LIMIT[cuurentPlanName].resources) {
    return new Response("LIMIT_REACHED", {
      status: 400,
    });
  }

  const model = models.find((model) => model.id === modelId);

  if (!model) {
    return new Response("Model not found", { status: 404 });
  }

  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);

  if (!userMessage) {
    return new Response("No user message found", { status: 400 });
  }

  const chat = (await getChatById({ id }))?.data;

  if (!chat) {
    const title = await generateTitleFromUserMessage({ message: userMessage });

    await saveChat({ id, title });
  }

  if (posts.length > 0) {
    await createResource({
      postsData: posts,
      commentsData: comments,
      chatId: id,
    });
  } else {
    if (postsList.length === 0) {
      return new Response("Resource not found", { status: 404 });
    }
  }

  const userMessageId = generateUUID();

  await saveMessages({
    messages: [
      {
        ...userMessage,
        id: userMessageId,
        createdAt: new Date(),
        chatId: id,
        content:
          typeof userMessage.content === "string"
            ? userMessage.content
            : JSON.stringify(userMessage.content),
      },
    ],
  });

  return createDataStreamResponse({
    execute: (dataStream) => {
      dataStream.writeData({
        type: "user-message-id",
        content: userMessageId,
      });

      const result = streamText({
        model: customModel(model.apiIdentifier),
        system: systemPrompt,
        messages: coreMessages,
        maxSteps: 5,
        experimental_activeTools: allTools,
        tools: {
          getInformation: tool({
            description: `get information from your knowledge base to answer questions and write documents.`,
            parameters: z.object({
              question: z.string().describe("the users question"),
            }),
            execute: async ({ question }) => {
              const relevantContent = await findRelevantContent(question, id);

              return relevantContent;
            },
          }),
          createDocument: {
            description:
              "Create a document for a writing activity. This tool will call other functions that will generate the contents of the document based on the title.",
            parameters: z.object({
              title: z.string(),
            }),
            execute: async ({ title }) => {
              const id = generateUUID();
              let draftText = "";

              dataStream.writeData({
                type: "id",
                content: id,
              });

              dataStream.writeData({
                type: "title",
                content: title,
              });

              dataStream.writeData({
                type: "clear",
                content: "",
              });

              const { fullStream } = streamText({
                model: customModel(model.apiIdentifier),
                system:
                  "Write about the given topic. Markdown is supported. Use headings wherever appropriate.",
                prompt: title,
              });

              for await (const delta of fullStream) {
                const { type } = delta;

                if (type === "text-delta") {
                  const { textDelta } = delta;

                  draftText += textDelta;
                  dataStream.writeData({
                    type: "text-delta",
                    content: textDelta,
                  });
                }
              }

              dataStream.writeData({ type: "finish", content: "" });
              if (userId) {
                await saveDocument({
                  id,
                  title,
                  content: draftText,
                });
              }

              return {
                id,
                title,
                content:
                  "A document was created and is now visible to the user.",
              };
            },
          },
          updateDocument: {
            description: "Update a document with the given description.",
            parameters: z.object({
              id: z.string().describe("The ID of the document to update"),
              description: z
                .string()
                .describe("The description of changes that need to be made"),
            }),
            execute: async ({ id, description }) => {
              const document = (await getDocumentById({ id }))?.data;

              if (!document) {
                return {
                  error: "Document not found",
                };
              }

              const { content: currentContent } = document;
              let draftText = "";

              dataStream.writeData({
                type: "clear",
                content: document.title,
              });

              const { fullStream } = streamText({
                model: customModel(model.apiIdentifier),
                system: updateDocumentPrompt(currentContent),
                prompt: description,
                experimental_providerMetadata: {
                  openai: {
                    prediction: {
                      type: "content",
                      content: currentContent,
                    },
                  },
                },
              });

              for await (const delta of fullStream) {
                const { type } = delta;

                if (type === "text-delta") {
                  const { textDelta } = delta;

                  draftText += textDelta;
                  dataStream.writeData({
                    type: "text-delta",
                    content: textDelta,
                  });
                }
              }

              dataStream.writeData({ type: "finish", content: "" });

              if (userId) {
                await saveDocument({
                  id,
                  title: document.title,
                  content: draftText,
                });
              }

              return {
                id,
                title: document.title,
                content: "The document has been updated successfully.",
              };
            },
          },
          requestSuggestions: {
            description: "Request suggestions for a document",
            parameters: z.object({
              documentId: z
                .string()
                .describe("The ID of the document to request edits"),
            }),
            execute: async ({ documentId }) => {
              const document = (await getDocumentById({ id: documentId }))
                ?.data;

              if (!document || !document.content) {
                return {
                  error: "Document not found",
                };
              }

              const suggestions: Array<
                Omit<Suggestion, "userId" | "createdAt" | "documentCreatedAt">
              > = [];

              const { elementStream } = streamObject({
                model: customModel(model.apiIdentifier),
                system:
                  "You are a help writing assistant. Given a piece of writing, please offer suggestions to improve the piece of writing and describe the change. It is very important for the edits to contain full sentences instead of just words. Max 5 suggestions.",
                prompt: document.content,
                output: "array",
                schema: z.object({
                  originalSentence: z
                    .string()
                    .describe("The original sentence"),
                  suggestedSentence: z
                    .string()
                    .describe("The suggested sentence"),
                  description: z
                    .string()
                    .describe("The description of the suggestion"),
                }),
              });

              for await (const element of elementStream) {
                const suggestion = {
                  originalText: element.originalSentence,
                  suggestedText: element.suggestedSentence,
                  description: element.description,
                  id: generateUUID(),
                  documentId: documentId,
                  isResolved: false,
                };

                dataStream.writeData({
                  type: "suggestion",
                  content: suggestion,
                });

                suggestions.push(suggestion);
              }

              if (userId) {
                await saveSuggestions({
                  suggestions: suggestions.map((suggestion) => ({
                    ...suggestion,
                    userId,
                    createdAt: new Date(),
                    documentCreatedAt: document.createdAt,
                  })),
                });
              }

              return {
                id: documentId,
                title: document.title,
                message: "Suggestions have been added to the document",
              };
            },
          },
        },
        onFinish: async ({ response }) => {
          if (userId) {
            try {
              const responseMessagesWithoutIncompleteToolCalls =
                sanitizeResponseMessages(response.messages);

              await saveMessages({
                messages: responseMessagesWithoutIncompleteToolCalls.map(
                  (message) => {
                    const messageId = generateUUID();

                    if (message.role === "assistant") {
                      dataStream.writeMessageAnnotation({
                        messageIdFromServer: messageId,
                      });
                    }

                    return {
                      id: messageId,
                      chatId: id,
                      role: message.role,
                      content:
                        typeof message.content === "string"
                          ? message.content
                          : JSON.stringify(message.content),
                      createdAt: new Date(),
                    };
                  }
                ),
              });
            } catch (error) {
              console.error("Failed to save chat");
            }
          }
        },
        experimental_telemetry: {
          isEnabled: true,
          functionId: "stream-text",
        },
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("id")?.split(",");

  if (!ids || ids.length === 0) {
    return Response.json({ error: "No IDs provided" }, { status: 400 });
  }

  const { userId } = await auth();

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verify ownership for all chats
    const ownershipChecks = await Promise.all(
      ids.map(async (id) => {
        const chat = (await getChatById({ id }))?.data;
        return chat?.userId === userId;
      })
    );

    if (ownershipChecks.some((isOwner) => !isOwner)) {
      return Response.json(
        { error: "Unauthorized access to one or more chats" },
        { status: 401 }
      );
    }

    // Delete all chats
    await deleteChatById({ ids });
    revalidateTag("library");
    return Response.json(
      { message: "Chats deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete error:", error);
    return Response.json(
      { error: "An error occurred while deleting chats" },
      { status: 500 }
    );
  }
}
