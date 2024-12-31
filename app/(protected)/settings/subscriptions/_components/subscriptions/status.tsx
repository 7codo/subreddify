import * as React from "react";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { type VariantProps } from "class-variance-authority";
import { SubscriptionStatusType } from "@/lib/types/global";


type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

interface SubscriptionStatusProps {
  status: SubscriptionStatusType;
  statusFormatted: string;
  isPaused?: boolean;
}

const statusColorMap: Record<SubscriptionStatusType, BadgeVariant> = {
  active: "success",
  cancelled: "secondary",
  expired: "destructive",
  past_due: "destructive",
  on_trial: "default",
  unpaid: "destructive",
  pause: "outline",
  paused: "outline",
};

export function SubscriptionStatus({
  status,
  statusFormatted,
  isPaused = false,
}: SubscriptionStatusProps) {
  const _status = isPaused ? "paused" : status;
  const _statusFormatted = isPaused ? "Paused" : statusFormatted;
  const badgeVariant = statusColorMap[_status];

  return (
    <>
      {status !== "cancelled" && (
        <span className="text-muted-foreground">&bull;</span>
      )}
      <Badge
        variant={badgeVariant}
        className="rounded-sm px-1 py-0 text-sm"
      >
        {_statusFormatted}
      </Badge>
    </>
  );
}
