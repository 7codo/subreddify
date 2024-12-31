import { auth } from "@clerk/nextjs/server";
import { APIEmbedField } from "discord-api-types/v10";

import { getCurrentPlanName } from "@/lib/actions";
import { DiscordClient } from "@/lib/utils/discord-client";
import { log } from "@/lib/utils/log";

export async function POST(req: Request) {
  try {
    const {
      title,
      description,
      fields,
    }: { title: string; description: string; fields: Array<APIEmbedField> } =
      await req.json();
    const { userId } = await auth();
    const planName = (await getCurrentPlanName())?.data;

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const discrod = new DiscordClient();
    discrod.sendEmbed({
      title,
      description,
      fields: [
        ...fields,
        {
          name: "Plan Name",
          value: planName ?? "not subscribe",
          inline: true,
        },
        {
          name: "User id",
          value: userId,
          inline: true,
        },
      ],
    });
    return new Response("OK", { status: 200 });
  } catch (error: any) {
    log.error(error.message);
    return new Response("Internal Server Error", { status: 500 });
  }
}
