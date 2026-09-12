/**
 * The single source of truth for application URLs.
 *
 * Keep route construction here so renaming an App Router segment never leaves
 * stale links scattered through components. Query values are encoded by
 * URLSearchParams rather than interpolated manually.
 */
export type RouteQueryValue = string | number | boolean | null | undefined;
export type RouteQuery = Record<
  string,
  RouteQueryValue | readonly RouteQueryValue[]
>;

function withQuery(pathname: string, query?: RouteQuery): string {
  if (!query) return pathname;

  const params = new URLSearchParams();

  for (const [key, rawValue] of Object.entries(query)) {
    const values = Array.isArray(rawValue) ? rawValue : [rawValue];

    for (const value of values) {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    }
  }

  const search = params.toString();
  return search ? `${pathname}?${search}` : pathname;
}

/**
 * The city segment of the search page. Only Qom is live; the slug is what the
 * old site used in `/c/{city}` and the API's own `view_all_url` still points
 * at it.
 */
export const DEFAULT_CITY_SLUG = "qom";

/**
 * The trailing slug of a legacy URL the API hands back for an entity —
 * `/v/427845/آپارتمان-انسجام-قم-…` → `آپارتمان-انسجام-قم-…`.
 *
 * The old site built those slugs from fields this app does not always have
 * (estate type label, district, city and title, in that order), so rather than
 * re-deriving them the API's own value is reused. That keeps every link and
 * canonical byte-for-byte what search engines already indexed. Absent or
 * malformed input yields `undefined`, and the id-only path still resolves.
 */
export function slugFromApiUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;

  let pathname = url;
  try {
    pathname = new URL(url, "https://koomeh.ir").pathname;
  } catch {
    return undefined;
  }

  const [, , , slug] = pathname.split("/");
  if (!slug) return undefined;

  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

function withSlug(pathname: string, slug?: string): string {
  return slug ? `${pathname}/${slug}` : pathname;
}

/**
 * Public paths follow the site this app replaces, segment for segment, so the
 * URLs search engines already hold keep resolving to the same content on the
 * day of the switch. Legacy aliases (`/{id}.html`, `/blog/show/{id}`, `/fa/…`)
 * are 301s in `next.config.ts`; the panel is new and keeps its own scheme.
 */
export const routes = {
  home: "/",
  about: "/about",
  contact: "/contactus",

  /** `city` in the query selects the path segment; everything else stays a filter. */
  properties: (query?: RouteQuery) => {
    const { city, ...filters } = query ?? {};
    const slug =
      typeof city === "string" && city ? city : DEFAULT_CITY_SLUG;
    return withQuery(`/c/${slug}`, filters);
  },
  property: (id: string | number, slug?: string) =>
    withSlug(`/v/${id}`, slug),
  propertyVirtualTour: (id: string | number) => `/virtual-tour/${id}`,

  neighborhoods: "/neighborhoods",
  neighborhood: (id: string | number, slug?: string) =>
    withSlug(`/area/${id}`, slug),

  agents: "/agents/search",
  agent: (id: string | number) => `/agents/${id}`,

  branches: "/branches",
  branch: (id: string | number) => `/branch/${id}`,

  articles: "/blog",
  article: (id: string | number, slug?: string) =>
    withSlug(`/blog/${id}`, slug),

  tools: {
    commission: "/commission_calculation",
    propertyAppraisal: "/property_appraisal",
  },

  auth: {
    login: "/auth/login",
    register: "/auth/register",
    verify: "/auth/verify",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
  },

  panel: {
    root: "/panel",
    dashboard: "/panel/dashboard",
    properties: "/panel/properties",
    newProperty: "/panel/properties/new",
    property: (id: string | number) => `/panel/properties/${id}`,
    editProperty: (id: string | number) => `/panel/properties/${id}/edit`,
    requests: "/panel/requests",
    newRequest: "/panel/requests/new",
    request: (id: string | number) => `/panel/requests/${id}`,
    editRequest: (id: string | number) => `/panel/requests/${id}/edit`,
    favorites: "/panel/favorites",
    compare: "/panel/compare",
    savedSearches: "/panel/saved-searches",
    history: "/panel/history",
    notes: "/panel/notes",
    matches: "/panel/matches",
    activities: "/panel/activities",
    tasks: "/panel/tasks",
    conversations: "/panel/conversations",
    conversation: (id: string | number) => `/panel/conversations/${id}`,
    contacts: "/panel/contacts",
    estateEdits: "/panel/estate-edits",
    estateReports: "/panel/estate-reports",
    relations: "/panel/relations",
    estateOperations: "/panel/estate-operations",
    customerOperations: "/panel/customer-operations",
    locations: "/panel/locations",
    contracts: "/panel/contracts",
    newContract: "/panel/contracts/new",
    contract: (id: string | number) => `/panel/contracts/${id}/edit`,
    editContract: (id: string | number) => `/panel/contracts/${id}/edit`,
    branches: "/panel/branches",
    newBranch: "/panel/branches/new",
    editBranch: (id: string | number) => `/panel/branches/${id}/edit`,
    settings: "/panel/settings",
    posts: "/panel/posts",
    newPost: "/panel/posts/new",
    editPost: (id: string | number) => `/panel/posts/${id}/edit`,
    members: "/panel/members",
    newMember: "/panel/members/new",
    editMember: (id: string | number) => `/panel/members/${id}/edit`,
    appointments: "/panel/appointments",
    agentStats: "/panel/agent-stats",
    notifications: "/panel/notifications",
    profile: "/panel/profile",
    security: "/panel/security",
    adManagement: (id: string | number) => `/panel/properties/${id}/manage`,
    propertyPreview: (id: string | number) => `/panel/properties/${id}/preview`,
  },
} as const;
