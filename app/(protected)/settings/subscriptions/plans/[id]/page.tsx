import PageWrapper from "@/components/page-wrapper";
import { createMetadata } from "@/lib/constants/metadata";
import { getPlanById, getUserSubscriptions } from "@/lib/db/queries";
import { SubscriptionStatusType } from "@/lib/types/global";
import { notFound, redirect } from "next/navigation";
import { ChangePlans } from "../../_components/plans/change-plans";
import { isValidSubscription } from "../../_lib/utils";

export const metadata = createMetadata({
  title: "Switch Plan",
  description: "Switch Plan.",
});

export const dynamic = "force-dynamic";

export default async function ChangePlansPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const currentPlanId = (await params).id;
  if (!currentPlanId) {
    notFound();
  }

  // Get user subscriptions to check the current plan.
  const userSubscriptions = (await getUserSubscriptions())?.data ?? [];

  if (!userSubscriptions.length) {
    notFound();
  }

  const isCurrentPlan = userSubscriptions.find(
    (s) =>
      s.planId === currentPlanId &&
      isValidSubscription(s.status as SubscriptionStatusType)
  );

  if (!isCurrentPlan) {
    redirect("/settings/subscriptions/plans");
  }

  const currentPlan = (await getPlanById({ id: currentPlanId }))?.data;

  return (
    <PageWrapper title="Change Plan">
      <ChangePlans currentPlan={currentPlan} />
    </PageWrapper>
  );
}
