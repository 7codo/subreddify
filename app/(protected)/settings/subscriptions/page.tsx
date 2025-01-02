import PageWrapper from "@/components/page-wrapper";
import { createMetadata } from "@/lib/constants/metadata";
import { Suspense } from "react";
import { CardSkeleton } from "./_components/skeleton/card-skeleton";
import { Subscriptions } from "./_components/subscriptions";

export const metadata = createMetadata({
  title: "Subscriptions",
  description: "Subscriptions.",
});

const BillingPage = async () => {
  return (
    <PageWrapper title="Subscriptions">
      <Suspense fallback={<CardSkeleton />}>
        <Subscriptions />
      </Suspense>
    </PageWrapper>
  );
};

export default BillingPage;
