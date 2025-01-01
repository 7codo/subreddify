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

    async function handSignUp() {
      if (isChangingPlans) {
        if (!currentPlan?.id) {
          throw new Error("Current plan not found.");
        }

        if (
          plan.variantId === VARIANT_ID.free.monthly ||
          plan.variantId === VARIANT_ID.free.yearly
        ) {
          toast.warning(
            "Go to Subscriptions and cancel your current plan to return to the free plan."
          );
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
          return;
        }

        // Get previously switched subscription for the target plan
        const switchedSubscription = userSubscriptions.find(
          (sub) => sub.planId === plan.id && sub.status !== "cancelled"
        );

        // Check if switched subscription exists and is not expired
        const isSwitchedSubscriptionValid =
          switchedSubscription &&
          ((switchedSubscription.renewsAt &&
            isAfter(new Date(switchedSubscription.renewsAt), new Date())) ||
            (switchedSubscription.endsAt &&
              isAfter(new Date(switchedSubscription.endsAt), new Date())));

        setLoading(true);

        if (isSwitchedSubscriptionValid) {
          // If valid switched subscription exists, pause current and unpause switched
          await pauseUserSubscription(currentSubscription.lemonSqueezyId);
          await unpauseUserSubscription(switchedSubscription.lemonSqueezyId);
          toast.success("Successfully switched plans");
          router.push("/settings/subscriptions");
        } else {
          // Create new subscription and pause current
          const checkoutUrl = (
            await getCheckoutURL({ variantId: plan.variantId, embed })
          )?.data;

          if (!checkoutUrl) {
            throw new Error("Failed to create checkout URL");
          }

          embed
            ? (window as any).LemonSqueezy.Url.Open(checkoutUrl)
            : router.push(checkoutUrl);
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
          await unpauseUserSubscription(currentSubscription.lemonSqueezyId);
          toast.success("Successfully activated plan");
          router.push("/settings/subscriptions");
          return;
        }
      }
      let checkoutUrl: string | undefined = "";
      setLoading(true);
      checkoutUrl = (await getCheckoutURL({ variantId: plan.variantId, embed }))
        ?.data;

      embed
        ? checkoutUrl && (window as any).LemonSqueezy.Url.Open(checkoutUrl)
        : router.push(checkoutUrl ?? "/");

      setLoading(false);
      toast("Error creating a checkout.", {
        description: "Please contact support if the problem persists.",
      });
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
        onClick={async () => {
          const [result, error] = await handleError(handSignUp(), {
            path: "signup-button.tsx",
          });
          if (error) {
            setLoading(false);
            toast("Error creating a checkout.", {
              description: "Please contact support if the problem persists.",
            });
          }
        }}
        {...otherProps}
      >
        {icon}
        {generateLabel()}
      </Button>
    );
  }
);

SignupButton.displayName = "SignupButton";
