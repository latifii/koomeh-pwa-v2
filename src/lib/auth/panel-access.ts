import type { PanelViewer } from "@/lib/auth/permissions";
import { routes } from "@/lib/routes";

/**
 * How far into the panel a given route reaches.
 *
 * Four levels, which is what the old monolith's sidebar actually distinguished
 * once the multi-tenant `SITE_ID` branches are dropped:
 *
 * - `everyone`  personal things any signed-in visitor has — favourites,
 *               comparisons, their own profile. No panel list is involved, so
 *               even a short-let landlord may open them.
 * - `member`    the panel proper. Everything here calls a list endpoint that
 *               answers 403 for a renter-only account (`denyUnlessPanelUser`),
 *               so that one account sees none of it.
 * - `staff`     an agent's own work: the calendar, tasks, matching, the
 *               scoreboard. `isExpert()` in the old menu.
 * - `admin`     office administration. `isAdmin()` in the old menu.
 *
 * This is the map the navigation is filtered by *and* the map the proxy
 * redirects on, so a bookmarked URL and a hidden link agree with each other.
 */
export type PanelAudience = "everyone" | "member" | "staff" | "admin";

export function canAccess(
  audience: PanelAudience,
  viewer: PanelViewer,
): boolean {
  if (!viewer.signedIn) return false;

  switch (audience) {
    case "everyone":
      return true;
    case "member":
      return !viewer.isRenterOnly;
    case "staff":
      return viewer.isStaff;
    case "admin":
      return viewer.isAdmin;
  }
}

/**
 * Route prefixes that need more than a signed-in visitor, longest first.
 *
 * Only the exceptions are listed: anything under `/panel` that is not matched
 * here is `everyone`, which keeps the table short and means a new personal
 * page needs no entry. `startsWith` on the prefix covers the detail routes
 * (`/panel/properties/12/manage` inherits the list's audience) — the segments
 * are distinct enough that no prefix is a prefix of an unrelated one.
 */
const PANEL_ROUTE_ACCESS: ReadonlyArray<readonly [string, PanelAudience]> = [
  [routes.panel.contacts, "admin"],
  [routes.panel.members, "admin"],
  [routes.panel.settings, "admin"],
  [routes.panel.branches, "admin"],
  [routes.panel.contracts, "admin"],
  [routes.panel.locations, "admin"],
  [routes.panel.posts, "admin"],
  [routes.panel.estateEdits, "admin"],
  [routes.panel.estateReports, "admin"],
  [routes.panel.relations, "admin"],
  [routes.panel.estateOperations, "admin"],
  [routes.panel.customerOperations, "admin"],
  [routes.panel.agentStats, "staff"],
  [routes.panel.appointments, "staff"],
  [routes.panel.tasks, "staff"],
  [routes.panel.matches, "staff"],
  [routes.panel.activities, "staff"],
  [routes.panel.properties, "member"],
  [routes.panel.requests, "member"],
  [routes.panel.dashboard, "member"],
];

export function panelAudienceFor(pathname: string): PanelAudience {
  const match = PANEL_ROUTE_ACCESS.find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  return match ? match[1] : "everyone";
}
