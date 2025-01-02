import { LibraryIcon, MessageCircle } from "lucide-react";
import { Plan } from "../types/global";

export const navigationItems = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Features",
    href: "#pricing",
  },
  {
    title: "Pricing",
    href: "#pricing",
  },
];

export const sidebarMenuItems = [
  {
    title: "Chat",
    href: "/chat",
    icon: MessageCircle,
  },
  {
    title: "Library",
    href: "/library",
    icon: LibraryIcon,
  },
];

export const VARIANT_ID = {
  free: {
    monthly: 8,
    yearly: 7,
  },
  starter: {
    monthly: process.env.NODE_ENV === "production" ? 628042 : 563669,
    yearly: process.env.NODE_ENV === "production" ? 628043 : 563675,
  },
  growth: {
    monthly: process.env.NODE_ENV === "production" ? 628040 : 609557,
    yearly: process.env.NODE_ENV === "production" ? 628041 : 609566,
  },
  enterprise: {
    monthly: process.env.NODE_ENV === "production" ? 628220 : 628044,
    yearly: process.env.NODE_ENV === "production" ? 628222 : 628045,
  },
};

/* export const STARTER_TOKENS_LIMIT = 5000000 */

export const USAGE_LIMIT: UsageLimitType = {
  free: {
    tokens: 150000,
    resources: 10737418.24,
  },
  starter: {
    tokens: 1500000,
    resources: 2147483648,
  },
  growth: {
    tokens: 3000000,
    resources: 5368709120,
  },
  enterprise: {
    tokens: 5000000,
    resources: 10737418240,
  },
};

type UsageLimitType = {
  [K in Plan]: {
    tokens: number;
    resources: number;
  };
};
export const EMAILS_FREE_PLAN = ["ayoub.7codo@gmail.com"];

type Feature = {
  has: boolean;
  text: string;
  soon?: boolean;
};

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-US").format(num);
};

export const bytesToGB = (bytes: number) => {
  return (bytes / (1024 * 1024 * 1024)).toFixed(2); // Rounds to 3 decimal places
};

export const FREE_FEATURES: Feature[] = [
  {
    has: true,
    text: `${formatNumber(USAGE_LIMIT.free.tokens)} Tokens per month`,
  },

  {
    has: true,
    text: `${bytesToGB(USAGE_LIMIT.free.resources)}GB Resources per month`,
  },

  {
    has: false,
    text: "Gpt 4o access",
  },
  {
    has: false,
    text: "Change chat visibility",
  },
];

export const STARTER_FEATURES: Feature[] = [
  {
    has: true,
    text: `${formatNumber(USAGE_LIMIT.starter.tokens)} Tokens per month`,
  },

  {
    has: true,
    text: `${bytesToGB(USAGE_LIMIT.starter.resources)}GB Resources per month`,
  },

  {
    has: true,
    text: "Gpt 4o access",
  },
  {
    has: true,
    text: "Change chat visibility",
  },
];

export const GROWTH_FEATURES: Feature[] = [
  {
    has: true,
    text: `${formatNumber(USAGE_LIMIT.growth.tokens)} Tokens per month`,
  },

  {
    has: true,
    text: `${bytesToGB(USAGE_LIMIT.growth.resources)}GB Resources per month`,
  },

  {
    has: true,
    text: "Gpt 4o access",
  },
  {
    has: true,
    text: "Change chat visibility",
  },
];

export const ENTERPRISE_FEATURES: Feature[] = [
  {
    has: true,
    text: `${formatNumber(USAGE_LIMIT.enterprise.tokens)} Tokens per month`,
  },

  {
    has: true,
    text: `${bytesToGB(
      USAGE_LIMIT.enterprise.resources
    )}GB Resources per month`,
  },

  {
    has: true,
    text: "Gpt 4o access",
  },
  {
    has: true,
    text: "Change chat visibility",
  },
];

export const FREE_PLAN = [
  {
    id: "7",
    productId: 7,
    productName: "Free",
    variantId: 7,
    name: "Default",
    description: "",
    price: "0",
    isUsageBased: false,
    interval: "year",
    intervalCount: 1,
    trialInterval: null,
    trialIntervalCount: null,
    sort: 2,
  },
  {
    id: "8",
    productId: 7,
    productName: "Free",
    variantId: 7,
    name: "Default",
    description: "",
    price: "0",
    isUsageBased: false,
    interval: "month",
    intervalCount: 1,
    trialInterval: null,
    trialIntervalCount: null,
    sort: 2,
  },
];

export const FAQS = [
  {
    question: "What does Subreddify do?",
    answer: `Subreddify allows you to connect with Reddit communities by pulling posts and comments into an AI-powered chat. You can search for specific subreddits, select the type and number of posts to include, and chat with ChatGPT to gain insights, uncover pain points, and explore fresh ideas tailored to your needs.`,
  },
  {
    question: "How is this different from browsing Reddit directly?",
    answer: `Browsing Reddit can be overwhelming, with endless posts and comments to sift through. Subreddify simplifies the process by letting you focus only on the most relevant content. With advanced filters, custom search, and AI-driven conversations, you can save time and instantly extract actionable insights without manually reading through subreddit histories.`,
  },
  {
    question: "How do I choose which Reddit communities to pull content from?",
    answer: `You can search for communities using keywords that align with your interests or goals. For example, if you're interested in tech trends, search for subreddits like r/technology or r/gadgets. Once selected, you can further customize the type of posts (hot, new, rising, etc.) and the number of posts with comments to include in your knowledge base.`,
  },
  {
    question: "Can I update the knowledge base after starting a chat?",
    answer: `Yes! You can refresh your knowledge base anytime to include new posts and comments from the selected communities. This ensures your insights stay current and relevant as conversations evolve within your audience.`,
  },
  {
    question: "What types of insights can I get from Subreddify?",
    answer: `You can uncover pain points, identify solutions waiting to be built, discover breakout niches, and generate content ideas. For example, you might learn about unmet needs in a niche market or gain inspiration for a blog post or product idea based on community discussions.`,
  },
  {
    question: "Is the AI always accurate in responding to my questions?",
    answer: `The AI bases its responses on the posts and comments you’ve selected. While it provides contextually relevant answers, the quality of insights depends on the relevance of the data you’ve pulled from Reddit. You can refine your knowledge base anytime for more precise answers.`,
  },
  {
    question: "What types of posts can I filter?",
    answer: `You can filter posts by categories such as “hot,” “new,” “top,” “controversial,” or “rising.” This lets you tailor the content to match your specific research or engagement goals.`,
  },
  {
    question: "How do I get started?",
    answer: `It’s simple! Create an account, search for relevant Reddit communities, select the type and number of posts to pull, and start chatting. The AI will use the data you’ve gathered to provide intelligent, context-driven responses to your questions.`,
  },
];
