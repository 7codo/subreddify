import PlanCard from "@/components/plan-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { USAGE_LIMIT } from "@/lib/constants";
import { type NewPlan } from "@/lib/db/schemas";
import { Plan as PlanType } from "@/lib/types/global";
import { AlertCircle, SearchXIcon } from "lucide-react";
import Link from "next/link";
import { SignupButton } from "./signup-button";

export function Plan({
  plan,
  currentPlan = null,
  isChangingPlans = false,
  index,
  currentPlanName,
}: {
  currentPlanName?: PlanType;
  plan: NewPlan;
  currentPlan?: NewPlan | null;
  isChangingPlans?: boolean;
  index: number;
}) {
  const { description, id, productName, interval, price, variantId } = plan;
  const isCurrent = id && currentPlan?.id === id;
  return (
    <PlanCard
      title={productName!}
      description={description!}
      pricing={price}
      index={index}
      interval={interval!}
      variantId={variantId!}
      cta={
        <SignupButton
          className="w-full"
          currentPlanName={currentPlanName}
          plan={plan}
          isChangingPlans={isChangingPlans}
          currentPlan={currentPlan}
        />
      }
    />
  );
}

export function NoPlans() {
  return (
    <section className="prose mt-[10vw] flex flex-col items-center justify-center w-full mx-auto">
      <span className="flex size-24 items-center justify-center rounded-full bg-wg-red-50/70">
        <SearchXIcon
          className="text-wg-red"
          aria-hidden="true"
          size={48}
          strokeWidth={0.75}
        />
      </span>

      <p className="max-w-prose text-balance text-center leading-6 text-gray-500">
        There are no plans available at the moment.
      </p>
    </section>
  );
}

export function NoPlanInfoMessage({
  usage,
  currentPlanName,
}: {
  usage: { tokens: number; resources: number };
  currentPlanName: PlanType;
}) {
  return (
    <Alert className="max-w-2xl mb-2 mx-auto">
      <AlertCircle className="size-4" />
      <AlertTitle>Current Plan: {currentPlanName}</AlertTitle>
      <AlertDescription>
        Your current usage:
        <ul className="mt-2 list-disc list-inside">
          <li>
            {usage.tokens}/{USAGE_LIMIT[currentPlanName].tokens} tokens used{" "}
          </li>
          <li>
            {usage.resources}/{USAGE_LIMIT[currentPlanName].resources} resources
            created
          </li>
        </ul>
        To upgrade your plan, please visit the{" "}
        <Link href="/settings/subscriptions/plans" className="text-blue-500">
          plans page
        </Link>
        .
      </AlertDescription>
    </Alert>
  );
}
