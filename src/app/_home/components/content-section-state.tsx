"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, RefreshCw } from "lucide-react";

import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type ContentSectionVariant = "articles" | "neighborhoods" | "branches";

const sectionTone: Record<ContentSectionVariant, "default" | "muted"> = {
  articles: "default",
  neighborhoods: "muted",
  branches: "default",
};

export function ContentSectionSkeleton({
  variant,
}: {
  variant: ContentSectionVariant;
}) {
  const count = variant === "neighborhoods" ? 6 : 3;

  return (
    <Section tone={sectionTone[variant]} aria-label="در حال دریافت اطلاعات">
      <div className="mb-8 space-y-3" aria-hidden>
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>

      <div
        className={
          variant === "neighborhoods"
            ? "grid grid-cols-3 gap-3 lg:grid-cols-6"
            : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        }
        aria-hidden
      >
        {Array.from({ length: count }, (_, index) => (
          <Skeleton
            key={index}
            className={
              variant === "neighborhoods"
                ? "aspect-square rounded-2xl"
                : "h-72 rounded-2xl"
            }
          />
        ))}
      </div>
    </Section>
  );
}

export function ContentSectionError({
  variant,
  title,
  message,
  onRetry,
}: {
  variant: ContentSectionVariant;
  title: string;
  message: string;
  /** Optional: a server-rendered section has no client query to refetch. */
  onRetry?: () => void;
}) {
  const router = useRouter();
  return (
    <Section tone={sectionTone[variant]}>
      <div
        role="alert"
        className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/25 bg-destructive/5 px-6 py-12 text-center"
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-5" />
        </span>
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
        <Button type="button" variant="outline" onClick={onRetry ?? (() => router.refresh())}>
          <RefreshCw />
          تلاش دوباره
        </Button>
      </div>
    </Section>
  );
}
