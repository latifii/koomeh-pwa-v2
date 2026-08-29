import type { SessionUser } from "@/lib/auth/session.types";

/**
 * The role model, transcribed from the backend that issues these sessions.
 *
 * The old monolith decided what a visitor could see with a handful of
 * predicates on its `User` model (`isAdmin`, `isExpert`, `isManager`,
 * `isRenterOnly`, …). Now that the front end is a separate application it has
 * to answer the same questions to decide what to put in the panel — so the
 * predicates are reproduced here, from `app/Models/User.php` and
 * `Api/Concerns/AppliesPanelRoleRules.php`, rather than re-invented.
 *
 * None of this is a security boundary. The session carries a *snapshot* of the
 * roles, refreshed on every token rotation and so at most one access-token
 * lifetime stale, and a determined visitor can edit what their own browser
 * believes anyway. The API decides, and answers 401/403 regardless of what is
 * claimed here. What this file buys is a panel that does not offer doors that
 * open onto an error.
 */

/**
 * Every role slug the backend hands out, as `getRoleNames()` spells them.
 *
 * Spatie returns the `name` column, which is the same latin slug the PHP
 * predicates match on — so these strings compare directly against
 * `session.user.roles`.
 */
export const ROLES = {
  administrator: "administrator",
  adminSuper: "admin_super",
  adminSite: "admin_site",
  adminBranch: "admin_branch",
  adminFinancial: "admin_financial",
  adminMarketing: "admin_marketing",
  adminLegal: "admin_legal",
  expert: "expert",
  externalExpert: "external_expert",
  referrer: "referrer",
  agent: "agent",
  operator: "operator",
  driver: "driver",
  renter: "renter",
  accountant: "accountant",
  secretary: "secretary",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

type MaybeUser = Pick<SessionUser, "roles" | "isAdmin" | "isExpert"> | null | undefined;

/** `hasAnyRole` — true when the user holds at least one of the given slugs. */
export function hasAnyRole(user: MaybeUser, ...roles: string[]): boolean {
  if (!user) return false;
  return roles.some((role) => user.roles.includes(role));
}

/* -------------------------------------------------------------- predicates */

/**
 * `isAdmin()` — administrator, super admin, or the office secretary.
 *
 * Taken from the server flag rather than recomputed: the backend folds
 * `isActive()` (the `has_role` column) into it, and that column is not in the
 * session. `hasAnyRole('admin_super', 'administrator', 'secretary')` is the
 * role half of the same test, kept as the fallback for a session minted before
 * the flag existed.
 */
export function isAdmin(user: MaybeUser): boolean {
  if (!user) return false;
  return (
    user.isAdmin ||
    hasAnyRole(user, ROLES.adminSuper, ROLES.administrator, ROLES.secretary)
  );
}

/**
 * `isExpert()` — does day-to-day agent work.
 *
 * Wider than it looks: managers and the secretary are experts too, because the
 * everyday half of the panel (customers, appointments, the phone book) hangs
 * off this test and an office manager who fell out of it would lose half the
 * panel.
 */
export function isExpert(user: MaybeUser): boolean {
  if (!user) return false;
  return (
    user.isExpert ||
    hasAnyRole(
      user,
      ROLES.expert,
      ROLES.adminSuper,
      ROLES.adminBranch,
      ROLES.administrator,
      ROLES.externalExpert,
      ROLES.secretary,
    )
  );
}

/**
 * `isAdminReal()` — a manager in the sense of holding real authority: money,
 * handing roles to other people, the name shown under the avatar. Deliberately
 * narrower than `isAdmin`, which the secretary passes.
 */
export function isAdminReal(user: MaybeUser): boolean {
  return hasAnyRole(user, ROLES.adminSuper, ROLES.administrator);
}

/** `isManager()` — any level of management, not only the top one. */
export function isManager(user: MaybeUser): boolean {
  return hasAnyRole(
    user,
    ROLES.administrator,
    ROLES.adminSuper,
    ROLES.adminSite,
    ROLES.adminBranch,
    ROLES.adminFinancial,
    ROLES.adminMarketing,
    ROLES.secretary,
  );
}

/**
 * `isPanelManager()` — the narrower list the panel *lists* use, which is not
 * the same set as `isManager()`: the finance and legal managers are not in it.
 * Copied as-is so the row-level buttons this drives agree with the API.
 */
export function isPanelManager(user: MaybeUser): boolean {
  return hasAnyRole(
    user,
    ROLES.administrator,
    ROLES.adminSuper,
    ROLES.adminSite,
    ROLES.adminMarketing,
    ROLES.adminBranch,
  );
}

/** `isReferrer()` — brings in listings, whether or not they also advise. */
export function isReferrer(user: MaybeUser): boolean {
  return hasAnyRole(
    user,
    ROLES.expert,
    ROLES.adminSuper,
    ROLES.adminBranch,
    ROLES.referrer,
    ROLES.administrator,
  );
}

/** `isExpertOnly()` — advises, manages nothing. */
export function isExpertOnly(user: MaybeUser): boolean {
  return (
    hasAnyRole(user, ROLES.expert, ROLES.externalExpert) && !isManager(user)
  );
}

export function isDriver(user: MaybeUser): boolean {
  return hasAnyRole(user, ROLES.driver);
}

/**
 * `isRenterOnly()` — a short-let landlord and nothing else.
 *
 * The only role the API turns away outright: every panel list answers 403 for
 * it (`denyUnlessPanelUser`), so the panel must not link to any of them.
 */
export function isRenterOnly(user: MaybeUser): boolean {
  return (
    hasAnyRole(user, ROLES.renter) &&
    !isExpert(user) &&
    !isManager(user) &&
    !isReferrer(user)
  );
}

export function isAccountant(user: MaybeUser): boolean {
  return hasAnyRole(user, ROLES.accountant);
}

/** `canAccessAccounting()` — the books, which the secretary is kept out of. */
export function canAccessAccounting(user: MaybeUser): boolean {
  return hasAnyRole(
    user,
    ROLES.adminSuper,
    ROLES.administrator,
    ROLES.accountant,
  );
}

/* ------------------------------------------------------------------ viewer */

/**
 * Who is looking, reduced to the four questions the panel navigation asks.
 *
 * Computed once per render and passed down, so a sidebar of five groups does
 * not walk the roles array thirty times.
 */
export type PanelViewer = {
  signedIn: boolean;
  isAdmin: boolean;
  isExpert: boolean;
  /** Either of the two above — what most of the panel actually gates on. */
  isStaff: boolean;
  isRenterOnly: boolean;
};

export const ANONYMOUS_VIEWER: PanelViewer = {
  signedIn: false,
  isAdmin: false,
  isExpert: false,
  isStaff: false,
  isRenterOnly: false,
};

export function panelViewer(user: MaybeUser): PanelViewer {
  if (!user) return ANONYMOUS_VIEWER;

  const admin = isAdmin(user);
  const expert = isExpert(user);

  return {
    signedIn: true,
    isAdmin: admin,
    isExpert: expert,
    isStaff: admin || expert,
    isRenterOnly: isRenterOnly(user),
  };
}

/* ------------------------------------------------------------------- label */

/**
 * The name shown under the avatar, in the backend's own order of precedence.
 *
 * `isAdminReal` rather than `isAdmin`, so the secretary is not introduced as
 * the head of the office.
 */
export function roleLabel(user: MaybeUser): string {
  if (!user) return "کاربر عادی";
  if (isAdminReal(user)) return "مدیر اصلی";
  if (hasAnyRole(user, ROLES.secretary)) return "منشی";
  if (hasAnyRole(user, ROLES.accountant) && !isExpert(user)) return "حسابدار";
  if (isExpert(user)) return "مشاور";
  if (isReferrer(user)) return "بازاریاب";
  if (isRenterOnly(user)) return "موجر";
  return "کاربر عادی";
}
