import { routes } from "@/lib/routes";

/** Everything below these prefixes requires a session. */
export const PROTECTED_PREFIXES = [routes.panel.root] as const;

/** Signing in from one of these bounces the visitor to the panel instead. */
export const AUTH_ROUTES = [
  routes.auth.login,
  routes.auth.register,
  routes.auth.verify,
  routes.auth.forgotPassword,
  routes.auth.resetPassword,
] as const;

/** Where a signed-in visitor lands when there is no `callbackUrl` to honour. */
export const AFTER_SIGN_IN = routes.panel.dashboard;

export const CALLBACK_PARAM = "callbackUrl";

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isAuthPath(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname === route);
}

/**
 * Only same-origin paths are accepted back, so a crafted `?callbackUrl=` cannot
 * turn the login page into an open redirect.
 */
export function safeCallbackUrl(value: string | null): string | undefined {
  if (!value) return undefined;

  let decoded = value;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return undefined;
  }

  if (!decoded.startsWith("/") || decoded.startsWith("//")) return undefined;
  return decoded;
}
