import type { z } from "zod";

import type {
  sessionUserSchema,
  userSessionSchema,
} from "./session.schema";

/**
 * Shapes shared by the proxy, the server actions and the browser store.
 *
 * Deliberately free of runtime imports. The types come from `session.schema`
 * through `import type`, which the compiler erases — so the browser store can
 * import from here without dragging `zod` into the first load of every page,
 * while the two definitions still cannot drift apart.
 *
 * Also free of `next/headers`, `node:` and `axios`, so the proxy can pull it in
 * — it runs on Node today, but staying runtime-agnostic costs nothing.
 */

export type SessionUser = z.infer<typeof sessionUserSchema>;
export type UserSession = z.infer<typeof userSessionSchema>;

/**
 * What `/api/auth/session` hands the browser. The refresh token stays on the
 * server — the client never needs it and rotating it from two places at once
 * would invalidate the pair.
 */
export type ClientSession = Omit<UserSession, "refreshToken">;

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export function toClientSession(session: UserSession): ClientSession {
  return {
    user: session.user,
    accessToken: session.accessToken,
    expiresAt: session.expiresAt,
    refreshExpiresAt: session.refreshExpiresAt,
  };
}

/** A minute of slack so a token never expires mid-flight. */
const EXPIRY_SKEW_MS = 60_000;

export function isAccessExpired(session: UserSession, now = Date.now()): boolean {
  return session.expiresAt - EXPIRY_SKEW_MS <= now;
}

export function isRefreshExpired(session: UserSession, now = Date.now()): boolean {
  return session.refreshExpiresAt <= now;
}
