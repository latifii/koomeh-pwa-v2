import { z } from "zod";

/**
 * Shapes shared by the middleware, the server actions and the browser store.
 * Keep this module free of `next/headers`, `node:` and `axios` imports so the
 * Edge middleware can pull it in.
 *
 * These are schemas rather than bare types because the session cookie is parsed
 * on the way in, the same way every API response is. See `decryptSession`.
 */

export const sessionUserSchema = z.object({
  id: z.number(),
  fullName: z.string(),
  username: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  photo: z.string().optional(),
  roles: z.array(z.string()),
  isAdmin: z.boolean(),
  isExpert: z.boolean(),
});

export type SessionUser = z.infer<typeof sessionUserSchema>;

/** What the encrypted cookie carries. Times are epoch milliseconds. */
export const userSessionSchema = z.object({
  user: sessionUserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.number(),
  refreshExpiresAt: z.number(),
});

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
