"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Reads a CSS media query from React. Use it only when a breakpoint has to
 * change *what renders* rather than how it looks — plain `lg:` classes are the
 * right tool for anything purely visual.
 *
 * The server snapshot is `false`, matching the project's mobile-first defaults.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onStoreChange);
      return () => list.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
