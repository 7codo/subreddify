import { getSubscriptionURLs } from "@/lib/db/queries";
import { type NewSubscription } from "@/lib/db/schemas";
import SubscriptionActionsDropdown from "./actions-dropdown";

export async function SubscriptionActions({
  subscription,
}: {
  subscription: NewSubscription;
}) {
  if (
    subscription.status === "expired" ||
    subscription.status === "cancelled" ||
    subscription.status === "unpaid"
  ) {
    return null;
  }

  const urls = await getSubscriptionURLs(subscription.lemonSqueezyId);

  return (
    <SubscriptionActionsDropdown subscription={subscription} urls={urls} />
  );
}
