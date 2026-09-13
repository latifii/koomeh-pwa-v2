"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Fetches the next page when it scrolls near.
 *
 * A «نمایش آگهی‌های بیشتر» button asked the visitor to do what scrolling
 * already says; now the list keeps going. The sentinel sits after the last
 * card and asks for more while it is still a few hundred pixels below the
 * fold, so the next page is usually there before the visitor reaches the
 * end; while it loads, `skeleton` holds the place the cards will take.
 * Works inside a nested scroller as well as the window — the observer
 * measures against the viewport either way.
 */
export function LoadMoreSentinel({
  hasMore,
  loading,
  onLoadMore,
  skeleton,
}: {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  skeleton: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Re-observed whenever the inputs change, so the callback always sees the
  // current page state; a sentinel already in view when a page lands fires
  // again for the next one.
  useEffect(() => {
    const element = ref.current;
    if (!element || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onLoadMore();
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  if (!hasMore && !loading) return null;

  return (
    <>
      {loading && skeleton}
      <div ref={ref} aria-hidden className="h-px w-full" />
    </>
  );
}
