"use client";

import { NewPlan, NewSubscription } from "@/lib/db/schemas";
import { usePricing } from "@/lib/stores/pricing-store";
import { useEffect, useState } from "react";
import { Plan } from "./plan";
import { filterPlansByInterval } from "@/lib/utils";
import { Plan as PlanType } from "@/lib/types/global";
import { Subscription } from "@lemonsqueezy/lemonsqueezy.js";

type FilteredPlansType = {
  plans: NewPlan[];
  currentPlan?: NewPlan | null;
  isChangingPlans?: boolean;
  currentPlanName?: PlanType;
  userSubscriptions: NewSubscription[];
  pausedPlansIds: string[];
};

export default function FilteredPlans({
  plans,
  currentPlan,
  isChangingPlans,
  currentPlanName,
  userSubscriptions,
  pausedPlansIds,
}: FilteredPlansType) {
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
    <div className="flex flex-wrap items-center justify-center gap-6 mx-auto md:max-w-3xl">
      {filterPlans.map((plan, index) => {
        return (
          <Plan
            key={`plan-${index}`}
            plan={plan}
            index={index}
            currentPlan={currentPlan}
            isChangingPlans={isChangingPlans}
            currentPlanName={currentPlanName}
            userSubscriptions={userSubscriptions}
            pausedPlansIds={pausedPlansIds}
          />
        );
      })}
    </div>
  );
}
