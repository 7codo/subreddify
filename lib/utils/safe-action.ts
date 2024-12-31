import { currentUser } from "@clerk/nextjs/server";
import { createSafeActionClient } from "next-safe-action";
import { redirect } from "next/navigation";
import { log } from "./log";

export const safeAction = createSafeActionClient({
  handleServerError(e) {
    if (e instanceof Error) {
      log.error(e.message);
    }
    throw e;
  },
}).use(async ({ next }) => {
  const user = await currentUser();
  const variantId = user?.publicMetadata.variantId;
  if (!user) {
    redirect("/");
  }
  const userId = user.id;

  const email = user.emailAddresses[0].emailAddress;

  if (!email || !userId) {
    redirect("/");
  }

  return next({
    ctx: {
      userId,
      email,
      variantId: String(variantId),
    },
  });
});

export const actionClient = createSafeActionClient();
