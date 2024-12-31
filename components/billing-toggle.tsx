"use client";

import * as SwitchPrimitives from "@radix-ui/react-switch";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { usePricing } from "@/lib/stores/pricing-store";
import { cn } from "@/lib/utils";

export default function BillingToggle() {
  const isMonthly = usePricing((state) => state.isMonthly);
  const setIsMonthly = usePricing((state) => state.setIsMonthly);

  return (
    <div className="relative w-fit mx-auto">
      <SwitchPrimitives.Root
        checked={isMonthly}
        onCheckedChange={setIsMonthly}
        className={cn(
          "flex items-center bg-gray-100 rounded-full p-1 w-52 h-10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        )}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            "z-10 flex items-center justify-center h-8 w-[6rem] rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-200 ease-in-out",
            isMonthly ? "translate-x-0" : "translate-x-[6rem]"
          )}
        >
          <span className="text-sm font-medium">
            {isMonthly ? "MONTHLY" : "YEARLY"}
          </span>
        </SwitchPrimitives.Thumb>
        <div className="absolute inset-0 flex items-center">
          <div className="flex-1 flex justify-center">
            <span
              className={cn(
                "text-sm font-medium transition-colors duration-200",
                isMonthly ? "text-gray-600" : "text-primary"
              )}
            >
              MONTHLY
            </span>
          </div>
          <div className="flex-1 flex justify-center">
            <span
              className={cn(
                "text-sm font-medium transition-colors duration-200",
                isMonthly ? "text-primary" : "text-gray-600"
              )}
            >
              YEARLY
            </span>
          </div>
        </div>
      </SwitchPrimitives.Root>

      <Badge
        variant={isMonthly ? "secondary" : "success"}
        className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 z-10"
      >
        25% OFF
      </Badge>
    </div>
  );
}
