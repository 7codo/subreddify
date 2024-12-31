"use server";
import { and, eq, arrayContains, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/config/drizzle";
import { safeAction } from "@/lib/utils/safe-action";
import { notifications } from "../schemas";

// Define input schema for markNotificationAsRead
const MarkNotificationSchema = z.object({
  notificationId: z.number(),
});

export const getUnreadNotifications = safeAction.action(async ({ ctx }) => {
  const notificationsList = await db.query.notifications.findMany({
    where: (notifications, { not }) =>
      not(arrayContains(notifications.readBy, [ctx.userId])),
    orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
  });
  return notificationsList;
});

export const markNotificationAsRead = safeAction
  .schema(MarkNotificationSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { notificationId } = parsedInput;

    const notification = await db.query.notifications.findFirst({
      where: eq(notifications.id, notificationId),
    });

    if (!notification) {
      throw new Error("Notification not found");
    }

    // Update readBy array without duplicates
    const updatedReadBy = Array.from(
      new Set([...(notification.readBy || []), ctx.userId])
    );

    const updatedNotification = await db
      .update(notifications)
      .set({
        readBy: updatedReadBy,
        updatedAt: new Date(),
      })
      .where(eq(notifications.id, notificationId))
      .returning();

    revalidatePath("/chat");
    return updatedNotification[0];
  });
