"use client";

import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Reloads the page the visitor actually asked for.
 *
 * The offline fallback is served *in place of* that URL, so `location.reload()`
 * re-requests the original address rather than this one — which is why this is
 * a reload and not a link back to `/offline`.
 */
export function RetryButton() {
  return (
    <Button size="lg" onClick={() => window.location.reload()}>
      <RefreshCw />
      تلاش دوباره
    </Button>
  );
}
