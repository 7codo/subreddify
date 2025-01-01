"use client";

import { Button } from "@/components/ui/button";
import { CheckIcon, PlusIcon, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  forwardRef,
  useState,
  type ComponentProps,
  type ElementRef,
} from "react";
import { toast } from "sonner";
import { NewSubscription, type NewPlan } from "@/lib/db/schemas";
import {
  changePlan,
  getCheckoutURL,
  pauseUserSubscription,
  unpauseUserSubscription,
} from "@/lib/db/queries";
import { VARIANT_ID } from "@/lib/constants";
import { Plan } from "@/lib/types/global";
import { Subscription } from "@lemonsqueezy/lemonsqueezy.js";
import { isAfter } from "date-fns";
import { handleError } from "@/lib/utils/error-handler";

type ButtonElement = ElementRef<typeof Button>;
type ButtonProps = ComponentProps<typeof Button> & {
  embed?: boolean;
  isChangingPlans?: boolean;
  currentPlan?: NewPlan | null;
  plan: NewPlan;
  currentPlanName?: Plan;
  userSubscriptions: NewSubscription[];
  pausedPlansIds: string[];
};

export const SignupButton = forwardRef<ButtonElement, ButtonProps>(
  (props, ref) => {
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const {
      embed = true,
      plan,
      currentPlan,
      isChangingPlans = false,
      currentPlanName,
      userSubscriptions,
      pausedPlansIds,
      ...otherProps
    } = props;

    const isCurrent = currentPlan && plan.id === currentPlan.id;
    const isFreeVariant =
      plan.variantId === VARIANT_ID.free.monthly ||
      plan.variantId === VARIANT_ID.free.yearly;

    const generateLabel = () => {
      if (currentPlanName === "free" && isFreeVariant) {
        return "Your current plan";
      }
      if (isCurrent) {
        return "Your current plan";
      }
      if (isChangingPlans) {
        return "Switch to this plan";
      }

      if (plan.id && pausedPlansIds.includes(plan.id!)) {
        return "Active this plan";
      }
      return `Get ${plan.productName}`;
    };

    async function handleSignUp() {
      // renamed from handSignUp
      setLoading(true);
      try {
        if (isChangingPlans) {
          if (!currentPlan?.id) {
            throw new Error("Current plan not found.");
          }

          if (isFreeVariant) {
            toast.warning(
              "Go to Subscriptions and cancel your current plan to return to the free plan."
            );
            setLoading(false); // Add this to reset loading state
            return;
          }
          if (!plan.id) {
            throw new Error("New plan not found.");
          }

          // Get current active subscription
          const currentSubscription = userSubscriptions.find(
            (sub) =>
              sub.planId === currentPlan.id &&
              ((sub.renewsAt && isAfter(new Date(sub.renewsAt), new Date())) ||
                (sub.endsAt && isAfter(new Date(sub.endsAt), new Date()))) &&
              sub.status !== "cancelled"
          );

          if (!currentSubscription) {
            throw new Error("Active subscription not found");
          }

          // Get previously switched subscription for the target plan
          const switchedSubscription = userSubscriptions.find(
            (sub) => sub.planId === plan.id && sub.status !== "cancelled"
          );

          const isSwitchedSubscriptionValid =
            switchedSubscription &&
            ((switchedSubscription.renewsAt &&
              isAfter(new Date(switchedSubscription.renewsAt), new Date())) ||
              (switchedSubscription.endsAt &&
                isAfter(new Date(switchedSubscription.endsAt), new Date())));

          if (
            switchedSubscription &&
            (Number(plan.price) < Number(currentPlan.price) ||
              isSwitchedSubscriptionValid)
          ) {
            const [, pauseError] = await handleError(
              pauseUserSubscription(currentSubscription.lemonSqueezyId),
              { path: "signup-button.tsx" }
            );
            if (pauseError)
              throw new Error("Failed to pause current subscription");

            const [, unpauseError] = await handleError(
              unpauseUserSubscription(switchedSubscription.lemonSqueezyId),
              { path: "signup-button.tsx" }
            );
            if (unpauseError)
              throw new Error("Failed to unpause target subscription");

            toast.success("Successfully switched plans");
            router.push("/settings/subscriptions");
          } else {
            const [checkoutResult, checkoutError] = await handleError(
              getCheckoutURL({ variantId: plan.variantId, embed }),
              { path: "signup-button.tsx" }
            );
            if (checkoutError || !checkoutResult?.data) {
              throw new Error("Failed to create checkout URL");
            }

            embed
              ? (window as any).LemonSqueezy.Url.Open(checkoutResult.data)
              : router.push(checkoutResult.data);
          }
          return;
        }

        if (pausedPlansIds.length > 0) {
          const currentSubscription = userSubscriptions.find(
            (sub) =>
              sub.planId === plan.id &&
              ((sub.renewsAt && isAfter(new Date(sub.renewsAt), new Date())) ||
                (sub.endsAt && isAfter(new Date(sub.endsAt), new Date()))) &&
              sub.status !== "cancelled"
          );

          if (currentSubscription) {
            const [, unpauseError] = await handleError(
              unpauseUserSubscription(currentSubscription.lemonSqueezyId),
              { path: "signup-button.tsx" }
            );
            if (unpauseError) throw new Error("Failed to activate plan");

            toast.success("Successfully activated plan");
            router.push("/settings/subscriptions");
            return;
          }
        }

        const [checkoutResult, checkoutError] = await handleError(
          getCheckoutURL({ variantId: plan.variantId, embed }),
          { path: "signup-button.tsx" }
        );

        if (checkoutError || !checkoutResult?.data) {
          throw new Error("Failed to create checkout URL");
        }

        embed
          ? (window as any).LemonSqueezy.Url.Open(checkoutResult.data)
          : router.push(checkoutResult.data);
      } catch (error) {
        toast.error("Failed to process subscription", {
          description:
            error instanceof Error
              ? error.message
              : "Please contact support if the problem persists.",
        });
      } finally {
        setLoading(false);
      }
    }

    const icon = loading ? (
      <Loader2Icon className=" size-8 animate-spin" />
    ) : isCurrent ? (
      <CheckIcon className=" size-8" />
    ) : (
      <PlusIcon className=" size-8" />
    );

    return (
      <Button
        ref={ref}
        disabled={
          loading ||
          isCurrent ||
          props.disabled ||
          (currentPlanName === "free" && isFreeVariant)
        }
        variant={loading || isCurrent ? "outline" : "landing"}
        onClick={handleSignUp} // Simplified onClick handler
        {...otherProps}
      >
        {icon}
        {generateLabel()}
      </Button>
    );
  }
);

SignupButton.displayName = "SignupButton";
