import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { Chat } from "@/app/(protected)/chat/_components/chat";
import { DEFAULT_MODEL_NAME, models } from "@/lib/ai/models";
import {
  getChatById,
  getMessagesByChatId,
  listCommentsByChatId,
  listPostsByChatId,
} from "@/lib/db/queries";
import { convertToUIMessages } from "@/lib/utils";
import { DataStreamHandler } from "@/app/(protected)/chat/_components/data-stream-handler";
import { auth } from "@clerk/nextjs/server";
import { ChatHeader } from "../_components/chat-header";
import PageWrapper from "@/components/page-wrapper";
import { ChatSettingsPanel } from "../_components/chat-settings-panel";
import { getCurrentPlanName } from "@/lib/actions";
import { createMetadata } from "@/lib/constants/metadata";

export const metadata = createMetadata({
  title: "Chat with your target audience",
  description: "Chat with Your Target Audience on Reddit—Effortlessly.",
});
export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = (await getChatById({ id }))?.data;

  if (!chat) {
    notFound();
  }

  const { userId } = await auth();

  if (chat.visibility === "private") {
    if (!userId) {
      return notFound();
    }

    if (userId !== chat.userId) {
      return notFound();
    }
  }

  const messagesFromDb = (
    await getMessagesByChatId({
      id,
    })
  )?.data;
  if (!messagesFromDb) {
    return notFound();
  }
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
          selectedVisibilityType={
            currentPlanName === "free" ? "private" : chat.visibility
          }
          isReadonly={userId !== chat.userId}
          currentPlanName={currentPlanName}
        />
      }
    >
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        selectedModelId={selectedModelId}
        isReadonly={userId !== chat.userId}
      />

      <DataStreamHandler id={id} />
    </PageWrapper>
  );
}
