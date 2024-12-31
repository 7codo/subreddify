import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function CardSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn("border-0 bg-surface", className)} />;
}
