import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

import { isPurgeableTag } from "@/lib/cache-policy";

/**
 * Purges cached data and pages on demand.
 *
 * Everything the site caches is otherwise time-based: a listing edited in the
 * panel keeps showing its old copy until the TTL runs out. This is the way to
 * make a change visible immediately, and it is what makes the tag vocabulary in
 * `cache-policy.ts` worth having at all.
 *
 * Call it from the backend when content changes:
 *
 *   POST /api/revalidate
 *   x-revalidate-secret: <REVALIDATE_SECRET>
 *   { "tags": ["estates:1234", "home:latest-sale-estates"], "paths": ["/"] }
 *
 * Without `REVALIDATE_SECRET` configured the route refuses every request —
 * an open purge endpoint is a denial-of-service lever, since each call forces
 * the next visitor to pay for a full re-render.
 */

const MAX_ITEMS = 50;

type PurgeBody = { tags?: unknown; paths?: unknown };

function asList(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

/** Only same-site paths; a purge is not a place to accept arbitrary input. */
function isPurgeablePath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//") && path.length < 512;
}

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;

  if (!secret) {
    console.error(
      "[revalidate] REVALIDATE_SECRET is not set; refusing to purge. " +
        "Set it in the hosting environment — see .env.example.",
    );
    return NextResponse.json(
      { status: "error", message: "Revalidation is not configured." },
      { status: 503 },
    );
  }

  if (request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json(
      { status: "error", message: "Invalid secret." },
      { status: 401 },
    );
  }

  let body: PurgeBody;
  try {
    body = (await request.json()) as PurgeBody;
  } catch {
    return NextResponse.json(
      { status: "error", message: "Body must be JSON." },
      { status: 400 },
    );
  }

  const tags = asList(body.tags).slice(0, MAX_ITEMS);
  const paths = asList(body.paths).slice(0, MAX_ITEMS);

  if (tags.length === 0 && paths.length === 0) {
    return NextResponse.json(
      { status: "error", message: "Name at least one tag or path." },
      { status: 400 },
    );
  }

  const rejected: string[] = [];
  const purgedTags: string[] = [];
  const purgedPaths: string[] = [];

  for (const tag of tags) {
    if (!isPurgeableTag(tag)) {
      rejected.push(tag);
      continue;
    }
    // Next 16 requires a lifetime alongside the tag; `expire: 0` is the
    // immediate purge a webhook wants. `updateTag` would be the other option
    // but it only works inside a Server Action, not a route handler.
    revalidateTag(tag, { expire: 0 });
    purgedTags.push(tag);
  }

  for (const path of paths) {
    if (!isPurgeablePath(path)) {
      rejected.push(path);
      continue;
    }
    revalidatePath(path);
    purgedPaths.push(path);
  }

  return NextResponse.json({
    status: "success",
    result: { tags: purgedTags, paths: purgedPaths, rejected },
  });
}
