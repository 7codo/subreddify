import { listCommentsByChatId, listPostsByChatId } from "@/lib/db/queries";
import { auth } from "@clerk/nextjs/server";

// app/api/resources/route.ts
export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("chatId");
  if (!chatId)
    return Response.json({
      error: "no chat id provided",
      status: 400,
    });
  const posts = (await listPostsByChatId({ chatId }))?.data ?? [];
  const comments = (await listCommentsByChatId({ chatId }))?.data ?? [];

  return Response.json({ posts, comments });
}
