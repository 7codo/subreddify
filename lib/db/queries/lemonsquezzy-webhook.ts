import { db } from "@/lib/config/drizzle";
import { configureLemonSqueezy } from "@/lib/config/lemonsqueezy";
import { USAGE_LIMIT, VARIANT_ID } from "@/lib/constants";
import {
  credits,
  plans,
  subscriptions,
  usages,
  WebhookEvent,
  webhookEvents,
  type NewSubscription,
} from "@/lib/db/schemas";
import { webhookHasData, webhookHasMeta } from "@/lib/types/typeguards";
import { log } from "@/lib/utils/log";
import { clerkClient } from "@clerk/nextjs/server";
import { getPrice, updateSubscription } from "@lemonsqueezy/lemonsqueezy.js";
import { and, eq } from "drizzle-orm";
/**
 * This action will process a webhook event in the database.
 */
export async function processWebhookEvent(webhookEvent: WebhookEvent) {
  configureLemonSqueezy();

  const dbwebhookEvent = await db
    .select()
    .from(webhookEvents)
    .where(eq(webhookEvents.id, webhookEvent.id));

  if (dbwebhookEvent.length < 1) {
    throw new Error(
      `Webhook event #${webhookEvent.id} not found in the database.`
    );
  }

  if (!process.env.WEBHOOK_URL) {
    throw new Error(
      "Missing required WEBHOOK_URL env variable. Please, set it in your .env file."
    );
  }

  let processingError = "";
  const eventBody: any = webhookEvent.body;

  if (!webhookHasMeta(eventBody)) {
    processingError = "Event body is missing the 'meta' property.";
  } else if (webhookHasData(eventBody)) {
    if (webhookEvent.eventName.startsWith("subscription_payment_")) {
      // Save subscription invoices; eventBody is a SubscriptionInvoice
      // Not implemented.
    } else if (webhookEvent.eventName.startsWith("subscription_")) {
      // Save subscription events; obj is a Subscription
      const attributes = eventBody.data.attributes;
      const variantId = attributes.variant_id as string;

      // We assume that the Plan table is up to date.
      const plan = await db
        .select()
        .from(plans)
        .where(eq(plans.variantId, parseInt(variantId, 10)));

      if (plan.length < 1) {
        processingError = `Plan with variantId ${variantId} not found.`;
      } else {
        // Update the subscription in the database.

        const priceId = attributes.first_subscription_item.price_id;

        // Get the price data from Lemon Squeezy.
        const priceData = await getPrice(priceId);
        if (priceData.error) {
          processingError = `Failed to get the price data for the subscription ${eventBody.data.id}.`;
        }

        const isUsageBased = attributes.first_subscription_item.is_usage_based;
        const price = isUsageBased
          ? priceData.data?.data.attributes.unit_price_decimal
          : priceData.data?.data.attributes.unit_price;

        const userId = eventBody.meta.custom_data.user_id;
        const planId = plan[0].id;
        const status = attributes.status as string;

        const updateData: NewSubscription = {
          lemonSqueezyId: eventBody.data.id,
          orderId: attributes.order_id as number,
          name: attributes.user_name as string,
          email: attributes.user_email as string,
          status,
          statusFormatted: attributes.status_formatted as string,
          renewsAt: attributes.renews_at as string,
          endsAt: attributes.ends_at as string,
          trialEndsAt: attributes.trial_ends_at as string,
          price: price?.toString() ?? "",
          isPaused: false,
          subscriptionItemId: attributes.first_subscription_item.id,
          isUsageBased: attributes.first_subscription_item.is_usage_based,
          userId,
          planId,
        };

        // Create/update subscription in the database.
        try {
          let usage = (await db.query.usages.findFirst({
            where: eq(usages.userId, userId),
          })) ?? { tokens: 0, resources: 0 };

          const client = await clerkClient();
          if (status == "active") {
            await client.users.updateUserMetadata(userId, {
              publicMetadata: {
                variantId,
              },
            });
          } else {
            await client.users.updateUserMetadata(userId, {
              publicMetadata: {
                variantId: null,
              },
            });
          }

          await db.insert(subscriptions).values(updateData).onConflictDoUpdate({
            target: subscriptions.lemonSqueezyId,
            set: updateData,
          });
          if (
            webhookEvent.eventName === "subscription_updated" ||
            webhookEvent.eventName === "subscription_created"
          ) {
            const userSubs: NewSubscription[] = await db
              .select()
              .from(subscriptions)
              .where(eq(subscriptions.userId, userId));

            // Add logging to debug
            console.log("Found user subscriptions:", userSubs);

            const previousActiveSub = userSubs.find((sub) => {
              // More explicit status check
              const isActive = sub.status.toLowerCase() === "active";
              const isDifferentPlan = sub.planId !== planId;
              return isActive && isDifferentPlan;
            });

            console.log("previous active subscription:", previousActiveSub);

            if (previousActiveSub) {
              //UPGRADE
              const previousPlan = await db.query.plans.findFirst({
                where: eq(plans.id, previousActiveSub.planId),
              });
              if (!previousPlan) return;

              // Get current usage and credits
              const currentUsage = await db.query.usages.findFirst({
                where: eq(usages.userId, userId),
              });

              let previousPlanCreditList = await db.query.credits.findFirst({
                where: and(
                  eq(credits.userId, userId),
                  eq(credits.variantId, String(previousPlan.variantId))
                ),
              });
              const previousPlanCredit = {
                tokens: previousPlanCreditList?.tokens ?? 0,
                resources: previousPlanCreditList?.resources ?? 0,
              };

              // Calculate new plan credits
              let newPlanLimits = {
                tokens: USAGE_LIMIT["free"].tokens,
                resources: USAGE_LIMIT["free"].resources,
              };

              // Determine new plan limits
              switch (Number(variantId)) {
                case VARIANT_ID.starter.monthly:
                case VARIANT_ID.starter.yearly:
                  newPlanLimits = USAGE_LIMIT["starter"];
                  break;
                case VARIANT_ID.growth.monthly:
                case VARIANT_ID.growth.yearly:
                  newPlanLimits = USAGE_LIMIT["growth"];
                  break;
                case VARIANT_ID.enterprise.monthly:
                case VARIANT_ID.enterprise.yearly:
                  newPlanLimits = USAGE_LIMIT["enterprise"];
                  break;
              }

              // Calculate remaining credits from previous plan
              const remainingCredits = {
                tokens: previousPlanCredit
                  ? Math.max(
                      0,
                      previousPlanCredit.tokens - (currentUsage?.tokens || 0)
                    )
                  : 0,
                resources: previousPlanCredit
                  ? Math.max(
                      0,
                      previousPlanCredit.resources -
                        (currentUsage?.resources || 0)
                    )
                  : 0,
              };

              // Set new total credits (remaining + new plan credits)
              const newTotalCredits = {
                tokens: remainingCredits.tokens + newPlanLimits.tokens,
                resources: remainingCredits.resources + newPlanLimits.resources,
              };

              // Reset usage for the new billing period
              await db
                .update(usages)
                .set({
                  userId,
                  variantId: String(variantId),
                  tokens: 0,
                  resources: 0,
                })
                .where(eq(usages.userId, userId));

              // Update credits with carried over amount plus new plan credits
              await db
                .insert(credits)
                .values({
                  userId,
                  variantId,
                  tokens: newTotalCredits.tokens,
                  resources: newTotalCredits.resources,
                })
                .onConflictDoUpdate({
                  target: [credits.userId, credits.variantId],
                  set: {
                    tokens: newTotalCredits.tokens,
                    resources: newTotalCredits.resources,
                  },
                });

              try {
                const returnedSub = await updateSubscription(
                  previousActiveSub.lemonSqueezyId,
                  {
                    pause: {
                      mode: "void",
                    },
                  }
                );

                // Update the db
                await db
                  .update(subscriptions)
                  .set({
                    status: returnedSub.data?.data.attributes.status,
                    statusFormatted:
                      returnedSub.data?.data.attributes.status_formatted,
                    endsAt: returnedSub.data?.data.attributes.ends_at,
                    isPaused: returnedSub.data?.data.attributes.pause !== null,
                  })
                  .where(
                    eq(
                      subscriptions.lemonSqueezyId,
                      previousActiveSub.lemonSqueezyId
                    )
                  );
                console.log(
                  `Successfully paused subscription: ${previousActiveSub.lemonSqueezyId}`
                );
              } catch (error) {
                console.error(
                  `Failed to pause subscription ${previousActiveSub.lemonSqueezyId}:`,
                  error
                );
                throw error; // Re-throw to handle in calling code
              }
            }
          }
        } catch (error) {
          processingError = `Failed to upsert Subscription #${updateData.lemonSqueezyId} to the database.`;
          log.error(
            `Failed to upsert Subscription #${
              updateData.lemonSqueezyId
            } to the database. Error: ${JSON.stringify(error)}`
          );
        }
      }
    } else if (webhookEvent.eventName.startsWith("order_")) {
      // Save orders; eventBody is a "Order"
      /* Not implemented */
    } else if (webhookEvent.eventName.startsWith("license_")) {
      // Save license keys; eventBody is a "License key"
      /* Not implemented */
    }

    // Update the webhook event in the database.
    await db
      .update(webhookEvents)
      .set({
        processed: true,
        processingError,
      })
      .where(eq(webhookEvents.id, webhookEvent.id));
  }
}
