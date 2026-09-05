import {
  Bell,
  Building2,
  CalendarDays,
  ClipboardList,
  ContactRound,
  Heart,
  KeyRound,
  LayoutDashboard,
  ListTodo,
  MessageCircle,
  Plus,
  Scale,
  Trophy,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

import { canAccess, type PanelAudience } from "@/lib/auth/panel-access";
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
 * Every entry here goes somewhere that works. Pages whose service does not
 * exist yet are not listed — not greyed, not marked "soon", not listed. A menu
 * is a set of promises, and the ones it cannot keep belong in the roadmap
 * rather than in front of somebody trying to get work done.
 */

export type PanelNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  audience: PanelAudience;
  /**
   * The topic this page belongs to when it is not listed under one — the two
   * quick actions live above the menu but are still part of a section as far as
   * the breadcrumb is concerned.
   */
  groupId?: string;
};

export type PanelNavGroup = {
  id: string;
  label: string;
  items: PanelNavItem[];
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
      {
        href: routes.panel.members,
        label: "اعضای سیستم",
        icon: Users,
        audience: "admin",
      },
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

/** Every entry in one flat list — for label lookups such as the breadcrumb. */
export const PANEL_NAV_ITEMS: PanelNavItem[] = [
  ...PANEL_PRIMARY_LINKS,
  ...PANEL_QUICK_ACTIONS,
  ...PANEL_NAV_GROUPS.flatMap((group) => group.items),
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
