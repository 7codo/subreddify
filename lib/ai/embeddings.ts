import { embed, embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { and, cosineDistance, desc, eq, gt, sql } from "drizzle-orm";
import { embeddings } from "../db/schemas";
import { db } from "../config/drizzle";
import { listCommentsByIds, listPostsByIds } from "../db/queries";

const embeddingModel = openai.embedding("text-embedding-ada-002");

const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split(".")
    .filter((i) => i !== "");
};

export const generateEmbeddings = async (
  value: string
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = generateChunks(value);
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll("\\n", " ");
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
};

export type RelevantContentType = {
  posts: {
    title: string;
    content: string;
    link: string;
    author: string;
    subreddit: string;
    score: number | null;
    created: number;
  }[];
  comments: {
    body: string;
    author: string;
    score: number | null;
    created: number;
  }[];
};

export const findRelevantContent = async (
  userQuery: string,
  chatId: string
): Promise<RelevantContentType> => {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const similarity = sql<number>`1 - (${cosineDistance(
    embeddings.embedding,
    userQueryEmbedded
  )})`;
  const similarGuides = await db
    .select({
      name: embeddings.content,
      similarity,
      postId: embeddings.postId,
      commentId: embeddings.commentId,
    })
    .from(embeddings)
    .where(and(gt(similarity, 0.5), eq(embeddings.chatId, chatId)))
    .orderBy((t) => desc(t.similarity))
    .limit(7);

  const postsIds = Array.from(
    new Set(
      similarGuides

        .map((guide) => guide.postId)
        .filter((id): id is string => id !== null)
    )
  );
  const commentsIds = Array.from(
    new Set(
      similarGuides

        .map((guide) => guide.commentId)
        .filter((id): id is string => id !== null)
    )
  );
  if (postsIds.length === 0 || commentsIds.length === 0)
    return { posts: [], comments: [] };
  const postsList = (await listPostsByIds({ ids: postsIds }))?.data ?? [];
  const commentsList =
    (await listCommentsByIds({ ids: commentsIds }))?.data ?? [];
  const posts = postsList.map((post) => ({
    title: post.title,
    content: post.selftext,
    link: post.permalink,
    author: post.author,
    subreddit: post.subreddit,
    score: post.score,
    created: post.created,
  }));
  const comments = commentsList.map((comment) => ({
    body: comment.body,
    author: comment.author,
    score: comment.score,
    created: comment.created,
  }));

  return { posts, comments };
};
