import { generateId } from "ai";
import { sql } from "drizzle-orm";
import {
  text,
  varchar,
  timestamp,
  pgTable,
  vector,
  index,
  uuid,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { nanoid } from "@/lib/utils";
import { chat } from "./chat";

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  chatId: uuid("chat_id")
    .notNull()
    .references(() => chat.id),
  userId: text("user_id").notNull(),
  selftext: text("selftext").notNull(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  score: integer("score"),
  created: integer("created").notNull(),
  subreddit: text("subreddit").notNull(),
  permalink: text("permalink").notNull(),
  numComments: integer("num_comments"),

  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
});

// Schema for resources - used to validate API requests
export const insertPostSchema = createInsertSchema(posts).extend({}).omit({
  id: true,
  createdAt: true,
  userId: true,
});
export const selectPostSchema = createSelectSchema(posts);

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  userId: text("user_id").notNull(),
  postId: uuid("post_id")
    .notNull()
    .references(() => posts.id),
  chatId: uuid("chat_id").references(() => chat.id, {
    onDelete: "cascade",
  }),
  body: text("body").notNull(),
  author: text("author").notNull(),
  score: integer("score"),
  created: integer("created").notNull(),

  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
});

// Schema for resources - used to validate API requests
export const insertCommentSchema = createInsertSchema(comments)
  .extend({
    postPermalink: z.string().min(1),
  })
  .omit({
    postId: true,
    id: true,
    userId: true,
    createdAt: true,
  });
export const selectCommentSchema = createSelectSchema(comments);

export type InsertCommentType = z.infer<typeof insertCommentSchema>;
export type InsertPostType = z.infer<typeof insertPostSchema>;

export type SelectCommentType = z.infer<typeof selectCommentSchema>;
export type SelectPostType = z.infer<typeof selectPostSchema>;

export const embeddings = pgTable(
  "embeddings",
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .$defaultFn(() => generateId()),
    userId: text("user_id").notNull(),
    postId: uuid("post_id").references(() => posts.id, {
      onDelete: "cascade",
    }),
    commentId: uuid("comment_id").references(() => comments.id, {
      onDelete: "cascade",
    }),
    chatId: uuid("chat_id").references(() => chat.id, {
      onDelete: "cascade",
    }),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
  },
  (table) => [
    index("embeddingIndex").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  ]
);
