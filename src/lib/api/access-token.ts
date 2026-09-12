/**
 * The access token the axios interceptor attaches, kept outside React so a
 * request fired from anywhere picks up the current value.
 *
 * The session store owns it: it is set on sign-in, replaced on refresh and
 * cleared on sign-out. Server-side code never reads this — there each request
 * carries its own token from the cookie.
 */

let accessToken: string | undefined;

export function setAccessToken(token: string | undefined): void {
  accessToken = token;
}

export function getAccessToken(): string | undefined {
  return accessToken;
}

/**
 * Raised by the axios interceptor when a refresh comes back 401 — the cookie
 * is gone and no request from this tab will succeed again.
 *
 * A DOM event rather than a store import: this module and the http client are
 * bundled into server code too, and the store is a `"use client"` module. The
 * session provider listens and re-reads the cookie, so the header stops
 * showing a name the server no longer recognises the moment it happens,
 * rather than on the next window focus.
 */
const SESSION_LOST_EVENT = "koomeh:session-lost";

export function notifySessionLost(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SESSION_LOST_EVENT));
}

export function onSessionLost(listener: () => void): () => void {
  window.addEventListener(SESSION_LOST_EVENT, listener);
  return () => window.removeEventListener(SESSION_LOST_EVENT, listener);
}
