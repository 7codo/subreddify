import { InferSelectModel, relations } from "drizzle-orm";
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
  bigint,
  serial,
} from "drizzle-orm/pg-core";

export const notifications = pgTable("notification", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  readBy: text("read_by").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Notification = InferSelectModel<typeof notifications>;
