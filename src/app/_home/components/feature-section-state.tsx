"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, RefreshCw } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function FeatureSectionSkeleton({
  variant,
}: {
  variant: "virtual-tour" | "agents";
}) {
  return (
    <Section
      tone="primary"
      container={false}
      aria-label="در حال دریافت اطلاعات"
    >
      <Container>
        <div className="mb-8 space-y-3" aria-hidden>
          <Skeleton className="h-4 w-32 bg-white/10" />
          <Skeleton className="h-8 w-64 bg-white/10" />
          <Skeleton className="h-4 w-full max-w-lg bg-white/10" />
        </div>

        {variant === "virtual-tour" ? (
          <div className="grid gap-4 lg:h-136 lg:grid-cols-3 lg:grid-rows-2">
            <Skeleton className="min-h-72 bg-white/10 lg:col-span-2 lg:row-span-2" />
            <Skeleton className="hidden bg-white/10 lg:block" />
            <Skeleton className="hidden bg-white/10 lg:block" />
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-72 bg-white/10" />
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}

export function FeatureSectionError({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  /** Optional: a server-rendered section has no client query to refetch. */
  onRetry?: () => void;
}) {
  const router = useRouter();
  return (
    <Section tone="primary" container={false}>
      <Container>
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-6 py-12 text-center text-white"
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-white/10 text-secondary">
            <AlertCircle className="size-5" />
          </span>
          <h2 className="font-heading text-lg font-semibold">{title}</h2>
          <p className="text-sm text-white/65">{message}</p>
          <Button type="button" variant="secondary" onClick={onRetry ?? (() => router.refresh())}>
            <RefreshCw />
            تلاش دوباره
          </Button>
        </div>
      </Container>
    </Section>
  );
}
