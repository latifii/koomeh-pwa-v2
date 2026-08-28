/**
 * The public origin this app is served from.
 *
 * Distinct from `NEXT_PUBLIC_API_BASE_URL`, which points at the backend: the
 * two are only the same host by coincidence, and a sitemap that advertises the
 * API's origin would list URLs that do not exist. Anything that has to be
 * absolute — sitemap entries, canonical links, JSON-LD ids, Open Graph — is
 * built from this.
 *
 * The Vercel fallbacks exist because this ships to a preview domain today and
 * the real one later, and getting it wrong is quiet: relative Open Graph URLs
 * resolve against the wrong host and nothing errors. `PROJECT_PRODUCTION_URL`
 * is preferred over `VERCEL_URL` because the latter is per-deployment, and a
 * sitemap should not name a URL that dies with the next push.
 *
 * Set `NEXT_PUBLIC_SITE_URL` explicitly once the real domain is live — it wins
 * over everything below it.
 */
const DEFAULT_SITE_URL = "https://koomeh.ir";

function normalize(value: string): string {
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withScheme.replace(/\/+$/, "");
}

function resolve(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
    process.env.NEXT_PUBLIC_VERCEL_URL,
  ];

  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (trimmed) return normalize(trimmed);
  }

  return DEFAULT_SITE_URL;
}

export const siteUrl = resolve();

/** `absoluteUrl("/properties/1")` → `https://…/properties/1`. */
export function absoluteUrl(path: string): string {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
