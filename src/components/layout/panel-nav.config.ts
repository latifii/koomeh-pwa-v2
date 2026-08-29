import {
  Activity,
  Bell,
  Building,
  Building2,
  Calculator,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  ContactRound,
  FileClock,
  FileSignature,
  Flag,
  Gauge,
  Heart,
  History,
  KeyRound,
  LayoutDashboard,
  ListTodo,
  Map,
  MapPin,
  MessageCircle,
  Network,
  Newspaper,
  Plus,
  Scale,
  SearchCheck,
  Settings,
  Signpost,
  StickyNote,
  Store,
  Trophy,
  UserCheck,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

import {
  canAccess,
  type PanelAudience,
} from "@/lib/auth/panel-access";
import type { PanelViewer } from "@/lib/auth/permissions";
import { routes } from "@/lib/routes";

/**
 * The panel menu, by topic.
 *
 * The old monolith's sidebar was five collapsible topics with two standalone
 * links above them, and the rewrite had flattened all of it into seventeen
 * links in no particular order — which is fine at seven items and unreadable
 * at seventeen. The topics here are the old ones (`layouts/menu.blade.php`),
 * with only the pages this front end actually has under each; the two
 * standalone links stay standalone for the same reason they were: a plain
 * visitor's inbox does not belong under a heading about agent performance.
 *
 * Sections carry no icon of their own — one beside the heading only competed
 * with the icons on the rows underneath it, which are the ones doing the work.
 *
 * `audience` is what the old blade wrote as `@if($currentUser->isExpert())`
 * around a block. A group with nothing visible in it is not rendered at all,
 * so nobody is shown an empty "office administration" heading.
 *
 * Some entries have no `href`. Those are the parts of the old admin menu that
 * this API has not been given yet — searching the spec for `admin`, `users`,
 * `setting`, `contract`, `province`, `edits` or `appraisal` returns nothing, and
 * "performance" exists only per record (`/estates/{id}/operations`), never as
 * the office-wide list the old panel had. They are listed anyway, greyed and
 * inert, because an administrator who used the old panel counts what is missing
 * and a shorter menu reads as features taken away rather than services not yet
 * moved across. Each becomes a real entry the day its endpoint exists.
 */

/** A row in the menu. */
export type PanelNavEntry = {
  /** Absent while the service behind the page does not exist yet. */
  href?: string;
  label: string;
  icon: LucideIcon;
  audience: PanelAudience;
  /** The page (or the service behind it) is not finished. */
  soon?: boolean;
  /**
   * The topic this page belongs to when it is not listed under one — the two
   * quick actions live above the menu but are still part of a section as far as
   * the breadcrumb is concerned.
   */
  groupId?: string;
};

/** A row you can actually open. */
export type PanelNavItem = PanelNavEntry & { href: string };

export function isNavigable(entry: PanelNavEntry): entry is PanelNavItem {
  return typeof entry.href === "string";
}

/**
 * A page the old panel had and this one cannot have yet, for want of an
 * endpoint. No route, so nothing can link to it by accident.
 */
function planned(
  label: string,
  icon: LucideIcon,
  audience: PanelAudience,
): PanelNavEntry {
  return { label, icon, audience, soon: true };
}

export type PanelNavGroup = {
  id: string;
  label: string;
  items: PanelNavEntry[];
};

/**
 * The two things people come here to do.
 *
 * They were rows fourteen and eighteen of a list, which is the wrong shape for
 * an action taken several times a day — the old sidebar had «ثبت ملک» as a
 * full-width button above the menu for the same reason. They keep their entries
 * in `PANEL_NAV_ITEMS` below so the breadcrumb and the active-row highlight
 * still know them; they are simply not listed twice.
 */
export const PANEL_QUICK_ACTIONS: PanelNavItem[] = [
  {
    href: routes.panel.newProperty,
    label: "ثبت ملک",
    icon: Plus,
    audience: "member",
    groupId: "estates",
  },
  {
    href: routes.panel.newRequest,
    label: "ثبت تقاضا",
    icon: Plus,
    audience: "member",
    groupId: "customers",
  },
];

/** Above the topics, as in the old menu. */
export const PANEL_PRIMARY_LINKS: PanelNavItem[] = [
  {
    href: routes.panel.dashboard,
    label: "داشبورد",
    icon: LayoutDashboard,
    audience: "member",
  },
  {
    href: routes.panel.conversations,
    label: "گفت‌وگوها",
    icon: MessageCircle,
    // Not staff-only here, unlike the old site: a visitor can open a thread
    // from a listing page, and the API tells them whether they may.
    audience: "everyone",
  },
];

export const PANEL_NAV_GROUPS: PanelNavGroup[] = [
  {
    id: "estates",
    label: "مدیریت املاک",
    items: [
      {
        href: routes.panel.properties,
        label: "ملک‌های من",
        icon: Building2,
        audience: "member",
      },
      planned("عملکرد املاک", Gauge, "admin"),
      planned("گزارش‌های مشکل در املاک", Flag, "admin"),
      planned("ویرایش‌های املاک", FileClock, "admin"),
      {
        href: routes.panel.favorites,
        label: "علاقه‌مندی‌ها",
        icon: Heart,
        audience: "everyone",
      },
      {
        href: routes.panel.compare,
        label: "مقایسه املاک",
        icon: Scale,
        audience: "everyone",
      },
      {
        href: routes.panel.savedSearches,
        label: "جست‌وجوهای ذخیره‌شده",
        icon: SearchCheck,
        audience: "everyone",
        soon: true,
      },
      {
        href: routes.panel.history,
        label: "بازدیدهای اخیر",
        icon: History,
        audience: "everyone",
        soon: true,
      },
    ],
  },
  {
    id: "customers",
    label: "مدیریت مشتریان",
    items: [
      {
        href: routes.panel.requests,
        label: "تقاضاهای ملکی",
        icon: ClipboardList,
        audience: "member",
      },
      {
        href: routes.panel.matches,
        label: "مشتریان و املاک متناسب",
        icon: Network,
        audience: "staff",
        soon: true,
      },
      planned("عملکرد مشتریان", ClipboardCheck, "staff"),
      {
        href: routes.panel.notes,
        label: "یادداشت‌های من",
        icon: StickyNote,
        audience: "everyone",
        soon: true,
      },
    ],
  },
  {
    id: "performance",
    label: "عملکرد مشاور",
    items: [
      {
        href: routes.panel.appointments,
        label: "تقویم کاری",
        icon: CalendarDays,
        audience: "staff",
      },
      {
        href: routes.panel.tasks,
        label: "وظایف",
        icon: ListTodo,
        audience: "staff",
      },
      {
        href: routes.panel.agentStats,
        label: "آمار مشاوران",
        icon: Trophy,
        audience: "staff",
      },
      {
        href: routes.panel.activities,
        label: "فعالیت‌ها",
        icon: Activity,
        audience: "staff",
        soon: true,
      },
    ],
  },
  {
    id: "system",
    label: "مدیریت سیستم",
    items: [
      {
        href: routes.panel.contacts,
        label: "دفترچه تلفن و پیامک",
        icon: ContactRound,
        audience: "admin",
      },
      // The old menu's order, kept, so an administrator finds things where
      // they left them.
      planned("شعبه‌ها", Store, "admin"),
      planned("تنظیمات", Settings, "admin"),
      planned("لیست استان‌ها", Map, "admin"),
      planned("لیست شهرها", Building, "admin"),
      planned("لیست محله‌ها", MapPin, "admin"),
      planned("لیست خیابان‌ها", Signpost, "admin"),
      planned("اعضای سیستم", Users, "admin"),
      planned("عملکرد کارشناسان", UserCheck, "admin"),
      planned("مدیریت قرارداد", FileSignature, "admin"),
      planned("مدیریت مطالب", Newspaper, "admin"),
      planned("کارشناسی قیمت", Calculator, "admin"),
    ],
  },
  {
    id: "account",
    label: "حساب کاربری",
    items: [
      {
        href: routes.panel.notifications,
        label: "اعلان‌ها",
        icon: Bell,
        audience: "everyone",
      },
      {
        href: routes.panel.profile,
        label: "ویرایش مشخصات",
        icon: UserRound,
        audience: "everyone",
      },
      {
        href: routes.panel.security,
        label: "امنیت حساب",
        icon: KeyRound,
        audience: "everyone",
      },
    ],
  },
];

/**
 * Every entry that has somewhere to go, in one flat list — for label lookups
 * such as the breadcrumb, and for deciding which row is the current one. The
 * planned entries are left out: nothing can navigate to them, so nothing should
 * try to name them either.
 */
export const PANEL_NAV_ITEMS: PanelNavItem[] = [
  ...PANEL_PRIMARY_LINKS,
  ...PANEL_QUICK_ACTIONS,
  ...PANEL_NAV_GROUPS.flatMap((group) => group.items.filter(isNavigable)),
];

export function visibleQuickActions(viewer: PanelViewer): PanelNavItem[] {
  return PANEL_QUICK_ACTIONS.filter((item) => canAccess(item.audience, viewer));
}

export function visibleGroups(viewer: PanelViewer): PanelNavGroup[] {
  return PANEL_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => canAccess(item.audience, viewer)),
  })).filter((group) => group.items.length > 0);
}

export function visiblePrimaryLinks(viewer: PanelViewer): PanelNavItem[] {
  return PANEL_PRIMARY_LINKS.filter((item) => canAccess(item.audience, viewer));
}
