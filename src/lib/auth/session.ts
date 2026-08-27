import { type JWTPayload, SignJWT, jwtVerify } from "jose";

import { userSessionSchema, type UserSession } from "./session.types";

/**
 * The session cookie is a JWT signed with a server-only secret, so nothing but
 * this app can mint or read one. `jose` is used rather than `node:crypto`
 * because it works in every runtime — proxy runs on Node today, but nothing
 * here has to change if that is ever switched to Edge.
 */

export const SESSION_COOKIE = "koomeh-session";

/** Applied wherever the cookie is written, so the flags never drift apart. */
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;

/**
 * Thrown when the app is deployed without a signing key. Its own class so the
 * sign-in action can tell a misconfigured server apart from a wrong password —
 * they are not the same problem and must not read the same to the operator.
 */
export class AuthConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthConfigError";
  }
}

/**
 * The one place the signing key is validated. `instrumentation.ts` calls it at
 * boot so a deployment without a key never goes live; the functions below call
 * it too, because the environment can also change between builds.
 */
export function assertAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new AuthConfigError(
      "AUTH_SECRET is missing or shorter than 32 characters. Set it in the " +
        "hosting environment (Vercel → Settings → Environment Variables) and " +
        "redeploy — see .env.example.",
    );
  }

  return secret;
}

function secretKey(): Uint8Array {
  return new TextEncoder().encode(assertAuthSecret());
}

export async function encryptSession(session: UserSession): Promise<string> {
  return new SignJWT(session as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    // The cookie outlives the access token; the refresh window is what bounds it.
    .setExpirationTime(Math.floor(session.refreshExpiresAt / 1000))
    .sign(secretKey());
}

/** Returns `null` for a missing, tampered or expired cookie rather than throwing. */
export async function decryptSession(
  token: string | undefined,
): Promise<UserSession | null> {
  if (!token) return null;

  // Outside the `try` on purpose: a server with no signing key is a broken
  // deployment, and swallowing that would report every visitor as signed out
  // with nothing in the logs to say why.
  const key = secretKey();

  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    // A valid signature only proves this app minted the cookie — not that it
    // still matches the shape this build expects. A cookie written before
    // `SessionUser` changed verifies fine and would otherwise reach components
    // with fields missing; parsing turns that into a clean sign-out instead.
    return userSessionSchema.parse(payload);
  } catch {
    return null;
  }
}

/** Cookie `maxAge`, in seconds, matching the refresh window. */
export function sessionMaxAge(session: UserSession): number {
  return Math.max(0, Math.floor((session.refreshExpiresAt - Date.now()) / 1000));
}
