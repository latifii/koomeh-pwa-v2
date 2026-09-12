import { NextResponse } from "next/server";

import { buildSession } from "@/app/auth/_api/build-session";
import { checkRefresh, recordRefresh } from "@/lib/auth/refresh-guard";
import { isTokenRejected, refresh } from "@/app/auth/_api/auth.service";
import {
  clearSessionCookie,
  getSession,
  setSessionCookie,
} from "@/lib/auth/session-cookie";
import {
  isRefreshExpired,
  toClientSession,
} from "@/lib/auth/session.types";

/**
 * Called by the axios interceptor when an API call comes back 401 mid-session.
 * The refresh token stays server-side, so the browser can ask for a new access
 * token without ever holding the credential that mints it.
 *
 * Refresh tokens rotate — each one works exactly once — so two of these racing
 * would burn the pair. The client interceptor keeps a single in-flight promise
 * to make sure that cannot happen, and `refresh-guard` is the server's own
 * brake: one browser is not the only thing that can call this.
 */
export async function POST() {
  const session = await getSession();

  if (!session || isRefreshExpired(session)) {
    await clearSessionCookie();
    return NextResponse.json(null, { status: 401 });
  }

  const decision = checkRefresh(session.user.id);

  if (decision === "refused") {
    console.warn(
      `[auth] refresh rate limit hit for user ${session.user.id}; not rotating.`,
    );
    return NextResponse.json(
      { status: "error", message: "درخواست‌های تمدید نشست بیش از حد است." },
      { status: 429, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (decision === "cooldown") {
    // A rotation just happened, so the cookie already holds a fresh token.
    // Handing it back costs nothing and spends nothing.
    return NextResponse.json(toClientSession(session), {
      headers: { "Cache-Control": "no-store" },
    });
  }

  let tokens;
  try {
    tokens = await refresh(session.refreshToken);
  } catch (error) {
    // Only a token the API turned down ends the session. A 5xx or a network
    // failure says nothing about the cookie, so it stays: the caller's request
    // fails this once and the next 401 tries again. Deleting it here is what
    // used to sign visitors out whenever the backend had a bad moment.
    if (isTokenRejected(error)) {
      await clearSessionCookie();
      return NextResponse.json(null, { status: 401 });
    }

    console.error("[auth] refresh unavailable; keeping the session:", error);
    return NextResponse.json(
      { status: "error", message: "تمدید نشست موقتاً ممکن نیست." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  // The old refresh token is spent from here on, so whatever happens next the
  // new pair has to reach the cookie — `buildSession` falls back to the user
  // already in the session if the profile lookup fails.
  const next = await buildSession(tokens, session.user);
  await setSessionCookie(next);
  recordRefresh(next.user.id);

  return NextResponse.json(toClientSession(next), {
    headers: { "Cache-Control": "no-store" },
  });
}
