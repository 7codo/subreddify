import {
  pgTable,
  serial,
  integer,
  text,
  boolean,
  timestamp,
  jsonb,
  varchar,
  bigint,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";

export const webhookEvents = pgTable("webhook_event", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  eventName: text("event_name").notNull(),
  processed: boolean("processed").default(false),
  body: jsonb("body").notNull(),
  processingError: text("processing_error"),
});

export const plans = pgTable("plan", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  productId: integer("product_id").notNull(),
  productName: text("product_name"),
  variantId: integer("variant_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  price: text("price").notNull(),
  isUsageBased: boolean("is_usage_based").default(false),
  interval: text("interval"),
  intervalCount: integer("interval_count"),
  trialInterval: text("trial_interval"),
  trialIntervalCount: integer("trial_interval_count"),
  sort: integer("sort"),
});

export const subscriptions = pgTable("subscription", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  lemonSqueezyId: text("lemonSqueezy_id").unique().notNull(),
  orderId: integer("order_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  status: text("status").notNull(),
  statusFormatted: text("status_formatted").notNull(),
  renewsAt: text("renews_at"),
  endsAt: text("ends_at"),
  trialEndsAt: text("trial_ends_at"),
  price: text("price").notNull(),
  isUsageBased: boolean("is_usage_based").default(false),
  isPaused: boolean("is_paused").default(false),
  subscriptionItemId: serial("subscription_item_id"),
  planId: text("plan_id").notNull(),
  userId: text("user_id").notNull(),
});

export const usages = pgTable("usage", {
  variantId: text("variant_id").notNull().unique(),
  userId: text("user_id").notNull().unique(),
  tokens: bigint({ mode: "number" }),
  resources: bigint({ mode: "number" }),
});
export const insertUsageSchema = createInsertSchema(usages).extend({}).omit({
  variantId: true,
  userId: true,
});

export const credits = pgTable("credit", {
  variantId: text("variant_id").notNull().unique(),
  userId: text("user_id").notNull().unique(),
  tokens: bigint({ mode: "number" }),
  resources: bigint({ mode: "number" }),
});
export const inserCreditSchema = createInsertSchema(credits).extend({}).omit({
  variantId: true,
  userId: true,
});

export type NewPlan = typeof plans.$inferInsert;
export type PlanType = typeof plans.$inferInsert;
export type NewWebhookEvent = typeof webhookEvents.$inferInsert;
export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type NewUsage = typeof usages.$inferInsert;
export type Usage = typeof usages.$inferSelect;

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  plan: one(plans, {
    fields: [subscriptions.userId],
    references: [plans.id],
  }),
}));
