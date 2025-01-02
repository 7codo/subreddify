"use server";

import { generateEmbeddings } from "@/lib/ai/embeddings";
import { db } from "@/lib/config/drizzle";
import {
  comments,
  embeddings as embeddingsTable,
  insertCommentSchema,
  insertPostSchema,
  posts,
  SelectCommentType,
  SelectPostType,
} from "@/lib/db/schemas";
import { safeAction } from "@/lib/utils/safe-action";
import { eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { saveUsage } from "./lemonsqueezy";
import { calculateTableSizes } from "@/lib/utils/tables-size";

export const createResource = safeAction
  .schema(
    z.object({
      postsData: z.array(insertPostSchema),
      commentsData: z.array(insertCommentSchema),
      chatId: z.string(),
    })
  )
  .action(
    async ({
      ctx: { userId },
      parsedInput: { postsData, commentsData, chatId },
    }) => {
      try {
        // Insert posts first
        let createdPosts: SelectPostType[] = [];
        if (postsData.length > 0) {
          createdPosts = await db
            .insert(posts)
            .values(
              postsData.map((post) => ({
                userId,
                ...post,
              }))
            )
            .returning();

          // Batch generate embeddings for posts
          const postEmbeddingsPromises = createdPosts.map(async (post) => {
            const text = post.selftext ? post.selftext : post.title;
            const embeddings = await generateEmbeddings(text);
            return embeddings.map((embedding) => ({
              postId: post.id,
              chatId: post.chatId,
              userId,
              ...embedding,
            }));
          });

          const postEmbeddings = (
            await Promise.all(postEmbeddingsPromises)
          ).flat();
          if (postEmbeddings.length > 0) {
            await db.insert(embeddingsTable).values(postEmbeddings);
          }
        }

        // Process comments in a similar batched manner
        let createdComments: SelectCommentType[] = [];
        if (commentsData.length > 0) {
          const permalinkToIdMap = new Map(
            createdPosts.map((post) => [post.permalink, post.id])
          );

          const mappedComments = commentsData
            .map((comment) => ({
              ...comment,
              postId: permalinkToIdMap.get(comment.postPermalink),
            }))
            .filter(
              (comment): comment is typeof comment & { postId: string } =>
                comment.postId !== undefined
            );

          if (mappedComments.length > 0) {
            createdComments = await db
              .insert(comments)
              .values(
                mappedComments.map((comment) => ({
                  userId,
                  ...comment,
                }))
              )
              .returning();

            // Batch generate embeddings for comments
            const commentEmbeddingsPromises = createdComments.map(
              async (comment) => {
                const embeddings = await generateEmbeddings(comment.body);
                return embeddings.map((embedding) => ({
                  postId: comment.postId,
                  commentId: comment.id,
                  userId,
                  chatId: comment.chatId,
                  ...embedding,
                }));
              }
            );

            const commentEmbeddings = (
              await Promise.all(commentEmbeddingsPromises)
            ).flat();
            if (commentEmbeddings.length > 0) {
              await db.insert(embeddingsTable).values(commentEmbeddings);
            }
          }
        }

        // Calculate table sizes once at the end
        const tablesSizes = (await calculateTableSizes())?.data ?? {
          totalSizeInBytes: 0,
        };
        await saveUsage({
          resources: tablesSizes.totalSizeInBytes,
        });

        return {
          data: "Resource successfully created and embedded.",
          error: null,
        };
      } catch (error) {
        console.error("Error in createResource:", error);
        return {
          data: null,
          error: "Failed to create resources",
        };
      }
    }
  );

export const listPostsByChatId = safeAction
  .schema(z.object({ chatId: z.string() }))
  .action(async ({ parsedInput: { chatId } }) => {
    const postsList = await db
      .select()
      .from(posts)
      .where(eq(posts.chatId, chatId));

    return postsList;
  });

export const listPostsByIds = safeAction
  .schema(z.object({ ids: z.array(z.string()) }))
  .action(async ({ parsedInput: { ids } }) => {
    const result = await db.select().from(posts).where(inArray(posts.id, ids));

    return result;
  });

export const listCommentsByIds = safeAction
  .schema(z.object({ ids: z.array(z.string()) }))
  .action(async ({ parsedInput: { ids } }) => {
    const result = await db
      .select()
      .from(comments)
      .where(inArray(comments.id, ids));

    return result;
  });

export const listCommentsByPostId = safeAction
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput: { id } }) => {
    const result = await db.select().from(comments).where(eq(comments.id, id));

    return result;
  });

export const listCommentsByChatId = safeAction
  .schema(z.object({ chatId: z.string() }))
  .action(async ({ parsedInput: { chatId } }) => {
    const commentsList = await db
      .select()
      .from(comments)
      .where(eq(comments.chatId, chatId));

    return commentsList;
  });

export const deletePostWithComments = safeAction
  .schema(
    z.object({
      postId: z.string(),
      chatId: z.string(),
    })
  )
  .action(async ({ parsedInput: { postId, chatId } }) => {
    try {
      // Delete related embeddings first
      await db
        .delete(embeddingsTable)
        .where(eq(embeddingsTable.postId, postId));

      // Delete related comments
      await db.delete(comments).where(eq(comments.postId, postId));

      // Delete the post
      await db.delete(posts).where(eq(posts.id, postId));

      revalidatePath(`/chat/${chatId}`);

      return {
        data: "Post and related comments deleted successfully",
        error: null,
      };
    } catch (error) {
      console.error("Error in deletePostWithComments:", error);
      return {
        data: null,
        error: "Failed to delete post and comments",
      };
    }
  });
