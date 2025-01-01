"use server";
import { configureLemonSqueezy } from "@/lib/config/lemonsqueezy";
import { takeUniqueOrThrow } from "@/lib/utils";
import {
  cancelSubscription,
  createCheckout,
  createWebhook,
  getPrice,
  getProduct,
  getSubscription,
  listPrices,
  listProducts,
  listWebhooks,
  updateSubscription,
  type Variant,
} from "@lemonsqueezy/lemonsqueezy.js";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { z } from "zod";
import {
  credits,
  inserCreditSchema,
  insertUsageSchema,
  plans,
  subscriptions,
  usages,
  WebhookEvent,
  webhookEvents,
  type NewPlan,
  type NewSubscription,
  type NewWebhookEvent,
} from "@/lib/db/schemas";
import { safeAction } from "@/lib/utils/safe-action";
import { db } from "@/lib/config/drizzle";
import { useUser } from "@clerk/nextjs";
import { webhookHasData, webhookHasMeta } from "@/lib/types/typeguards";
import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { log } from "@/lib/utils/log";
import { FREE_PLAN, USAGE_LIMIT, VARIANT_ID } from "@/lib/constants";

export async function listPlans() {
  const relatedPlans = await db.query.plans.findMany();
  return [...relatedPlans, ...FREE_PLAN];
}

export const getPlanById = safeAction
  .schema(z.object({ id: z.string() }))
  .action(async ({ parsedInput }) => {
    const plan = await db.query.plans.findFirst({
      where: eq(plans.id, parsedInput.id),
    });

    if (!plan) {
      throw new Error("plan not found or access denied");
    }

    return plan;
  });

/**
 * This action will create a checkout on Lemon Squeezy.
 */

export const getCheckoutURL = safeAction
  .schema(
    z.object({ variantId: z.number(), embed: z.boolean().default(false) })
  )
  .action(async ({ ctx, parsedInput }) => {
    configureLemonSqueezy();
    const { variantId, embed } = parsedInput;
    const { userId, email } = ctx;

    const checkout = await createCheckout(
      process.env.LEMONSQUEEZY_STORE_ID!,
      variantId,
      {
        checkoutOptions: {
          embed,
          media: false,
          logo: !embed,
        },
        checkoutData: {
          email,
          custom: {
            user_id: userId,
          },
        },
        productOptions: {
          enabledVariants: [variantId],
          redirectUrl: `${process.env.NEXT_PUBLIC_APP_EXTERNAL_URL}/settings/subscriptions`,
          receiptButtonText: "Go to Dashboard",
          receiptThankYouNote: "Thank you for signing up to Lemon Stand!",
        },
      }
    );

    return checkout.data?.data.attributes.url;
  });

/**
 * This action will check if a webhook exists on Lemon Squeezy. It will return
 * the webhook if it exists, otherwise it will return undefined.
 */
export async function hasWebhook() {
  configureLemonSqueezy();

  if (!process.env.WEBHOOK_URL) {
    throw new Error(
      "Missing required WEBHOOK_URL env variable. Please, set it in your .env file."
    );
  }

  // Check if a webhook exists on Lemon Squeezy.
  const allWebhooks = await listWebhooks({
    filter: { storeId: process.env.LEMONSQUEEZY_STORE_ID },
  });

  // Check if WEBHOOK_URL ends with a slash. If not, add it.
  let webhookUrl = process.env.WEBHOOK_URL;
  if (!webhookUrl.endsWith("/")) {
    webhookUrl += "/";
  }
  webhookUrl += "api/webhooks/billing";

  const webhook = allWebhooks.data?.data.find(
    (wh) => wh.attributes.url === webhookUrl && wh.attributes.test_mode
  );
  return webhook;
}

/**
 * This action will set up a webhook on Lemon Squeezy to listen to
 * Subscription events. It will only set up the webhook if it does not exist.
 */
export async function setupWebhook() {
  configureLemonSqueezy();

  if (!process.env.WEBHOOK_URL) {
    throw new Error(
      "Missing required WEBHOOK_URL env variable. Please, set it in your .env file."
    );
  }

  // Check if WEBHOOK_URL ends with a slash. If not, add it.
  let webhookUrl = process.env.WEBHOOK_URL;
  if (!webhookUrl.endsWith("/")) {
    webhookUrl += "/";
  }
  webhookUrl += "api/webhooks/billing";

  // Do not set a webhook on Lemon Squeezy if it already exists.
  let webhook = await hasWebhook();

  // If the webhook does not exist, create it.
  if (!webhook) {
    const newWebhook = await createWebhook(process.env.LEMONSQUEEZY_STORE_ID!, {
      secret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET!,
      url: webhookUrl,
      testMode: true, // will create a webhook in Test mode only!
      events: [
        "subscription_created",
        "subscription_expired",
        "subscription_updated",
      ],
    });

    webhook = newWebhook.data?.data;
  }
}

/**
 * This action will sync the product variants from Lemon Squeezy with the
 * Plans database model. It will only sync the 'subscription' variants.
 */
