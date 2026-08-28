/**
 * The public origin this app is served from.
 *
 * Distinct from `NEXT_PUBLIC_API_BASE_URL`, which points at the backend: the
 * two are only the same host by coincidence, and a sitemap that advertises the
 * API's origin would list URLs that do not exist. Anything that has to be
 * absolute — sitemap entries, canonical links, JSON-LD `@id`, Open Graph — is
 * built from this.
 *
 * Falls back to the production domain rather than throwing: a missing variable
 * should not break a preview deployment, and the only cost of being wrong is a
 * sitemap that names the wrong host, which is visible the moment it is read.
 */
const DEFAULT_SITE_URL = "https://koomeh.ir";

function normalize(value: string): string {
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withScheme.replace(/\/+$/, "");
}

export const siteUrl = normalize(
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL,
);

/** `absoluteUrl("/properties/1")` → `https://…/properties/1`. */
export function absoluteUrl(path: string): string {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
