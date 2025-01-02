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
import { Plan, SubscriptionStatusType } from "@/lib/types/global";
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

async function processCheckout(
  variantId: number,
  embed: boolean,
  push: (url: string) => void
) {
  const checkoutResult = await getCheckoutURL({
    variantId,
    embed,
  });
  if (!checkoutResult || !checkoutResult?.data)
    throw new Error("checkoutResult undefined!");

  embed
    ? (window as any).LemonSqueezy.Url.Open(checkoutResult.data)
    : push(checkoutResult.data);
}

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
      if (isChangingPlans) {
        if (!currentPlan?.id) {
          throw new Error("Current plan not found.");
        }

        if (!plan.id) {
          throw new Error("New plan not found.");
        }

        setLoading(true);
        await changePlan(currentPlan.id, plan.id);
        setLoading(false);

        return;
      }

      // Otherwise, create a checkout and open the Lemon.js modal.
      let checkoutUrl: string | undefined = "";
      try {
        setLoading(true);
        checkoutUrl = (
          await getCheckoutURL({
            variantId: plan.variantId,
            embed,
          })
        )?.data;
        if (!checkoutUrl) throw new Error("Processing Checkout failed.");
        embed
          ? (window as any).LemonSqueezy.Url.Open(checkoutUrl)
          : router.push(checkoutUrl);
      } catch (error) {
        setLoading(false);
        toast.error("Error creating a checkout.", {
          description: "Please contact us if the error persist!",
        });
      } finally {
        embed && setLoading(false);
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
