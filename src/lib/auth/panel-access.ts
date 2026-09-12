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

/**
 * The most the panel offers anyone, whatever their role.
 *
 * Set to `staff`, which is the brief: every account gets the agent's panel and
 * nothing beyond it — an administrator included. The twelve office
 * administration pages (members, branches, settings, contracts, posts,
 * locations, the SMS module, estate reports and edits, estate and agent
 * operations) are still in the code with their `admin` audience and are not
 * offered: the menu never lists them and the proxy sends a visitor on to the
 * dashboard. Raising this back to `admin` is the whole of re-enabling them.
 *
 * This caps *pages*, not what a page does for an administrator. A row's
 * delete button, the site-wide dashboard, the group tick boxes in the
 * phonebook all come from the API's own `can_*` flags and `viewer.isAdmin`,
 * and are deliberately untouched.
 */
export const PANEL_AUDIENCE_CAP: PanelAudience = "staff";

const AUDIENCE_RANK: Record<PanelAudience, number> = {
  everyone: 0,
  member: 1,
  staff: 2,
  admin: 3,
};

/** Whether the cap alone rules an audience out, before any role is looked at. */
export function isCapped(audience: PanelAudience): boolean {
  return AUDIENCE_RANK[audience] > AUDIENCE_RANK[PANEL_AUDIENCE_CAP];
}

export function canAccess(
  audience: PanelAudience,
  viewer: PanelViewer,
): boolean {
  if (!viewer.signedIn) return false;
  if (isCapped(audience)) return false;

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
  [routes.panel.relations, "staff"],
  [routes.panel.estateOperations, "admin"],
  [routes.panel.customerOperations, "staff"],
  [routes.panel.userOperations, "admin"],
  [routes.panel.agentStats, "staff"],
  [routes.panel.phonebook, "staff"],
  [routes.panel.appointments, "staff"],
  [routes.panel.tasks, "staff"],
  [routes.panel.matches, "staff"],
  [routes.panel.activities, "staff"],
  [routes.panel.properties, "member"],
  [routes.panel.requests, "member"],
  [routes.panel.dashboard, "member"],
];

/**
 * Routes that exist in the code but are not offered to anyone yet.
 *
 * Each is a page whose backend service does not exist (the activity feed, the
 * matching board, free notes, view history, saved searches) or a page that has
 * been folded into another (account security now lives on the profile page).
 * The old site had none of them, and the brief is that an agent sees exactly
 * what the old site showed — no more, no less. They are kept rather than
 * deleted because they are wanted later: the proxy sends a visitor on, and
 * the navigation never lists them.
 */
export const PARKED_PANEL_ROUTES: ReadonlyArray<readonly [string, string]> = [
  [routes.panel.activities, routes.panel.dashboard],
  [routes.panel.matches, routes.panel.dashboard],
  [routes.panel.notes, routes.panel.dashboard],
  [routes.panel.history, routes.panel.dashboard],
  [routes.panel.savedSearches, routes.panel.dashboard],
  [routes.panel.security, routes.panel.profile],
];

/** Where a parked route sends its visitor, or `undefined` for a live one. */
export function parkedPanelRedirect(pathname: string): string | undefined {
  const match = PARKED_PANEL_ROUTES.find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  return match?.[1];
}

export function panelAudienceFor(pathname: string): PanelAudience {
  const match = PANEL_ROUTE_ACCESS.find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  return match ? match[1] : "everyone";
}
