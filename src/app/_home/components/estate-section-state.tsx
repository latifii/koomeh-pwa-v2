"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, RefreshCw } from "lucide-react";

import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";

export function EstateSectionSkeleton({
  count = 4,
  withFilters = false,
}: {
  count?: number;
  withFilters?: boolean;
}) {
  return (
    <Section tone="muted" aria-label="در حال دریافت املاک">
      <div className="mb-8 space-y-3" aria-hidden>
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      {withFilters && (
        <div className="mb-6 flex gap-2" aria-hidden>
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-8 w-20 rounded-lg" />
          ))}
        </div>
      )}

      <div className="-mx-page flex gap-4 overflow-hidden px-page sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-4">
        {Array.from({ length: count }, (_, index) => (
          <div
            key={index}
            className="w-[80%] shrink-0 space-y-3 overflow-hidden rounded-2xl border bg-card pb-4 sm:w-auto"
            aria-hidden
          >
            <Skeleton className="aspect-4/3 w-full rounded-none" />
            <div className="space-y-3 px-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-8 w-full rounded-xl" />
              <Skeleton className="h-7 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/**
 * Shown when a home section could not load.
 *
 * `onRetry` is optional because these sections are fetched on the server now:
 * there is no client query to refetch, so retrying means asking the server to
 * render the route again. Passing a handler still works for anything that does
 * own a query.
 */
export function EstateSectionError({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  const router = useRouter();
  return (
    <Section tone="muted">
      <div
        role="alert"
        className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/25 bg-destructive/5 px-6 py-12 text-center"
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-5" />
        </span>
        <Typography as="h2" variant="h4">
          {title}
        </Typography>
        <Typography variant="muted">{message}</Typography>
        <Button
          type="button"
          variant="outline"
          onClick={onRetry ?? (() => router.refresh())}
        >
          <RefreshCw />
          تلاش دوباره
        </Button>
      </div>
    </Section>
  );
}
