"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cancelSub, type getSubscriptionURLs } from "@/lib/db/queries";
import { type NewSubscription } from "@/lib/db/schemas";
import { MoreVertical } from "lucide-react";
import { useState } from "react";
import ConfirmCancelDialog from "./confirm-cancel-dialog";
import { LemonSqueezyModalLink } from "./modal-link";

export default function SubscriptionActionsDropdown({
  subscription,
  urls,
}: {
  subscription: NewSubscription;
  urls: Awaited<ReturnType<typeof getSubscriptionURLs>>;
}) {
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  if (
    subscription.status === "expired" ||
    subscription.status === "cancelled" ||
    subscription.status === "unpaid"
  ) {
    return null;
  }

  const handleContinue = async () => {
    setLoading(true);
    await cancelSub(subscription.lemonSqueezyId).then(() => {
      setLoading(false);
    });
  };

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/50">
          <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
      <ConfirmCancelDialog
        handleContinue={handleContinue}
        setOpen={setOpen}
        open={open}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="size-8 data-[state=open]:bg-muted"
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="bottom" align="end" className="w-56">
          <DropdownMenuGroup>
            {/*  {!subscription.isPaused && (
              <DropdownMenuItem
                onSelect={async () => {
                  setLoading(true);
                  await pauseUserSubscription(subscription.lemonSqueezyId).then(
                    () => {
                      setLoading(false);
                    }
                  );
                }}
              >
                Pause payments
              </DropdownMenuItem>
            )}

            {subscription.isPaused && (
              <DropdownMenuItem
                onSelect={async () => {
                  setLoading(true);
                  await unpauseUserSubscription(
                    subscription.lemonSqueezyId
                  ).then(() => {
                    setLoading(false);
                  });
                }}
              >
                Unpause payments
              </DropdownMenuItem>
            )} */}

            <DropdownMenuItem asChild>
              <a target="_blank" href={urls.customer_portal}>
                Customer portal ↗
              </a>
            </DropdownMenuItem>

            <LemonSqueezyModalLink href={urls.update_payment_method}>
              Update payment method
            </LemonSqueezyModalLink>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={() => {
                setOpen(true);
              }}
              className="text-destructive focus:text-destructive"
            >
              Cancel subscription
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
