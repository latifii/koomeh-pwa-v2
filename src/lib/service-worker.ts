/**
 * The browser's side of the service-worker contract.
 *
 * Kept out of the component so the messages have one definition shared with
 * `public/sw.js`, and so callers that are not React — the sign-out action's
 * caller, for instance — can use them too.
 */

export const SW_URL = "/sw.js";

export const SW_MESSAGES = {
  /** Hands control to a worker that is waiting, after the user accepts. */
  skipWaiting: "SKIP_WAITING",
  /** Drops page and image caches. Sent on sign-out. */
  clearCaches: "CLEAR_CACHES",
} as const;

function controller(): ServiceWorker | null {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  return navigator.serviceWorker.controller;
}

/**
 * Asks the active worker to drop what it has cached.
 *
 * Safe to call when there is no worker, no support, or nothing cached — a
 * sign-out must never fail because of housekeeping.
 */
export function clearServiceWorkerCaches(): void {
  controller()?.postMessage({ type: SW_MESSAGES.clearCaches });
}
