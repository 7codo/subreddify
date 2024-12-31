"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChatRequestOptions, CreateMessage, Message } from "ai";
import { memo } from "react";

const suggestedActions = [
  {
    title: "Summarize Reddit Posts",
    label: "What are the main points of this post?",
    action:
      "Summarize the key takeaways from the selected Reddit post and its comments.",
  },

  {
    title: "Identify Common Themes",
    label: "What are people frequently mentioning?",
    action:
      "Analyze the comments on the selected Reddit post to find recurring themes or opinions.",
  },

  {
    title: "Generate Follow-Up Questions",
    label: "What should I ask next?",
    action:
      "Based on this Reddit post, suggest insightful questions I can ask to learn more about the topic.",
  },

  {
    title: "Provide Context or Background",
    label: "Explain the topic of this post.",
    action:
      "Explain the context or background information related to the selected Reddit post for better understanding.",
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
    <div className="grid sm:grid-cols-2 gap-2 w-full">
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
