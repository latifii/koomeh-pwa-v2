"use client";

import { useEffect, useState, type ReactNode } from "react";

import { useSessionStore } from "@/app/auth/_stores/auth.store";
import type { ClientSession } from "@/lib/auth/session.types";

/**
 * Seeds the session store from the server render, so the header knows who is
 * signed in on the first paint instead of flashing a login button. The cookie
 * remains the source of truth; this only mirrors it into the browser.
 */
export function SessionProvider({
  initialSession,
  children,
}: {
  initialSession: ClientSession | null;
  children: ReactNode;
}) {
  const applySession = useSessionStore((state) => state.applySession);
  const refreshSession = useSessionStore((state) => state.refreshSession);

  // Seeded during the first render, not in an effect: child effects run before
  // the parent's, so waiting would let a child fire a request before axios has
  // the token. A lazy `useState` initializer is React's once-per-instance hook.
  useState(() => {
    applySession(initialSession);
    return null;
  });

  useEffect(() => {
    applySession(initialSession);
  }, [applySession, initialSession]);

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