export async function syncPlans() {
  configureLemonSqueezy();

  // Fetch all the variants from the database.
  const productVariants: NewPlan[] = await db.select().from(plans);

  // Helper function to add a variant to the productVariants array and sync it with the database.
  async function _addVariant(variant: NewPlan) {
    // Sync the variant with the plan in the database.
    await db
      .insert(plans)
      .values(variant)
      .onConflictDoUpdate({ target: plans.variantId, set: variant });

    productVariants.push(variant);
  }

  // Fetch products from the Lemon Squeezy store.
  const products = await listProducts({
    filter: { storeId: process.env.LEMONSQUEEZY_STORE_ID },
    include: ["variants"],
  });

  // Loop through all the variants.
  const allVariants = products.data?.included as Variant["data"][] | undefined;

  // for...of supports asynchronous operations, unlike forEach.
  if (allVariants) {
    for (const v of allVariants) {
      const variant = v.attributes;

      // Skip draft variants or if there's more than one variant, skip the default
      // variant. See https://docs.lemonsqueezy.com/api/variants
      if (variant.status === "draft") {
        // `return` exits the function entirely, not just the current iteration.
        continue;
      }

      // Fetch the Product name.
      const productName =
        (await getProduct(variant.product_id)).data?.data.attributes.name ?? "";

      // Fetch the Price object.
      const variantPriceObject = await listPrices({
        filter: {
          variantId: v.id,
        },
      });

      const currentPriceObj = variantPriceObject.data?.data.at(0);
      const isUsageBased =
        currentPriceObj?.attributes.usage_aggregation !== null;
      const interval = currentPriceObj?.attributes.renewal_interval_unit;
      const intervalCount =
        currentPriceObj?.attributes.renewal_interval_quantity;
      const trialInterval = currentPriceObj?.attributes.trial_interval_unit;
      const trialIntervalCount =
        currentPriceObj?.attributes.trial_interval_quantity;

      const price = isUsageBased
        ? currentPriceObj?.attributes.unit_price_decimal
        : currentPriceObj.attributes.unit_price;

      const priceString = price !== null ? price?.toString() ?? "" : "";

      const isSubscription =
        currentPriceObj?.attributes.category === "subscription";

      // If not a subscription, skip it.
      if (!isSubscription) {
        continue;
      }

      await _addVariant({
        name: variant.name,
        description: variant.description,
        price: priceString,
        interval,
        intervalCount,
        isUsageBased,
        productId: variant.product_id,
        productName,
        variantId: parseInt(v.id) as unknown as number,
        trialInterval,
        trialIntervalCount,
        sort: variant.sort,
      });
    }
  }
  return productVariants;
}

/**
 * This action will store a webhook event in the database.
 * @param eventName - The name of the event.
 * @param body - The body of the event.
 */
export async function storeWebhookEvent(
  eventName: string,
  body: NewWebhookEvent["body"]
) {
  const returnedValue = await db
    .insert(webhookEvents)
    .values({
      eventName,
      processed: false,
      body,
    })
    .onConflictDoNothing({ target: plans.id })
    .returning();

  return returnedValue[0];
}

/**
 * This action will get the subscriptions for the current user.
 */

export const getUserSubscriptions = safeAction.action(
  async ({ ctx, parsedInput }) => {
    const userSubscriptions: NewSubscription[] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, ctx.userId));
    return userSubscriptions;
  }
);

/**
 * This action will get the subscription URLs (update_payment_method and
 * customer_portal) for the given subscription ID.
 *
 */
export async function getSubscriptionURLs(id: string) {
  configureLemonSqueezy();
  const subscription = await getSubscription(id);

  if (subscription.error) {
    throw new Error(subscription.error.message);
  }
  return subscription.data.data.attributes.urls;
}

/**
 * This action will cancel a subscription on Lemon Squeezy.
 */
export async function cancelSub(id: string) {
  configureLemonSqueezy();

  // Get user subscriptions
  const userSubscriptions = (await getUserSubscriptions())?.data ?? [];
  // Check if the subscription exists
  const subscription = userSubscriptions.find(
    (sub) => sub.lemonSqueezyId === id
  );

  if (!subscription) {
    throw new Error(`Subscription #${id} not found.`);
  }

  const cancelledSub = await cancelSubscription(id);

  if (cancelledSub.error) {
    throw new Error(cancelledSub.error.message);
  }

  // Update the db
  try {
    await db
      .update(subscriptions)
      .set({
        status: cancelledSub.data.data.attributes.status,
        statusFormatted: cancelledSub.data.data.attributes.status_formatted,
        endsAt: cancelledSub.data.data.attributes.ends_at,
      })
      .where(eq(subscriptions.lemonSqueezyId, id));
  } catch (error) {
    throw new Error(`Failed to cancel Subscription #${id} in the database.`);
  }

  revalidatePath("/settings/subscriptions");
  revalidatePath("/settings/subscriptions/plans");
  return cancelledSub;
}

/**
 * This action will pause a subscription on Lemon Squeezy.
 */
