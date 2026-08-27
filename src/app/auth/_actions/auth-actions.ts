"use server";

import { buildSession } from "@/app/auth/_api/build-session";
import { login, logout } from "@/app/auth/_api/auth.service";
import { signInSchema, type SignInValues } from "@/app/auth/_schemas/auth.schema";
import { getApiErrorMessage } from "@/lib/api/api-error";
import {
  clearSessionCookie,
  getSession,
  setSessionCookie,
} from "@/lib/auth/session-cookie";

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
    return { ok: false, message: getApiErrorMessage(error) };
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
