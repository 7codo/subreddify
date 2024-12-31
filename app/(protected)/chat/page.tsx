import { cookies } from "next/headers";

import { Chat } from "@/app/(protected)/chat/_components/chat";
import { DEFAULT_MODEL_NAME, models } from "@/lib/ai/models";
import { generateUUID } from "@/lib/utils";
import { DataStreamHandler } from "@/app/(protected)/chat/_components/data-stream-handler";
import { ChatSettings } from "./_components/subreddit/chat-settings";
import PageWrapper from "@/components/page-wrapper";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatHeader } from "./_components/chat-header";
import { getCurrentPlanName } from "@/lib/actions";
import { createMetadata } from "@/lib/constants/metadata";

export const metadata = createMetadata({
  title: "Chat with your target audience",
  description: "Chat with Your Target Audience on Reddit—Effortlessly.",
});

export default async function Page() {
  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get("model-id")?.value;

  const selectedModelId =
    models.find((model) => model.id === modelIdFromCookie)?.id ||
    DEFAULT_MODEL_NAME;
  const currentPlanName = (await getCurrentPlanName())?.data ?? "free";

  return (
    <PageWrapper
      rightChildren={
        <ChatHeader
          chatId={id}
          selectedModelId={
            currentPlanName === "free" ? DEFAULT_MODEL_NAME : selectedModelId
          }
          selectedVisibilityType={"private"}
          isReadonly={false}
          currentPlanName={currentPlanName}
        />
      }
    >
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        selectedModelId={selectedModelId}
        isReadonly={false}
      />
      <DataStreamHandler id={id} />
      <ChatSettings openDialog={true} id={id} />
    </PageWrapper>
  );
}
