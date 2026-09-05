"use client";

import { Heart } from "lucide-react";

import { useAgentFavorite } from "@/app/_favorites/_hooks/use-agent-favorite";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Saving an agent, in the two places it makes sense to: a chip on the card and
 * a labelled button on their profile.
 *
 * The panel's «کارشناسان نشان‌شده» tab has been listing these since it was
 * written and there was nowhere to add one, so the tab could only ever be
 * empty. It reads as a broken feature rather than an unused one.
 */
export function AgentFavoriteButton({
  agentId,
  variant = "icon",
  className,
}: {
  agentId: number;
  variant?: "icon" | "labelled";
  className?: string;
}) {
  const { isSaved, isPending, toggle } = useAgentFavorite(agentId);
  const label = isSaved ? "برداشتن از نشان‌شده‌ها" : "نشان کردن کارشناس";

  if (variant === "labelled") {
    return (
      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={toggle}
        aria-pressed={isSaved}
        className={cn(
          "border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white",
          className,
        )}
      >
        <Heart
          data-icon="inline-start"
          className={cn(isSaved && "fill-current text-rose-400")}
        />
        {isSaved ? "نشان‌شده" : "نشان کردن"}
      </Button>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isSaved}
      title={label}
      disabled={isPending}
      onClick={toggle}
      // `relative` lifts it above the card's stretched link.
      className={cn(
        "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border text-muted-foreground transition-colors hover:border-brand/40 hover:text-brand disabled:opacity-60",
        isSaved && "border-rose-200 text-rose-500 dark:border-rose-500/40",
        className,
      )}
    >
      <Heart className={cn("size-4", isSaved && "fill-current")} />
    </button>
  );
}
