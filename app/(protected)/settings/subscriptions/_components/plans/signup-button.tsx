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
import { type NewPlan } from "@/lib/db/schemas";
import { changePlan, getCheckoutURL } from "@/lib/db/queries";
import { VARIANT_ID } from "@/lib/constants";
import { Plan } from "@/lib/types/global";

type ButtonElement = ElementRef<typeof Button>;
type ButtonProps = ComponentProps<typeof Button> & {
  embed?: boolean;
  isChangingPlans?: boolean;
  currentPlan?: NewPlan | null;
  plan: NewPlan;
  currentPlanName?: Plan;
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
      ...otherProps
    } = props;

    const isCurrent = currentPlan && plan.id === currentPlan.id;

    const label =
      currentPlanName === "free" &&
      (plan.variantId === VARIANT_ID.free.monthly ||
        plan.variantId === VARIANT_ID.free.yearly)
        ? "Your current plan"
        : isCurrent
        ? "Your current plan"
        : isChangingPlans
        ? "Switch to this plan"
        : plan.productName?.toLowerCase() === "starter"
        ? `Get ${plan.productName}`
        : `Get ${plan.productName}`;

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
          (currentPlanName === "free" &&
            (plan.variantId === VARIANT_ID.free.monthly ||
              plan.variantId === VARIANT_ID.free.yearly))
        }
        variant={loading || isCurrent ? "outline" : "landing"}
        onClick={async () => {
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

          let checkoutUrl: string | undefined = "";
          try {
            setLoading(true);
            checkoutUrl = (
              await getCheckoutURL({ variantId: plan.variantId, embed })
            )?.data;
          } catch (error) {
            setLoading(false);
            toast("Error creating a checkout.", {
              description: "Please contact support if the problem persists.",
            });
          } finally {
            embed && setLoading(false);
          }

          embed
            ? checkoutUrl && (window as any).LemonSqueezy.Url.Open(checkoutUrl)
            : router.push(checkoutUrl ?? "/");
        }}
        {...otherProps}
      >
        {icon}
        {label}
      </Button>
    );
  }
);

SignupButton.displayName = "SignupButton";
