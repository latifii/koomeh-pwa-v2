"use client";

import { create } from "zustand";

import type {
  ClientSession,
  SessionStatus,
} from "@/lib/auth/session.types";
import { setAccessToken } from "@/lib/api/access-token";

type SessionState = {
  session: ClientSession | null;
  status: SessionStatus;
  /** Re-reads the session cookie through `/api/auth/session`. */
  refreshSession: () => Promise<void>;
  /** Adopts a session the server just handed back, with no extra round trip. */
  applySession: (session: ClientSession | null) => void;
  clearSession: () => void;
};

/**
 * Seeds the store from a session the server already read, during render rather
 * than in an effect.
 *
 * The timing is the whole point. Effects run child-first, so a session applied
 * in a provider's effect lands *after* the children have already fired their
 * queries — which then go out with no `Authorization` header, come back 401,
 * and each trigger a refresh-token rotation. Setting it while the provider
 * renders puts the token in place before any child mounts.
 */
export function seedSession(session: ClientSession | null): void {
  const state = useSessionStore.getState();
  const current = state.session;

  // Called on every render of the provider, so only write when it changes.
  if (current?.accessToken === session?.accessToken && state.status !== "loading") {
    return;
  }

  state.applySession(session);
}

async function fetchSession(): Promise<ClientSession | null> {
  try {
    const response = await fetch("/api/auth/session", { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as ClientSession | null;
  } catch {
    return null;
  }
}

/**
 * The browser's copy of the session. The cookie stays the source of truth —
 * this only mirrors it so components can render without waiting, and so axios
 * has an access token to attach.
 */
export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  status: "loading",

  refreshSession: async () => {
    const session = await fetchSession();
    setAccessToken(session?.accessToken);
    set({
      session,
      status: session ? "authenticated" : "unauthenticated",
    });
  },

  applySession: (session) => {
    setAccessToken(session?.accessToken);
    set({
      session,
      status: session ? "authenticated" : "unauthenticated",
    });
  },

  clearSession: () => {
    setAccessToken(undefined);
    set({ session: null, status: "unauthenticated" });
  },
}));
