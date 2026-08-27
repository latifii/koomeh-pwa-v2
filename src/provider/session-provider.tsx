"use client";

import { useEffect, type ReactNode } from "react";

import { useSessionStore } from "@/app/auth/_stores/auth.store";

/**
 * Loads the session into the browser store.
 *
 * This deliberately does *not* read the cookie during the server render.
 * `cookies()` in the root layout opts the entire route tree into dynamic
 * rendering, which silently made every `export const revalidate` in the app
 * inert — the whole public site was server-rendered on demand to save one
 * round trip in the header. Fetching it here instead keeps those routes
 * static and revalidated.
 *
 * The store therefore starts in `loading`, and the header shows its skeleton
 * until the answer arrives. It never shows a signed-out state to a signed-in
 * visitor, which is what a seeded-with-null store would have done.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  const refreshSession = useSessionStore((state) => state.refreshSession);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  // A session can change in another tab — signing out there should not leave
  // this one holding a token it no longer owns.
  useEffect(() => {
    const onFocus = () => {
      void refreshSession();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshSession]);

  return children;
}
