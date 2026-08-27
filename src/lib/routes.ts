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

export const routes = {
  home: "/",
  about: "/about",
  contact: "/contact",

  properties: (query?: RouteQuery) => withQuery("/properties", query),
  property: (id: string | number) => `/properties/${id}`,
  propertyVirtualTour: (id: string | number) =>
    `/properties/${id}/virtual-tour`,

  neighborhoods: "/neighborhoods",
  neighborhood: (id: string | number) => `/neighborhoods/${id}`,

  agents: "/agents",
  agent: (id: string | number) => `/agents/${id}`,

  branches: "/branches",
  branch: (id: string | number) => `/branches/${id}`,

  articles: "/articles",
  article: (id: string | number) => `/articles/${id}`,

  tools: {
    commission: "/tools/commission",
    propertyAppraisal: "/tools/property-appraisal",
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
    appointments: "/panel/appointments",
    agentStats: "/panel/agent-stats",
    notifications: "/panel/notifications",
    profile: "/panel/profile",
    security: "/panel/security",
    adManagement: (id: string | number) => `/panel/properties/${id}/manage`,
    propertyPreview: (id: string | number) => `/panel/properties/${id}/preview`,
  },
} as const;
