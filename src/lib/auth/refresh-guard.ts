import "server-only";

/**
 * Keeps one session from spending refresh tokens faster than it can use them.
 *
 * Every call to `/api/auth/refresh` rotates the pair, and each token works
 * exactly once. Two things can drive that far above what a session needs: a
 * burst of 401s from one page load, and anyone replaying the endpoint with a
 * stolen cookie.
 *
 * Two rules, and they answer differently on purpose:
 *
 * - Inside `COOLDOWN_MS` of a successful rotation, the caller is handed the
 *   session that rotation produced instead of a new one. That is the burst
 *   case, and the caller's token is valid, so failing it would be wrong.
 * - Past `MAX_PER_WINDOW` in `WINDOW_MS`, the call is refused outright. No
 *   legitimate session needs to rotate that often.
 *
 * This is per-instance memory, so on a serverless host each instance keeps its
 * own count and the effective limit is higher than the numbers below. It still
 * flattens the common cases; a shared store would be the next step if this ever
 * needs to be a real defence rather than a brake.
 */

const COOLDOWN_MS = 3_000;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;

/** Bounds memory on a long-lived instance; entries are tiny and short-lived. */
const MAX_TRACKED = 5_000;

type Entry = { lastRotatedAt: number; windowStart: number; count: number };

const sessions = new Map<number, Entry>();

export type RefreshDecision = "rotate" | "cooldown" | "refused";

export function checkRefresh(userId: number, now = Date.now()): RefreshDecision {
  const entry = sessions.get(userId);

  if (!entry) return "rotate";

  if (now - entry.windowStart < WINDOW_MS && entry.count >= MAX_PER_WINDOW) {
    return "refused";
  }

  if (now - entry.lastRotatedAt < COOLDOWN_MS) return "cooldown";

  return "rotate";
}

export function recordRefresh(userId: number, now = Date.now()): void {
  if (sessions.size >= MAX_TRACKED) sessions.clear();

  const entry = sessions.get(userId);

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    sessions.set(userId, { lastRotatedAt: now, windowStart: now, count: 1 });
    return;
  }

  entry.lastRotatedAt = now;
  entry.count += 1;
}

/** Sign-out should not leave a session's counters behind. */
export function forgetRefresh(userId: number): void {
  sessions.delete(userId);
}
