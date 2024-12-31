import PageWrapper from "@/components/page-wrapper";
import { getCheckoutURL } from "@/lib/db/queries";
import { SearchParams } from "@/lib/types/global";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { CardSkeleton } from "./_components/skeleton/card-skeleton";
import { Subscriptions } from "./_components/subscriptions";
import { createMetadata } from "@/lib/constants/metadata";

export const metadata = createMetadata({
  title: "Subscriptions",
  description: "Subscriptions.",
});

type Props = {
  searchParams: SearchParams;
};

const BillingPage: React.FC<Props> = async ({ searchParams }) => {
  return (
    <PageWrapper title="Subscriptions">
      <Suspense fallback={<CardSkeleton />}>
        <Subscriptions />
      </Suspense>
    </PageWrapper>
  );
};

export default BillingPage;
