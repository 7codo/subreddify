"use server";

import { and, asc, desc, eq, gt, gte, inArray } from "drizzle-orm";

import { db } from "@/lib/config/drizzle";
import { safeAction } from "@/lib/utils/safe-action";
import { z } from "zod";
import {
  chat,
  document,
  insertChatSchema,
  message,
  suggestion,
  vote,
  insertMessageSchema,
  insertVoteSchema,
  insertSuggestionSchema,
  insertDocumentSchema,
  posts,
  comments,
  embeddings,
} from "../schemas";
import { revalidatePath } from "next/cache";

export const saveChat = safeAction
  .schema(insertChatSchema)
  .action(async ({ ctx: { userId }, parsedInput: { id, title } }) => {
    return await db
      .insert(chat)
      .values({
        id,
        createdAt: new Date(),
        userId,
        title,
      })
      .onConflictDoUpdate({
        target: chat.id,
        set: {
          title,
        },
      });
  });

export const deleteChatById = safeAction
  .schema(z.object({ ids: z.array(z.string()) }))
  .action(async ({ ctx: { userId }, parsedInput: { ids } }) => {
    await db.delete(vote).where(inArray(vote.chatId, ids));
    await db.delete(message).where(inArray(message.chatId, ids));
    await db.delete(embeddings).where(inArray(embeddings.chatId, ids));
    await db.delete(comments).where(inArray(comments.chatId, ids));
    await db.delete(posts).where(inArray(posts.chatId, ids));
    await db.delete(chat).where(inArray(chat.id, ids));
  });

export const getChatsByUserId = safeAction
  .schema(z.object({ limit: z.number().optional() }))
  .action(async ({ ctx: { userId }, parsedInput: { limit } }) => {
    let chatsList;
    if (limit) {
      chatsList = await db
        .select()
        .from(chat)
        .where(eq(chat.userId, userId))
        .orderBy(desc(chat.createdAt))
        .limit(limit);
    } else {
      chatsList = await db
        .select()
        .from(chat)
        .where(eq(chat.userId, userId))
        .orderBy(desc(chat.createdAt));
    }
    return chatsList;
  });

export const getChatById = safeAction
  .schema(z.object({ id: z.string() }))
  .action(async ({ ctx: { userId }, parsedInput: { id } }) => {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  });

export const saveMessages = safeAction
  .schema(z.object({ messages: z.array(insertMessageSchema) }))
  .action(async ({ ctx: { userId }, parsedInput: { messages } }) => {
    return await db
      .insert(message)
      .values(messages.map((msg) => ({ ...msg, content: msg.content ?? "" })));
  });

export const getMessagesByChatId = safeAction
  .schema(z.object({ id: z.string() }))
  .action(async ({ ctx: { userId }, parsedInput: { id } }) => {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  });

export const voteMessage = safeAction
  .schema(insertVoteSchema)
  .action(
    async ({ ctx: { userId }, parsedInput: { messageId, chatId, type } }) => {
      const [existingVote] = await db
        .select()
        .from(vote)
        .where(and(eq(vote.messageId, messageId)));

      if (existingVote) {
        return await db
          .update(vote)
          .set({ isUpvoted: type === "up" })
          .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
      }
      return await db.insert(vote).values({
        chatId,
        messageId,
        isUpvoted: type === "up",
      });
    }
  );

export const getVotesByChatId = safeAction
  .schema(z.object({ id: z.string() }))
  .action(async ({ ctx: { userId }, parsedInput: { id } }) => {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  });

export const saveDocument = safeAction
  .schema(insertDocumentSchema)
  .action(async ({ ctx: { userId }, parsedInput: { id, title, content } }) => {
    return await db.insert(document).values({
      id,
      title,
      content,
      userId,
      createdAt: new Date(),
    });
  });

export const getDocumentsById = safeAction
  .schema(z.object({ id: z.string() }))
  .action(async ({ ctx: { userId }, parsedInput: { id } }) => {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  });

export const getDocumentById = safeAction
  .schema(z.object({ id: z.string() }))
  .action(async ({ ctx: { userId }, parsedInput: { id } }) => {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  });

export const deleteDocumentsByIdAfterTimestamp = safeAction
  .schema(z.object({ id: z.string(), timestamp: z.date() }))
  .action(async ({ ctx: { userId }, parsedInput: { id, timestamp } }) => {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp)
        )
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)));
  });

export const saveSuggestions = safeAction
  .schema(z.object({ suggestions: z.array(insertSuggestionSchema) }))
  .action(async ({ ctx: { userId }, parsedInput: { suggestions } }) => {
    return await db.insert(suggestion).values(suggestions);
  });

export const getSuggestionsByDocumentId = safeAction
  .schema(z.object({ documentId: z.string() }))
  .action(async ({ ctx: { userId }, parsedInput: { documentId } }) => {
    const suggestions = await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
    return suggestions;
  });

export const getMessageById = safeAction
  .schema(z.object({ id: z.string() }))
  .action(async ({ ctx: { userId }, parsedInput: { id } }) => {
    return await db.select().from(message).where(eq(message.id, id));
  });

export const deleteMessagesByChatIdAfterTimestamp = safeAction
  .schema(z.object({ chatId: z.string(), timestamp: z.date() }))
  .action(async ({ ctx: { userId }, parsedInput: { chatId, timestamp } }) => {
    return await db
      .delete(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp))
      );
  });

export const updateChatVisiblityById = safeAction
  .schema(
    z.object({ chatId: z.string(), visibility: z.enum(["private", "public"]) })
  )
  .action(async ({ ctx: { userId }, parsedInput: { chatId, visibility } }) => {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  });
