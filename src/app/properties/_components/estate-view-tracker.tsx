"use client";

import { useEffect, useRef } from "react";

import { recordEstateView } from "@/app/properties/_api/estate-actions.service";

/**
 * Bumps the file's visit counter once per mount — the same thing the legacy
 * page does on load. Renders nothing.
 *
 * A `?he=` in the URL is the share link a customer was sent; passing it through
 * also marks that relationship as seen on the staff side. It is read from
 * `window.location` rather than `useSearchParams`, because that hook opts the
 * whole route out of static rendering — and this effect only ever runs in the
 * browser, where the URL is right there.
 *
 * Failures are ignored: a counter that did not increment is never worth
 * interrupting a reader for, and the endpoint is rate limited.
 */
export function EstateViewTracker({ estateId }: { estateId: string }) {
  // React runs effects twice in development; the counter should not.
  const recorded = useRef<string>(null);

  useEffect(() => {
    if (recorded.current === estateId) return;
    recorded.current = estateId;

    const controller = new AbortController();
    const shareParam = new URLSearchParams(window.location.search).get("he");
    const shareId = shareParam ? Number(shareParam) : undefined;

    void recordEstateView(
      estateId,
      shareId !== undefined && Number.isFinite(shareId) ? shareId : undefined,
      controller.signal,
    ).catch(() => {
      // Counter only — nothing on the page depends on it.
    });

    return () => controller.abort();
  }, [estateId]);

  return null;
}
