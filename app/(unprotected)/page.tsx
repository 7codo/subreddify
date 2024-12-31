import { listPlans } from "@/lib/db/queries";
import { CTA } from "./_components/cta";
import { FAQ } from "./_components/faqs";
import { Hero } from "./_components/hero";
import { Pricing } from "./_components/pricing";
import { Features } from "./_components/features";

export default async function Page() {
  const plans = await listPlans();

  /* {
    id: '7f562091-7837-4b1a-9d5d-7fa1ac888f22',
    productId: 7,
    productName: 'Free',
    variantId: 7,
    name: 'Default',
    description: '',
    price: '0',
    isUsageBased: false,
    interval: 'year',
    intervalCount: 1,
    trialInterval: null,
    trialIntervalCount: null,
    sort: 2
  } */
  return (
    <>
      <Hero />
      <Features />
      <Pricing plans={plans} />
      <FAQ />
      <CTA />
    </>
  );
}
