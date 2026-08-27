import "server-only";

import { cookies } from "next/headers";

import {
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  decryptSession,
  encryptSession,
  sessionMaxAge,
} from "./session";
import type { UserSession } from "./session.types";

/**
 * Cookie access for server actions, route handlers and server components.
 * The middleware cannot use these — it reads and writes cookies on the
 * `NextRequest`/`NextResponse` pair instead.
 */

export async function getSession(): Promise<UserSession | null> {
  const store = await cookies();
  return decryptSession(store.get(SESSION_COOKIE)?.value);
}

export async function setSessionCookie(session: UserSession): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, await encryptSession(session), {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: sessionMaxAge(session),
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
