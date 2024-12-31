"use client";
import { useEffect, useState } from "react";

import BillingToggle from "@/components/billing-toggle";
import PlanCard from "@/components/plan-card";
import { usePricing } from "@/lib/stores/pricing-store";
import SectionWrapper from "./section-wrapper";
import { PlanType } from "@/lib/db/schemas";
import { filterPlansByInterval } from "@/lib/utils";

export const Pricing = ({ plans }: { plans: PlanType[] }) => {
  const [filterPlans, setFilteredPlans] = useState(
    filterPlansByInterval(plans)
  );
  const isMonthly = usePricing((state) => state.isMonthly);
  useEffect(() => {
    setFilteredPlans(
      filterPlansByInterval(plans, isMonthly ? "month" : "year")
    );
  }, [isMonthly, plans]);

  return (
    <SectionWrapper
      title="Prices that make sense!"
      description="Managing a small business today is already tough."
      className="space-y-6 md:space-y-12"
      id="pricing"
    >
      <BillingToggle />
      <div className="flex justify-center flex-wrap items-center md:max-w-4xl mx-auto w-full gap-6 md:gap-9 justify-items-center">
        {filterPlans.length === 0 ? (
          <p className="text-center ">
            No plans found, we are sorry there&apos;s something wrong!
          </p>
        ) : (
          filterPlans.map((plan, index) => {
            const { description, id, productName, interval, price, variantId } =
              plan;
            return (
              <PlanCard
                key={id}
                title={productName!}
                description={description!}
                pricing={price!}
                interval={interval!}
                index={index}
                variantId={variantId!}
              />
            );
          })
        )}
      </div>
    </SectionWrapper>
  );
};
