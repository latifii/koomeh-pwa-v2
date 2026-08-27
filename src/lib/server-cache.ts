import "server-only";

import { unstable_cache } from "next/cache";

/**
 * Wraps a server data fetch in Next's data cache.
 *
 * The shared HTTP client is axios, not `fetch`, so Next cannot see these
 * requests and none of its automatic caching or de-duplication applies. This
 * puts the cache back on top by hand — which is the whole reason the wrapper
 * exists, and the reason a `fetch`-based server client would make it
 * unnecessary.
 *
 * Note this sits *under* the page cache: a route with `revalidate` already
 * serves most visitors without rendering at all. What this buys is a cheap
 * re-render when that page does revalidate, reuse of the same data across
 * different routes, and — through tags — the ability to purge content the
 * moment it changes instead of waiting out a TTL.
 *
 * `unstable_cache` is still the supported API in Next 16; `"use cache"` is its
 * successor but requires `cacheComponents`, which cannot coexist with the
 * `export const revalidate` this app relies on.
 */
export function cachedFetch<TArgs extends unknown[], TResult>(
  /** Stable key parts. Anything that changes the result must appear in args. */
  keyParts: string[],
  fetcher: (...args: TArgs) => Promise<TResult>,
  options: {
    revalidate: number;
    /**
     * Either a fixed tag list, or a function of the arguments for a per-entity
     * tag like `estates:1234`.
     */
    tags: string[] | ((...args: TArgs) => string[]);
  },
): (...args: TArgs) => Promise<TResult> {
  const { revalidate, tags } = options;

  if (typeof tags !== "function") {
    return unstable_cache(fetcher, keyParts, { revalidate, tags });
  }

  // `unstable_cache` fixes its tags when it is called, so a tag that depends on
  // the id can only work by building the wrapper per invocation. Verified: this
  // does register real, individually purgeable tags — purging `agents:42`
  // leaves `agents:43` warm.
  return (...args: TArgs) =>
    unstable_cache(fetcher, keyParts, { revalidate, tags: tags(...args) })(
      ...args,
    );
}
