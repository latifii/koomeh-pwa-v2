"use client";

import type { ReactNode } from "react";

import { seedSession } from "@/app/auth/_stores/auth.store";
import type { ClientSession } from "@/lib/auth/session.types";

/**
 * Puts the access token in place before any panel query runs.
 *
 * Without this, a cold panel load fired every dashboard query with no
 * `Authorization` header — the token was only set in an effect, and effects run
 * child-first. Each of those calls came back 401, and each 401 spent a refresh
 * token rotation. The interceptor de-duplicated them into one rotation rather
 * than five, so nothing visibly broke, but every cold entry to the panel burned
 * a token that only works once and doubled the request count.
 *
 * Seeding happens during render, which is why this is a component rather than a
 * `useEffect` anywhere.
 */
export function PanelSessionBoundary({
  session,
  children,
}: {
  session: ClientSession | null;
  children: ReactNode;
}) {
  seedSession(session);
  return children;
}
