import { assertAuthSecret } from "@/lib/auth/session";

/**
 * Runs once per runtime before the server takes its first request.
 *
 * Without this, a deploy missing `AUTH_SECRET` goes live looking healthy: the
 * public pages render, `decryptSession` reports every visitor as signed out,
 * and the fault only surfaces when someone tries to sign in — with nothing in
 * the logs to explain it.
 *
 * Throwing here is deliberate and it is not free: the server refuses to start,
 * so the whole site returns 500 rather than only sign-in being broken. That is
 * the trade — a deployment that is loudly and obviously wrong beats one that
 * looks fine and quietly cannot authenticate anyone. It does not run during
 * `next build`, so the build still succeeds; the failure is at boot.
 */
export function register() {
  assertAuthSecret();
}
