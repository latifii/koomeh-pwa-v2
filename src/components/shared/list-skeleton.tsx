import { Skeleton } from "@/components/ui/skeleton";

/**
 * The placeholder every streamed list section falls back to.
 *
 * It deliberately mirrors the real layout — a filter bar above a grid of cards
 * — so the page does not visibly jump when the data arrives.
 */
export function ListSkeleton({
  count = 8,
  withFilters = true,
  columns = "sm:grid-cols-2 lg:grid-cols-3",
}: {
  count?: number;
  withFilters?: boolean;
  columns?: string;
}) {
  return (
    <div className="space-y-4">
      {withFilters && (
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-40 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
      )}
      <div className={`grid gap-3 ${columns}`}>
        {Array.from({ length: count }).map((_, index) => (
          <Skeleton key={index} className="h-56 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
