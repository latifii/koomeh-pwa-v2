"use server";

import { buildSession } from "@/app/auth/_api/build-session";
import { login, logout, me, siteSession } from "@/app/auth/_api/auth.service";
import { mapSessionUser } from "@/app/auth/_mappers/auth.mapper";
import { signInSchema, type SignInValues } from "@/app/auth/_schemas/auth.schema";
import { getApiErrorMessage } from "@/lib/api/api-error";
import {
  clearSessionCookie,
  getSession,
  setSessionCookie,
} from "@/lib/auth/session-cookie";
import { AuthConfigError } from "@/lib/auth/session";
import { toClientSession, type ClientSession } from "@/lib/auth/session.types";

/**
 * Credentials never reach the browser's network tab and the tokens never leave
 * the server unencrypted: the form posts to these actions, which talk to the
 * API and write the signed session cookie.
 */

export type ActionResult = { ok: true } | { ok: false; message: string };

export async function signInAction(values: SignInValues): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "اطلاعات واردشده معتبر نیست.",
    };
  }

  try {
    const tokens = await login(parsed.data.username, parsed.data.password);
    await setSessionCookie(await buildSession(tokens));
    return { ok: true };
  } catch (error) {
    // A missing signing key is a deployment problem, not a bad password, and
    // must not be reported as one. The detail goes to the server log where an
    // operator will actually see it.
    if (error instanceof AuthConfigError) {
      console.error("[auth] sign-in blocked by configuration:", error.message);
      return {
        ok: false,
        message: "سرویس ورود پیکربندی نشده است. با مدیر سامانه تماس بگیرید.",
      };
    }

    console.error("[auth] sign-in failed:", error);
    return { ok: false, message: getApiErrorMessage(error) };
  }
}

/**
 * Re-reads the user from the API and re-signs the cookie with it.
 *
 * The profile lives *inside* the session JWT, so editing it in the panel leaves
 * the old name and photo in the cookie until the access token happens to
 * rotate. Asking `/api/auth/session` again does not help — that reads the same
 * stale cookie. The tokens are carried over untouched: this is a profile
 * refresh, not a rotation, and spending the refresh token here would be wrong.
 *
 * Returns the session to hand straight to the store, or `null` when nobody is
 * signed in. If the API call fails the existing session is returned unchanged —
 * a stale name is not a reason to sign someone out.
 */
export async function syncSessionUserAction(): Promise<ClientSession | null> {
  const session = await getSession();
  if (!session) return null;

  try {
    const [user, site] = await Promise.all([
      me(session.accessToken),
      siteSession(session.accessToken),
    ]);
    const updated = { ...session, user: mapSessionUser(user, site) };
    await setSessionCookie(updated);
    return toClientSession(updated);
  } catch (error) {
    console.error("[auth] session sync failed:", error);
    return toClientSession(session);
  }
}

export async function signOutAction(
  allDevices = false,
): Promise<ActionResult> {
  const session = await getSession();

  // The cookie goes regardless of what the API says — a user who asked to leave
  // must end up logged out even if the revoke call fails.
  if (session) {
    try {
      await logout(session.accessToken, allDevices);
    } catch {
      // Token already revoked or the service is down; nothing to recover.
    }
  }

  await clearSessionCookie();
  return { ok: true };
}
