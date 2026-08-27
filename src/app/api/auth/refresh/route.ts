import { NextResponse } from "next/server";

import { buildSession } from "@/app/auth/_api/build-session";
import { checkRefresh, recordRefresh } from "@/lib/auth/refresh-guard";
import { refresh } from "@/app/auth/_api/auth.service";
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

  try {
    const tokens = await refresh(session.refreshToken);
    const next = await buildSession(tokens);
    await setSessionCookie(next);
    recordRefresh(next.user.id);

    return NextResponse.json(toClientSession(next), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    await clearSessionCookie();
    return NextResponse.json(null, { status: 401 });
  }
}
