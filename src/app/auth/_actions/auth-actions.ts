"use server";

import { buildSession } from "@/app/auth/_api/build-session";
import {
  logout,
  me,
  siteSession,
  verifyCode,
  verifyMobile,
} from "@/app/auth/_api/auth.service";
import { mapSessionUser } from "@/app/auth/_mappers/auth.mapper";
import {
  mobileSchema,
  verifyStepSchema,
  type MobileValues,
  type VerifyStepValues,
} from "@/app/auth/_schemas/auth.schema";
import { getApiErrorMessage } from "@/lib/api/api-error";
import {
  clearSessionCookie,
  getSession,
  setSessionCookie,
} from "@/lib/auth/session-cookie";
import { forgetRefresh } from "@/lib/auth/refresh-guard";
import { AuthConfigError } from "@/lib/auth/session";
import { toClientSession, type ClientSession } from "@/lib/auth/session.types";

/**
 * Credentials never reach the browser's network tab and the tokens never leave
 * the server unencrypted: the form posts to these actions, which talk to the
 * API and write the signed session cookie. Sign-in is the API's two steps —
 * the number, then the password or a texted code; the one-shot /api/login
 * is still there in the service for anything that has both at once.
 */

export type ActionResult = { ok: true } | { ok: false; message: string };

/** What step one settled: how step two is done, and whether the account is new. */
export type StartSignInResult =
  | {
      ok: true;
      mobile: string;
      loginType: 1 | 2;
      isNewAccount: boolean;
      hasPassword: boolean;
      message?: string;
    }
  | { ok: false; message: string };

/**
 * Step one of the two-step sign-in. With `loginType` 2 a code is requested
 * even for an account that has a password («ورود با کد»); with
 * `forgetPass` the code also puts the account into change-password mode.
 */
export async function startSignInAction(
  values: MobileValues,
  options: { loginType?: 1 | 2; forgetPass?: boolean } = {},
): Promise<StartSignInResult> {
  const parsed = mobileSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "شماره همراه معتبر نیست.",
    };
  }

  try {
    const step = await verifyMobile(parsed.data.username, options);
    return {
      ok: true,
      mobile: parsed.data.username,
      loginType: step.login_type,
      isNewAccount: step.register === 1,
      hasPassword: step.has_password === 1,
      message: step.message,
    };
  } catch (error) {
    console.error("[auth] verify-mobile failed:", error);
    return { ok: false, message: getApiErrorMessage(error) };
  }
}

export type CompleteSignInResult =
  { ok: true; mustChangePassword: boolean } | { ok: false; message: string };

/** Step two: the password or the code; on success the session cookie is set. */
export async function completeSignInAction(
  values: VerifyStepValues,
): Promise<CompleteSignInResult> {
  const parsed = verifyStepSchema.safeParse(values);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "اطلاعات واردشده معتبر نیست.",
    };
  }

  try {
    const tokens = await verifyCode(parsed.data.mobile, parsed.data.code, {
      loginType: parsed.data.loginType,
      forgetPass: parsed.data.forgetPass,
    });
    await setSessionCookie(await buildSession(tokens));
    return { ok: true, mustChangePassword: tokens.must_change_password };
  } catch (error) {
    if (error instanceof AuthConfigError) {
      console.error("[auth] sign-in blocked by configuration:", error.message);
      return {
        ok: false,
        message: "سرویس ورود پیکربندی نشده است. با مدیر سامانه تماس بگیرید.",
      };
    }
    console.error("[auth] verify-code failed:", error);
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

export async function signOutAction(allDevices = false): Promise<ActionResult> {
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

  if (session) forgetRefresh(session.user.id);
  await clearSessionCookie();
  return { ok: true };
}
