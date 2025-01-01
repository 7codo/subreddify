"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChatRequestOptions, CreateMessage, Message } from "ai";
import { memo } from "react";

const suggestedActions = [
  {
    title: "Identify Challenges",
    label: "Ask to uncover key pain points and areas of improvement.",
    action: "Could you share what challenges users often encounter?",
  },
  {
    title: "Decision Drivers",
    label: "Ask to understand what influences their decisions.",
    action: "What factors do you think influence decisions in this space?",
  },
  {
    title: "Engagement Preferences",
    label: "Ask to discover how they prefer to interact with businesses.",
    action: "How do people typically prefer to engage with businesses?",
  },
  {
    title: "Solution Priorities",
    label: "Ask to identify the most important factors in choosing a solution.",
    action: "What do you think users value most in a solution?",
  },
];

interface SuggestedActionsProps {
  chatId: string;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>;
}

function PureSuggestedActions({ chatId, append }: SuggestedActionsProps) {
  return (
    <div className="grid sm:grid-cols-2 grid-cols-1 gap-2 w-full">
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? "hidden sm:block" : "block"}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              window.history.replaceState({}, "", `/chat/${chatId}`);

              append({
                role: "user",
                content: suggestedAction.action,
              });
            }}
            className="text-left border rounded-xl px-4 py-3.5 text-sm flex-1 gap-1 flex-col w-full h-auto justify-start items-start"
          >
            <span className="font-medium">{suggestedAction.title}</span>
            <span className="text-muted-foreground truncate w-full">
              {suggestedAction.label}
            </span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);
