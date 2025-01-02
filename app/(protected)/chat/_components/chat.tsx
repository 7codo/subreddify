"use client";

import { ChatRequestOptions, type Attachment, type Message } from "ai";
import { useChat } from "ai/react";
import { useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";

import type { SelectCommentType, SelectPostType, Vote } from "@/lib/db/schemas";
import { fetcher } from "@/lib/utils";

import { useBlockSelector } from "@/hooks/use-block";
import { handleSubmitResources } from "@/lib/actions";
import { saveUsage } from "@/lib/db/queries";
import { useChatStore } from "@/lib/stores/chat-store";
import { handleError } from "@/lib/utils/error-handler";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useWindowSize } from "usehooks-ts";
import { Block } from "./block";
import { ChatSettingsPanel } from "./chat-settings-panel";
import { LoadingDialog } from "./loading-dialog";
import { Messages } from "./messages";
import { MultimodalInput } from "./multimodal-input";

export type HandleSubmitType = {
  chatRequestOptions?: ChatRequestOptions;
  appendMessage?: string;
};

export function Chat({
  id,
  initialMessages,
  selectedModelId,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedModelId: string;
  isReadonly: boolean;
}) {
  const { mutate } = useSWRConfig();
  const posts = useChatStore((state) => state.posts);
  const setPosts = useChatStore((state) => state.setPosts);
  const comments = useChatStore((state) => state.comments);
  const setComments = useChatStore((state) => state.setComments);
  const showSettingsPanel = useChatStore((state) => state.showSettingsPanel);
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 768;
  const [savingResources, setSavingResources] = useState(false);
  const [progress, setProgress] = useState(0);
  const suggestAction = useChatStore((state) => state.suggestAction);
  const setSuggestAction = useChatStore((state) => state.setSuggestAction);
  const { data: resources } = useSWR<{
    comments: SelectCommentType[];
    posts: SelectPostType[];
  }>(id ? `/api/resources?chatId=${id}` : null, fetcher, {
    fallbackData: { comments: [], posts: [] },
  });

  const setShowSettingsPanel = useChatStore(
    (state) => state.setShowSettingsPanel
  );
  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    reload,
  } = useChat({
    id,
    body: { id, modelId: selectedModelId, posts, comments },
    initialMessages,
    experimental_throttle: 100,
    onFinish: async (_, { usage }) => {
      console.log("messages.length", messages.length);
      if (messages.length === 0) {
        mutate("/api/history");
        setPosts([]);
        setComments([]);
        mutate("/api/resources");
      }
      const totalTokens = usage.totalTokens;
      const [saved, error] = await handleError(
        saveUsage({ tokens: totalTokens }),
        {
          path: "onFinish streaming",
        }
      );
    },
    onError: (error: Error) => {
      if (error.message === "Resource not found") {
        toast.error("Please add some resources to get started!");
        setShowSettingsPanel(true);
      }
      if (error.message === "LIMIT_REACHED") {
        toast.error("Your limit has been exceeded. Please upgrade your plan.");
      }
    },
  });

  const { data: votes } = useSWR<Array<Vote>>(
    `/api/vote?chatId=${id}`,
    fetcher
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isBlockVisible = useBlockSelector((state) => state.isVisible);

  useEffect(() => {
    const handleSuggestedAction = async () => {
      if (!suggestAction) return;
      console.log("suggestAction", suggestAction);
      await onSubmit({ appendMessage: suggestAction });
    };

    handleSuggestedAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestAction]);

  useEffect(() => {
    if (!savingResources) return;

    const eventSource = new EventSource(`/api/progress?chatId=${id}`);

    eventSource.addEventListener("progress", (event) => {
      const data = JSON.parse(event.data);
      setProgress(data.progress);
    });

    return () => {
      eventSource.close();
    };
  }, [savingResources, id]);

  async function onSubmit({
    appendMessage,
    chatRequestOptions,
  }: HandleSubmitType) {
    console.log("messages.length", messages.length);
    const resourcesList = resources ? resources : { comments: [], posts: [] };
    console.log("resourcesList", resourcesList);
    if (resourcesList.posts.length > 0) {
      console.log("there is resources and submit");
      handleSubmit(undefined, chatRequestOptions);
    } else {
      setSavingResources(true);
      setProgress(0);
      const result = await handleSubmitResources({
        messages,
        id,
        input: appendMessage ?? input,
        posts,
        comments,
      });
      setInput("");
      setProgress(0);
      if (result.status === "success" && result.data) {
        append(result.data);
      } else if (result.status === "error") {
        switch (result.type) {
          case "NO_POSTS_FOUND":
            toast.error("Please add some resources to get started!");
            setShowSettingsPanel(true);
            break;
        }
      }
      appendMessage && setSuggestAction("");
      setSavingResources(false);
    }
  }

  return (
    <>
      <div className="flex items-center max-h-[calc(100dvh_-_3rem)] h-[calc(100dvh_-_4.55rem)] w-full">
        <div className="flex flex-col min-w-0 h-full flex-1">
          <Messages
            chatId={id}
            isLoading={isLoading}
            votes={votes}
            messages={messages}
            setMessages={setMessages}
            reload={reload}
            isReadonly={isReadonly}
            isBlockVisible={isBlockVisible}
          />

          <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
            {!isReadonly && (
              <MultimodalInput
                chatId={id}
                input={input}
                setInput={setInput}
                handleSubmit={onSubmit}
                isLoading={isLoading}
                stop={stop}
                attachments={attachments}
                setAttachments={setAttachments}
                messages={messages}
                setMessages={setMessages}
                append={append}
              />
            )}
          </form>
        </div>

        <AnimatePresence initial={false}>
          {showSettingsPanel && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3 }}
              className="h-full w-1/3 border-l"
            >
              <ChatSettingsPanel id={id} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Block
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={onSubmit}
        isLoading={isLoading}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        votes={votes}
        isReadonly={isReadonly}
      />
      <LoadingDialog open={savingResources} progress={progress} />
    </>
  );
}
