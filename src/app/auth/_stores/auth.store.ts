"use client";

import { create } from "zustand";

import type {
  ClientSession,
  SessionStatus,
} from "@/lib/auth/session.types";
import { setAccessToken } from "@/lib/api/access-token";
import { clearServiceWorkerCaches } from "@/lib/service-worker";

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

/**
 * `unread` is not the same answer as `null`.
 *
 * The route returns `null` for a visitor who is genuinely signed out, and that
 * is a fact worth acting on. A request that never arrived is not: it used to
 * collapse into the same `null`, so one failed call — a dropped connection, a
 * server restart — signed the visitor out of the store while their cookie was
 * still perfectly good. In the panel that surfaced as «فقط برای مدیران است»
 * appearing for a second on an administrator's own page.
 */
type SessionRead =
  | { read: true; session: ClientSession | null }
  | { read: false };

async function fetchSession(): Promise<SessionRead> {
  try {
    const response = await fetch("/api/auth/session", { cache: "no-store" });
    if (!response.ok) return { read: false };
    return {
      read: true,
      session: (await response.json()) as ClientSession | null,
    };
  } catch {
    return { read: false };
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
    const result = await fetchSession();

    if (!result.read) {
      // Keep whatever is already here — a failed read is not a sign-out. The
      // one thing that must not happen is staying in `loading` forever, so a
      // first read that fails settles as signed out rather than pending.
      set((state) =>
        state.status === "loading" ? { status: "unauthenticated" } : {},
      );
      return;
    }

    const { session } = result;
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
    // Every sign-out path runs through here, so the service worker is told to
    // drop what it holds here too rather than in each of the three buttons.
    // Nothing private is cached by design, but a listing someone opened while
    // signed in is still their browsing history on what may be a shared phone.
    clearServiceWorkerCaches();
    set({ session: null, status: "unauthenticated" });
  },
}));
