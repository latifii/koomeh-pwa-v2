/**
 * The browser's side of the service-worker contract.
 *
 * Kept out of the component so the messages have one definition shared with
 * `public/sw.js`, and so callers that are not React — the sign-out action's
 * caller, for instance — can use them too.
 */

/**
 * The build stamp, baked in by `next.config.ts`.
 *
 * `sw.js` is a static file with no hash in its name, so without this it is
 * byte-identical after every deploy and the browser never installs a new
 * worker — which left the page cache serving a retired build until somebody
 * pressed Ctrl+F5. A changed script URL is what makes the browser look again.
 */
export const SW_VERSION = process.env.NEXT_PUBLIC_SW_VERSION || "dev";

export function swUrlFor(version: string): string {
  return `/sw.js?v=${encodeURIComponent(version)}`;
}

export const SW_URL = swUrlFor(SW_VERSION);

/**
 * Which build the server is serving, or `null` if the question could not be
 * asked. Used to notice a deploy from a tab that has been open across it.
 */
export async function fetchLiveVersion(): Promise<string | null> {
  try {
    const response = await fetch("/api/version", { cache: "no-store" });
    if (!response.ok) return null;
    const body = (await response.json()) as { version?: unknown };
    return typeof body.version === "string" ? body.version : null;
  } catch {
    return null;
  }
}

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
