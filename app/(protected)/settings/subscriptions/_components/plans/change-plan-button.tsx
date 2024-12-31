import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ChangePlan({ planId }: { planId: string }) {
  return (
    <Button size="sm" variant="outline" asChild>
      <Link href={`/settings/subscriptions/plans/${planId}`}>Change plan</Link>
    </Button>
  );
}
