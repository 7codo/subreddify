import BillingToggle from "@/components/billing-toggle";
import { getUserSubscriptions, listPlans } from "@/lib/db/queries";
import { type NewPlan } from "@/lib/db/schemas";
import { redirect } from "next/navigation";
import { NoPlans } from "./plan";
import FilteredPlans from "./filtered-plans";
import { VARIANT_ID } from "@/lib/constants";
import { Plan } from "@/lib/types/global";

type Props = {
  currentPlan?: NewPlan;
  currentPlanName: Plan;
};

export async function ChangePlans({ currentPlan, currentPlanName }: Props) {
  let allPlans: NewPlan[] = (await listPlans()) ?? [];
  const userSubscriptions = (await getUserSubscriptions())?.data ?? [];

  const pausedSubs = userSubscriptions.filter((sub) => sub.status === "paused");

  const isCurrentPlanUsageBased = currentPlan?.isUsageBased;

  const filteredPlans = allPlans.filter((plan) => {
    return isCurrentPlanUsageBased
      ? Boolean(plan.isUsageBased)
      : Boolean(!plan.isUsageBased);
  });

  if (filteredPlans.length < 2) {
    return <NoPlans />;
  }

  return (
    <div className="flex flex-col gap-6 md:gap-12 py-3">
      <BillingToggle />
      <FilteredPlans
        plans={filteredPlans}
        currentPlan={currentPlan}
        isChangingPlans={!!currentPlan}
        userSubscriptions={userSubscriptions}
        currentPlanName={currentPlanName}
        pausedPlansIds={pausedSubs.map((sub) => sub.planId)}
      />

      {/* <InfoMessage /> */}
    </div>
  );
}
