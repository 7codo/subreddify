import {
  Check,
  CheckCircle,
  CircleMinus,
  MoveRight,
  PhoneCall,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, getPlanFeaturesById } from "@/lib/utils";
import { formatPrice } from "@/app/(protected)/settings/subscriptions/_lib/utils";
import { VARIANT_ID } from "@/lib/constants";

interface Feature {
  text: string;
  has: boolean;
}

interface PlanCardProps {
  title: string;
  description: string;
  pricing: string;
  interval: string;
  index: number;
  variantId: number;
  cta?: React.ReactNode;
}

export default function PlanCard({
  title,
  description,
  pricing,
  index,
  cta,
  interval,
  variantId,
}: PlanCardProps) {
  const features = getPlanFeaturesById(variantId);
  /* const isEnterpriseVariant =
    variantId === VARIANT_ID.enterprise.monthly ||
    variantId === VARIANT_ID.enterprise.yearly; */

  const isFreeVariant =
    variantId === VARIANT_ID.free.monthly ||
    variantId === VARIANT_ID.free.yearly;

  const isGrowthVariant =
    variantId === VARIANT_ID.growth.monthly ||
    variantId === VARIANT_ID.growth.yearly;
  const isStarterVariant =
    variantId === VARIANT_ID.starter.monthly ||
    variantId === VARIANT_ID.starter.yearly;

  return (
    <Card
      key={title}
      className={cn("w-full rounded-2xl shadow-lg max-w-[22rem]")}
    >
      <CardHeader>
        <CardTitle>
          <span className="flex flex-row gap-4 items-center font-medium ">
            {title}
          </span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-8 justify-start">
          <p className="flex flex-row  items-center gap-2 text-xl">
            <span className="text-4xl font-bold">{formatPrice(pricing)}</span>
            <span className={cn("text-sm", "text-muted-foreground")}>
              / {interval}
            </span>
          </p>
          {cta ? (
            cta
          ) : (
            <Button variant={"landing"} className="gap-4" asChild>
              <Link
                href={
                  isFreeVariant
                    ? `/sign-up`
                    : `/sign-up?variant_id=${variantId}`
                }
              >
                Get Started Now
              </Link>
            </Button>
          )}

          <div className="flex flex-col gap-4 justify-start">
            {features.map((feature) => (
              <div
                key={feature.text}
                className={cn(
                  "flex gap-4 justify-between",
                  !feature.has && "text-muted-foreground"
                )}
              >
                <div className="flex items-center gap-4">
                  <span className="shrink-0">
                    {feature.has ? (
                      <CheckCircle size={14} />
                    ) : (
                      <CircleMinus size={14} />
                    )}
                  </span>
                  <p>{feature.text}</p>
                </div>

                {feature.soon && (
                  <Badge
                    variant="outline"
                    className={cn(`text-xs shrink-0 p-0 border-none`)}
                  >
                    Soon
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
