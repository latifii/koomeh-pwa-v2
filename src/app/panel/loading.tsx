import { ListSkeleton } from "@/components/shared/list-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Covers every panel route. The sidebar and breadcrumb live in the layout, so
 * they stay put — only the page body is replaced, which is the part that has to
 * wait. Panel titles differ per route, so the header is the one thing here that
 * genuinely has to be a placeholder.
 */
export default function Loading() {
  return (
    <div>
      <header className="mb-5 flex flex-col gap-2">
        <Skeleton className="h-7 w-48 rounded-lg" />
        <Skeleton className="h-4 w-72 max-w-full rounded" />
      </header>
      <ListSkeleton count={6} columns="sm:grid-cols-2" />
    </div>
  );
}
