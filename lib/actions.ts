"use server";

import { isAfter, parseISO } from "date-fns";

import { EMAILS_FREE_PLAN, VARIANT_ID } from "@/lib/constants";
import {
  createResource,
  getChatById,
  listUsage,
  saveChat,
} from "@/lib/db/queries";
import { safeAction } from "@/lib/utils/safe-action";
import { Plan } from "./types/global";
import {
  ChatRequestOptions,
  convertToCoreMessages,
  CreateMessage,
  Message,
} from "ai";
import {
  InsertCommentType,
  InsertPostType,
  SelectCommentType,
  SelectPostType,
} from "./db/schemas";
import { generateTitleFromUserMessage } from "@/app/(protected)/chat/_lib/actions";
import { getMostRecentUserMessage, nanoid } from "./utils";
import { emitProgress } from "./events";

export const getCurrentPlanName = safeAction.action(
  async ({ ctx, parsedInput }) => {
    if (EMAILS_FREE_PLAN.includes(ctx.email))
      return process.env.ADMIN_PLAN as Plan; //admin pass

    switch (parseInt(ctx.variantId)) {
      case VARIANT_ID.starter.monthly:
      case VARIANT_ID.starter.yearly:
        return "starter";
      case VARIANT_ID.growth.monthly:
      case VARIANT_ID.growth.yearly:
        return "growth";
      case VARIANT_ID.enterprise.monthly:
      case VARIANT_ID.enterprise.yearly:
        return "enterprise";
      default:
        return "free";
    }
  }
);

export async function getUsage() {
  const usage = (await listUsage())?.data ?? { tokens: 0, resources: 0 };

  return {
    tokens: usage.tokens ?? 0,
    resources: usage.resources ?? 0,
  };
}

type ResourceResponse = {
  status: "success" | "error";
  data?: Message;
  type?: "NO_POSTS_FOUND" | "PERSIST" | "UNKNOWN";
};

export async function handleSubmitResources({
  messages,
  id,
  input,
  posts,
  comments,
}: {
  messages: Message[];
  id: string;
  input: string;
  posts: InsertPostType[];
  comments: InsertCommentType[];
}): Promise<ResourceResponse> {
  emitProgress(id, 10);

  if (messages.length === 0) {
    const chat = (await getChatById({ id }))?.data;
    emitProgress(id, 20);

    const firstMessage: Message = {
      id: nanoid(),
      content: input,
      role: "user",
    };

    if (!chat) {
      const coreMessages = convertToCoreMessages([firstMessage]);
      const userMessage = getMostRecentUserMessage(coreMessages);
      if (!userMessage) {
        throw new Error("No user message found!");
      }
      emitProgress(id, 30);

      const title = await generateTitleFromUserMessage({
        message: userMessage,
      });
      emitProgress(id, 40);

      await saveChat({ id, title });
      emitProgress(id, 50);
    }

    if (posts.length > 0) {
      await createResource({
        postsData: posts,
        commentsData: comments,
        chatId: id,
      });

      emitProgress(id, 100);
      return {
        status: "success",
        data: firstMessage,
      };
    } else {
      return {
        status: "error",
        type: "NO_POSTS_FOUND",
      };
    }
  }

  return {
    status: "error",
    type: "NO_POSTS_FOUND",
  };
}
