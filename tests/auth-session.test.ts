import assert from "node:assert/strict";
import { test } from "vitest";

import {
  isAccessExpired,
  isRefreshExpired,
  toClientSession,
  userSessionSchema,
  type UserSession,
} from "@/lib/auth/session.types";
import { safeCallbackUrl } from "@/lib/auth/routes";
import {
  checkRefresh,
  forgetRefresh,
  recordRefresh,
} from "@/lib/auth/refresh-guard";

/**
 * The session rules, which are the app's sharpest invariants: a refresh token
 * works exactly once, and the refresh token must never reach the browser.
 * Nothing here touches the network — these are the pure decisions the rest of
 * the auth flow is built on.
 */

const NOW = 1_800_000_000_000;

function session(overrides: Partial<UserSession> = {}): UserSession {
  return {
    user: {
      id: 42,
      fullName: "کاربر تست",
      roles: ["expert"],
      isAdmin: false,
      isExpert: true,
    },
    accessToken: "access",
    refreshToken: "refresh",
    expiresAt: NOW + 3_600_000,
    refreshExpiresAt: NOW + 7 * 86_400_000,
    ...overrides,
  };
}

test("the refresh token never leaves the server", () => {
  const client = toClientSession(session());
  assert.equal("refreshToken" in client, false);
  assert.equal(client.accessToken, "access");
});

test("access expiry allows a minute of clock skew", () => {
  // 90 seconds of life left: still usable.
  assert.equal(isAccessExpired(session({ expiresAt: NOW + 90_000 }), NOW), false);
  // 30 seconds left is inside the skew, so it counts as expired already —
  // otherwise a request could go out with a token that dies mid-flight.
  assert.equal(isAccessExpired(session({ expiresAt: NOW + 30_000 }), NOW), true);
});

test("the refresh window has no skew — past it nothing can be renewed", () => {
  assert.equal(isRefreshExpired(session({ refreshExpiresAt: NOW + 1 }), NOW), false);
  assert.equal(isRefreshExpired(session({ refreshExpiresAt: NOW }), NOW), true);
});

test("a cookie from an older shape is rejected rather than half-read", () => {
  const stale = { ...session(), user: { id: 42, roles: [] } };
  assert.equal(userSessionSchema.safeParse(stale).success, false);
});

test("the JWT's own claims are stripped, not carried into the session", () => {
  const parsed = userSessionSchema.parse({ ...session(), iat: 1, exp: 2 });
  assert.equal("iat" in parsed, false);
  assert.equal("exp" in parsed, false);
});

test("callbackUrl only accepts same-origin paths", () => {
  assert.equal(safeCallbackUrl("/panel/dashboard"), "/panel/dashboard");
  assert.equal(safeCallbackUrl("%2Fpanel%2Frequests"), "/panel/requests");

  for (const hostile of [
    "//evil.example.com",
    "https://evil.example.com",
    "%2F%2Fevil.example.com",
    "javascript:alert(1)",
    "",
    null,
  ]) {
    assert.equal(safeCallbackUrl(hostile), undefined, `accepted: ${hostile}`);
  }
});

test("a burst of refreshes rotates once, then rides the cooldown", () => {
  forgetRefresh(7);

  assert.equal(checkRefresh(7, NOW), "rotate");
  recordRefresh(7, NOW);

  // The panel's five dashboard queries landing together must not each rotate.
  assert.equal(checkRefresh(7, NOW + 100), "cooldown");
  assert.equal(checkRefresh(7, NOW + 2_999), "cooldown");

  // Far enough apart to be a genuine second expiry, not a burst.
  assert.equal(checkRefresh(7, NOW + 3_001), "rotate");
  forgetRefresh(7);
});

test("sustained hammering is refused outright", () => {
  forgetRefresh(9);

  let at = NOW;
  for (let i = 0; i < 12; i += 1) {
    assert.equal(checkRefresh(9, at), "rotate", `refused early at ${i}`);
    recordRefresh(9, at);
    at += 4_000;
  }

  assert.equal(checkRefresh(9, at), "refused");

  // A new window starts clean, so a long-lived session is never locked out.
  assert.equal(checkRefresh(9, NOW + 120_000), "rotate");
  forgetRefresh(9);
});

test("signing out forgets the counters", () => {
  recordRefresh(11, NOW);
  assert.equal(checkRefresh(11, NOW + 100), "cooldown");
  forgetRefresh(11);
  assert.equal(checkRefresh(11, NOW + 100), "rotate");
});
