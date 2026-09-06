import { NextResponse } from "next/server";

import { SW_VERSION } from "@/lib/service-worker";

/**
 * Which build is live right now.
 *
 * The page needs this because of how service-worker updates are detected. The
 * browser only re-fetches the script URL a page *registered*, and that URL is
 * baked into the bundle the visitor is already running — so an open tab asking
 * "is there anything new?" was asking about its own build and always hearing
 * no. A deploy went unnoticed until a full page load, which in an App Router
 * app means until somebody pressed refresh; the prompt then landed on top of
 * the reload they had just asked for.
 *
 * One number from the running server settles it. If it differs from the one
 * this page was built with, there is a new build to offer.
 */
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    { version: SW_VERSION },
    { headers: { "Cache-Control": "no-store" } },
  );
}
