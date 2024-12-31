import { auth } from "@clerk/nextjs/server";

import { getChatsByUserId } from "@/lib/db/queries";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return Response.json("Unauthorized!", { status: 401 });
  }

  // biome-ignore lint: Forbidden non-null assertion.
  const chats = (await getChatsByUserId({ limit: 12 }))?.data;
  return Response.json(chats);
}
