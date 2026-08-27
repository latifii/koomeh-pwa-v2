import { NextResponse } from "next/server";

import { buildSession } from "@/app/auth/_api/build-session";
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
 * to make sure that cannot happen.
 */
export async function POST() {
  const session = await getSession();

  if (!session || isRefreshExpired(session)) {
    await clearSessionCookie();
    return NextResponse.json(null, { status: 401 });
  }

  try {
    const tokens = await refresh(session.refreshToken);
    const next = await buildSession(tokens);
    await setSessionCookie(next);

    return NextResponse.json(toClientSession(next), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    await clearSessionCookie();
    return NextResponse.json(null, { status: 401 });
  }
}
