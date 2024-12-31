import { Suspense } from "react";
import { PlansSkeleton } from "../_components/skeleton/plans-skeleton";
import { Plans } from "../_components/plans";
import PageWrapper from "@/components/page-wrapper";
import { getCheckoutURL } from "@/lib/db/queries";
import { SearchParams } from "@/lib/types/global";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createMetadata } from "@/lib/constants/metadata";

export const metadata = createMetadata({
  title: "Plans",
  description: "Plans.",
});

type Props = {
  searchParams: SearchParams;
};

export default async function PlansPage({ searchParams }: Props) {
  const user = await currentUser();
  const userVariantId = user?.publicMetadata.variantId;
  const searchParamsList = await searchParams;
  const variantIdParam = searchParamsList.variant_id;
  const variantId = Array.isArray(variantIdParam) ? undefined : variantIdParam;

  if (variantId) {
    const checkoutUrl = (
      await getCheckoutURL({ variantId: parseInt(variantId) })
    )?.data;
    if (checkoutUrl) {
      if (!userVariantId) {
        redirect(checkoutUrl);
      }
    }
  }

  return (
    <PageWrapper title="Plans">
      <Suspense fallback={<PlansSkeleton />}>
        <Plans />
      </Suspense>
    </PageWrapper>
  );
}
