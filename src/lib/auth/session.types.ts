/**
 * Shapes shared by the middleware, the server actions and the browser store.
 * Keep this module free of `next/headers`, `node:` and `axios` imports so the
 * Edge middleware can pull it in.
 */

export type SessionUser = {
  id: number;
  fullName: string;
  username?: string;
  email?: string;
  phone?: string;
  photo?: string;
  roles: string[];
  isAdmin: boolean;
  isExpert: boolean;
};

/** What the encrypted cookie carries. Times are epoch milliseconds. */
export type UserSession = {
  user: SessionUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  refreshExpiresAt: number;
};

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
