"use server";

import { isAfter, parseISO } from "date-fns";

import { EMAILS_FREE_PLAN, VARIANT_ID } from "@/lib/constants";
import { listUsage } from "@/lib/db/queries";
import { safeAction } from "@/lib/utils/safe-action";
import { Plan } from "./types/global";

export const getCurrentPlanName = safeAction.action(
  async ({ ctx, parsedInput }) => {
    if (EMAILS_FREE_PLAN.includes(ctx.email))
      return process.env.ADMIN_PLAN as Plan; //admin pass

    switch (parseInt(ctx.variantId)) {
      case VARIANT_ID.starter.monthly:
      case VARIANT_ID.starter.yearly:
        return "starter";
      case VARIANT_ID.growth.monthly:
      case VARIANT_ID.growth.yearly:
        return "growth";
      case VARIANT_ID.enterprise.monthly:
      case VARIANT_ID.enterprise.yearly:
        return "enterprise";
      default:
        return "free";
    }
  }
);

export async function getUsage() {
  const usage = (await listUsage())?.data ?? { tokens: 0, resources: 0 };

  return {
    tokens: usage.tokens ?? 0,
    resources: usage.resources ?? 0,
  };
}
