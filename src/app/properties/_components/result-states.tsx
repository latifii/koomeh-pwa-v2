import { RotateCcw, SearchX, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState as SharedEmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export function ResultsSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      aria-busy
      aria-label="در حال بارگذاری آگهی‌ها"
      className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", className)}
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border bg-card">
          <Skeleton className="aspect-4/3 w-full rounded-none" />
          <div className="flex flex-col gap-2.5 p-3.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-8 w-full rounded-xl" />
            <div className="flex items-center justify-between gap-2 border-t pt-2.5">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="size-7 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <SharedEmptyState
      icon={SearchX}
      title="با فیلترهای فعلی آگهی‌ای پیدا نشد"
      description="محدوده قیمت یا متراژ را کمی بازتر کنید، یا فیلترها را پاک کنید تا همه آگهی‌های این شهر را ببینید."
      action={<Button variant="outline" size="sm" onClick={onReset}><RotateCcw />حذف فیلترها</Button>}
    />
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 py-16 text-center"
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <TriangleAlert className="size-6 text-destructive" />
      </span>
      <Typography as="h3" variant="h4">
        دریافت آگهی‌ها با خطا مواجه شد
      </Typography>
      <Typography variant="muted" className="max-w-sm">
        ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید و دوباره
        تلاش کنید.
      </Typography>
      <Button variant="outline" size="sm" className="mt-1" onClick={onRetry}>
        <RotateCcw className="size-4" />
        تلاش مجدد
      </Button>
    </div>
  );
}
