import { Subscription } from "@lemonsqueezy/lemonsqueezy.js";

export type SearchParams = Promise<{ [key: string]: string | undefined }>;

export type Plan = "free" | "starter" | "growth" | "enterprise";

export type SubscriptionStatusType =
  Subscription["data"]["attributes"]["status"];

export interface RedditComment {
  body: string;
  author: string;
  chatId: string;
  score: number;
  created: number;
  depth?: number;
  replies?: RedditComment[];
}

export interface RedditPost {
  title: string;
  selftext: string;
  author: string;
  chatId: string;
  subreddit: string;
  score: number;
  created: number;
  permalink: string;
  num_comments: number;
  comments: RedditComment[];
}

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      variantId?: string;
      freeTrialEndDate?: string;
    };
  }
}

SubscriptionStatusType;
