import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session-cookie";
import { toClientSession } from "@/lib/auth/session.types";

/**
 * The browser's view of the session. Returns `null` rather than a 401 for a
 * signed-out visitor — "nobody is logged in" is a normal answer here, not an
 * error the store should have to special-case.
 */
export async function GET() {
  const session = await getSession();

  return NextResponse.json(session ? toClientSession(session) : null, {
    headers: { "Cache-Control": "no-store" },
  });
}