export async function pauseUserSubscription(id: string) {
  configureLemonSqueezy();

  // Get user subscriptions
  const userSubscriptions = (await getUserSubscriptions())?.data ?? [];

  // Check if the subscription exists
  const subscription = userSubscriptions.find(
    (sub) => sub.lemonSqueezyId === id
  );

  if (!subscription) {
    throw new Error(`Subscription #${id} not found.`);
  }

  const returnedSub = await updateSubscription(id, {
    pause: {
      mode: "void",
    },
  });

  // Update the db
  try {
    await db
      .update(subscriptions)
      .set({
        status: returnedSub.data?.data.attributes.status,
        statusFormatted: returnedSub.data?.data.attributes.status_formatted,
        endsAt: returnedSub.data?.data.attributes.ends_at,
        isPaused: returnedSub.data?.data.attributes.pause !== null,
      })
      .where(eq(subscriptions.lemonSqueezyId, id));
  } catch (error) {
    throw new Error(`Failed to pause Subscription #${id} in the database.`);
  }

  revalidatePath("/settings/subscriptions");
  revalidatePath("/settings/subscriptions/plans");
  return returnedSub;
}

/**
 * This action will unpause a subscription on Lemon Squeezy.
 */
export async function unpauseUserSubscription(id: string) {
  configureLemonSqueezy();

  // Get user subscriptions
  const userSubscriptions = (await getUserSubscriptions())?.data ?? [];

  // Check if the subscription exists
  const subscription = userSubscriptions.find(
    (sub) => sub.lemonSqueezyId === id
  );

  if (!subscription) {
    throw new Error(`Subscription #${id} not found.`);
  }

  const returnedSub = await updateSubscription(id, { pause: null });

  // Update the db
  try {
    await db
      .update(subscriptions)
      .set({
        status: returnedSub.data?.data.attributes.status,
        statusFormatted: returnedSub.data?.data.attributes.status_formatted,
        endsAt: returnedSub.data?.data.attributes.ends_at,
        isPaused: returnedSub.data?.data.attributes.pause !== null,
      })
      .where(eq(subscriptions.lemonSqueezyId, id));
  } catch (error) {
    throw new Error(`Failed to pause Subscription #${id} in the database.`);
  }

  revalidatePath("/settings/subscriptions");
  revalidatePath("/settings/subscriptions/plans");
  return returnedSub;
}

/**
 * This action will change the plan of a subscription on Lemon Squeezy.
 */
export async function changePlan(currentPlanId: string, newPlanId: string) {
  configureLemonSqueezy();

  // Get user subscriptions
  const userSubscriptions = (await getUserSubscriptions())?.data ?? [];

  // Check if the subscription exists
  const subscription = userSubscriptions.find(
    (sub) => sub.planId === currentPlanId
  );

  if (!subscription) {
    throw new Error(
      `No subscription with plan id #${currentPlanId} was found.`
    );
  }

  // Get the new plan details from the database.
  const newPlan = await db
    .select()
    .from(plans)
    .where(eq(plans.id, newPlanId))
    .then(takeUniqueOrThrow);

  // Send request to Lemon Squeezy to change the subscription.
  const updatedSub = await updateSubscription(subscription.lemonSqueezyId, {
    variantId: newPlan.variantId,
  });

  // Save in db
  try {
    await db
      .update(subscriptions)
      .set({
        planId: newPlanId,
        price: newPlan.price,
        endsAt: updatedSub.data?.data.attributes.ends_at,
      })
      .where(eq(subscriptions.lemonSqueezyId, subscription.lemonSqueezyId));
  } catch (error) {
    throw new Error(
      `Failed to update Subscription #${subscription.lemonSqueezyId} in the database.`
    );
  }

  revalidatePath("/settings/subscriptions");
  revalidatePath("/settings/subscriptions/plans");
  return updatedSub;
}

export const saveUsage = safeAction
  .schema(insertUsageSchema)
  .action(async ({ ctx, parsedInput }) => {
    const savedTask = await db
      .insert(usages)
      .values({ ...parsedInput, userId: ctx.userId, variantId: ctx.variantId })
      .onConflictDoUpdate({
        target: usages.userId,
        set: parsedInput,
      })
      .returning();
    return savedTask[0];
  });

export const listUsage = safeAction.action(async ({ ctx, parsedInput }) => {
  let usage = await db.query.usages.findFirst({
    where: eq(usages.userId, ctx.userId),
  });

  return usage;
});

export const saveCredit = safeAction
  .schema(inserCreditSchema)
  .action(async ({ ctx, parsedInput }) => {
    const savedCredit = await db
      .insert(credits)
      .values({ ...parsedInput, userId: ctx.userId, variantId: ctx.variantId })
      .onConflictDoUpdate({
        target: usages.userId,
        set: parsedInput,
      })
      .returning();
    return savedCredit[0];
  });

export const getCreditByVariantId = safeAction
  .schema(
    z.object({
      variantId: z.string(),
    })
  )
  .action(async ({ ctx, parsedInput: { variantId } }) => {
    let credit = await db.query.credits.findFirst({
      where: and(
        eq(credits.userId, ctx.userId),
        eq(credits.variantId, variantId)
      ),
    });

    return credit;
  });
