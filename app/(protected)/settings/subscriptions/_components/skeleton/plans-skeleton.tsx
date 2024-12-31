import { Skeleton } from "@/components/ui/skeleton";

export function PlansSkeleton() {
  return (
    <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
      <Skeleton className="h-[211px]" />
      <Skeleton className="h-[211px]" />
    </div>
  );
}
