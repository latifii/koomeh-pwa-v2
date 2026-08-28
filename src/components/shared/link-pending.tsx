"use client";

import type { ReactNode } from "react";
import { useLinkStatus } from "next/link";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

/**
 * Feedback for the link that was actually clicked.
 *
 * A `loading.tsx` only appears once the router gives up on the current view; on
 * a prefetched route it never appears at all. Neither covers the gap people
 * complain about — the moment between the click and anything changing, where a
 * visitor concludes the link is broken and clicks it three more times. This
 * fills that gap in place, without moving any layout.
 *
 * Must be rendered *inside* the `<Link>` it reports on — `useLinkStatus` reads
 * the nearest one.
 */
export function LinkPending({
  children,
  className,
}: {
  /** Shown while idle; a spinner replaces it during navigation. Omit to show nothing until then. */
  children?: ReactNode;
  className?: string;
}) {
  const { pending } = useLinkStatus();

  if (!pending) return <>{children}</>;
  return <Spinner className={cn("size-4", className)} />;
}
