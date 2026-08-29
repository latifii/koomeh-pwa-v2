import {
  Activity,
  Bell,
  Building2,
  CalendarDays,
  ClipboardList,
  ContactRound,
  Heart,
  History,
  KeyRound,
  LayoutDashboard,
  ListTodo,
  MessageCircle,
  Network,
  Plus,
  Scale,
  SearchCheck,
  ShieldCheck,
  StickyNote,
  TrendingUp,
  Trophy,
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
 * `audience` is what the old blade wrote as `@if($currentUser->isExpert())`
 * around a block. A group with nothing visible in it is not rendered at all,
 * so nobody is shown an empty "office administration" heading.
 */

export type PanelNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  audience: PanelAudience;
  /** Page exists and explains itself, but the API behind it does not yet. */
  soon?: boolean;
};

export type PanelNavGroup = {
  id: string;
  label: string;
  icon: LucideIcon;
  items: PanelNavItem[];
};

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
    icon: Building2,
    items: [
      {
        href: routes.panel.properties,
        label: "ملک‌های من",
        icon: Building2,
        audience: "member",
      },
      {
        href: routes.panel.newProperty,
        label: "ثبت ملک",
        icon: Plus,
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
    icon: Users,
    items: [
      {
        href: routes.panel.requests,
        label: "تقاضاهای ملکی",
        icon: ClipboardList,
        audience: "member",
      },
      {
        href: routes.panel.newRequest,
        label: "ثبت تقاضا",
        icon: Plus,
        audience: "member",
      },
      {
        href: routes.panel.matches,
        label: "مشتریان و املاک متناسب",
        icon: Network,
        audience: "staff",
        soon: true,
      },
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
    icon: TrendingUp,
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
    icon: ShieldCheck,
    items: [
      {
        href: routes.panel.contacts,
        label: "دفترچه تلفن و پیامک",
        icon: ContactRound,
        audience: "admin",
      },
    ],
  },
  {
    id: "account",
    label: "حساب کاربری",
    icon: UserRound,
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
  ...PANEL_NAV_GROUPS.flatMap((group) => group.items),
];

export function visibleGroups(viewer: PanelViewer): PanelNavGroup[] {
  return PANEL_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => canAccess(item.audience, viewer)),
  })).filter((group) => group.items.length > 0);
}

export function visiblePrimaryLinks(viewer: PanelViewer): PanelNavItem[] {
  return PANEL_PRIMARY_LINKS.filter((item) => canAccess(item.audience, viewer));
}
