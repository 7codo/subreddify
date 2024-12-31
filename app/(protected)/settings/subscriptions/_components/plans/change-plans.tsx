import BillingToggle from "@/components/billing-toggle";
import { getUserSubscriptions, listPlans } from "@/lib/db/queries";
import { type NewPlan } from "@/lib/db/schemas";
import { redirect } from "next/navigation";
import { NoPlans, Plan } from "./plan";
import FilteredPlans from "./filtered-plans";
import { VARIANT_ID } from "@/lib/constants";

type Props = {
  currentPlan?: NewPlan;
};

export async function ChangePlans({ currentPlan }: Props) {
  let allPlans: NewPlan[] = (await listPlans()) ?? [];
  const userSubscriptions = (await getUserSubscriptions())?.data ?? [];

  // If user does not have a valid subscription, redirect to the billing page, or
  // if there are no plans in the database, redirect to the billing page to fetch.
  if (!userSubscriptions.length || !allPlans.length) {
    redirect("/settings/subscriptions/plans");
  }
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
        isChangingPlans={true}
      />

      {/* <InfoMessage /> */}
    </div>
  );
}
