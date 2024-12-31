import BillingToggle from "@/components/billing-toggle";
import { getUserSubscriptions, listPlans, syncPlans } from "@/lib/db/queries";
import { NewPlan } from "@/lib/db/schemas";
import { type Subscription } from "@lemonsqueezy/lemonsqueezy.js";
import FilteredPlans from "./filtered-plans";
import { NoPlans } from "./plan";
import { getCurrentPlanName } from "@/lib/actions";

export async function Plans({
  isChangingPlans = false,
  currentPlan,
}: {
  isChangingPlans?: boolean;
  currentPlan?: NewPlan;
}) {
  let allPlans: NewPlan[] = (await listPlans()) ?? [];
  const userSubscriptions = (await getUserSubscriptions())?.data ?? [];
  const currentPlanName = (await getCurrentPlanName())?.data ?? "free";
  // Do not show plans if the user already has a valid subscription.
  if (userSubscriptions.length > 0) {
    const hasValidSubscription = userSubscriptions.some((subscription) => {
      const status =
        subscription.status as Subscription["data"]["attributes"]["status"];

      return (
        status !== "cancelled" &&
        status !== "expired" &&
        status !== "unpaid" &&
        status !== "paused"
      );
    });

    /*  if (!isChangingPlans) {
      return null;
    } */
  }

  // If there are no plans in the database, sync them from Lemon Squeezy.
  // You might want to add logic to sync plans periodically or a webhook handler.
  if (allPlans.length === 2) {
    //IMPORTANT: sync again if you change mode from live to testto update variants id
    console.log("syncing");
    allPlans = await syncPlans();
  }

  if (!allPlans.length) {
    return <NoPlans />;
  }

  return (
    <div className="space-y-6 md:space-y-12">
      <BillingToggle />
      <FilteredPlans plans={allPlans} currentPlanName={currentPlanName} />
    </div>
  );
}
