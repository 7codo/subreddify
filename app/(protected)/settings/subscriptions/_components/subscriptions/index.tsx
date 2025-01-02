import { getUserSubscriptions, listPlans } from "@/lib/db/queries";
import { NewPlan, type NewSubscription } from "@/lib/db/schemas";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentPlanName, getUsage } from "@/lib/actions";
import { SubscriptionStatusType } from "@/lib/types/global";
import { isValidSubscription } from "../../_lib/utils";
import { ChangePlan } from "../plans/change-plan-button";
import { NoPlanInfoMessage } from "../plans/plan";
import { SubscriptionActions } from "./actions";
import { SubscriptionDate } from "./date";
import { SubscriptionPrice } from "./price";
import { SubscriptionStatus } from "./status";

export async function Subscriptions() {
  const userSubscriptions = (await getUserSubscriptions())?.data ?? [];
  let allPlans: NewPlan[] = (await listPlans()) ?? [];

  const currentPlanName = (await getCurrentPlanName())?.data ?? "free";
  const usage = await getUsage();

  // Show active subscriptions first, then paused, then canceled
  const sortedSubscriptions = userSubscriptions.sort((a, b) => {
    if (a.status === "active" && b.status !== "active") {
      return -1;
    }

    if (a.status === "paused" && b.status === "cancelled") {
      return -1;
    }

    return 0;
  });

  return (
    <section className="overflow-y-auto size-full p-2">
      <NoPlanInfoMessage usage={usage} currentPlanName={currentPlanName} />

      <section className="space-y-2">
        {sortedSubscriptions.map(
          (subscription: NewSubscription, index: number) => {
            const plan = allPlans.find((p) => p.id === subscription.planId);
            const status = subscription.status as SubscriptionStatusType;

            if (!plan) {
              throw new Error("Plan not found");
            }

            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle
                    className={cn(
                      "text-lg text-surface-900 font-bold",
                      !isValidSubscription(status) && "text-inherit"
                    )}
                  >
                    {plan.productName}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {isValidSubscription(status) && (
                      <ChangePlan planId={subscription.planId} />
                    )}
                    <SubscriptionActions subscription={subscription} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-2">
                    <SubscriptionPrice
                      endsAt={subscription.endsAt}
                      interval={plan.interval}
                      intervalCount={plan.intervalCount}
                      price={subscription.price}
                      isUsageBased={plan.isUsageBased ?? false}
                    />
                    <SubscriptionStatus
                      status={status}
                      statusFormatted={subscription.statusFormatted}
                      isPaused={Boolean(subscription.isPaused)}
                    />
                    <SubscriptionDate
                      endsAt={subscription.endsAt}
                      renewsAt={subscription.renewsAt}
                      status={status}
                      trialEndsAt={subscription.trialEndsAt}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          }
        )}
      </section>
    </section>
  );
}
