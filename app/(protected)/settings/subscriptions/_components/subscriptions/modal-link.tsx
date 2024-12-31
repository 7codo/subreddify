"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { type ReactNode, useEffect } from "react";

export function LemonSqueezyModalLink({
  href,
  children,
}: {
  href?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    (window as any).createLemonSqueezy();
  }, []);

  return (
    <DropdownMenuItem
      onClick={() => {
        if (href) {
          (window as any).LemonSqueezy.Url.Open(href);
        } else {
          throw new Error(
            "href provided for the Lemon Squeezy modal is not valid."
          );
        }
      }}
    >
      {children}
    </DropdownMenuItem>
  );
}
