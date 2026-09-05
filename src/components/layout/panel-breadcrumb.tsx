"use client";

import { usePathname } from "next/navigation";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import {
  PANEL_NAV_GROUPS,
  PANEL_NAV_ITEMS,
  type PanelNavItem,
} from "@/components/layout/panel-nav.config";
import { routes } from "@/lib/routes";

/**
 * The trail names the topic as well as the page, so `/panel/tasks` reads
 * «پنل کاربری › عملکرد مشاور › وظایف» — the same shape as the sidebar it sits
 * beside. Labels come from the navigation config rather than a second table
 * that would drift from it.
 */

/**
 * Pages that are not menu entries of their own: a record below one of the
 * lists, or one of that record's own screens.
 *
 * Matched in order — the ones naming a suffix come first, because every one of
 * them also matches the bare prefix underneath it.
 */
const DETAIL_LABELS: ReadonlyArray<{
  prefix: string;
  suffix?: string;
  label: string;
}> = [
  { prefix: routes.panel.requests, suffix: "/edit", label: "ویرایش تقاضا" },
  { prefix: routes.panel.properties, suffix: "/edit", label: "ویرایش ملک" },
  { prefix: routes.panel.properties, suffix: "/preview", label: "پیش‌نمایش ملک" },
  { prefix: routes.panel.properties, suffix: "/manage", label: "مدیریت آگهی" },
  { prefix: routes.panel.requests, label: "جزئیات تقاضا" },
  { prefix: routes.panel.conversations, label: "گفت‌وگو" },
  { prefix: routes.panel.properties, label: "مدیریت ملک" },
];

function itemFor(pathname: string) {
  return (
    PANEL_NAV_ITEMS.find((item) => item.href === pathname) ??
    // Longest prefix wins, so a detail page is attributed to its list.
    PANEL_NAV_ITEMS.filter((item) => pathname.startsWith(`${item.href}/`)).sort(
      (a, b) => b.href.length - a.href.length,
    )[0]
  );
}

function groupLabelFor(item: PanelNavItem): string | null {
  const group = PANEL_NAV_GROUPS.find((candidate) =>
    // The quick actions sit above the menu rather than inside a section, but
    // they still belong to one as far as the trail is concerned.
    item.groupId
      ? candidate.id === item.groupId
      : candidate.items.some((entry) => entry.href === item.href),
  );

  return group?.label ?? null;
}

export function PanelBreadcrumb() {
  const pathname = usePathname();
  const item = itemFor(pathname);

  const detail = DETAIL_LABELS.find(
    (entry) =>
      pathname.startsWith(`${entry.prefix}/`) &&
      (entry.suffix ? pathname.endsWith(entry.suffix) : true),
  );

  const currentLabel = item
    ? item.href === pathname
      ? item.label
      : (detail?.label ?? item.label)
    : "داشبورد";

  const groupLabel = item ? groupLabelFor(item) : null;

  return (
    <Breadcrumb
      inContainer={false}
      className="mb-4"
      items={[
        { label: "خانه", href: routes.home },
        { label: "پنل کاربری", href: routes.panel.dashboard },
        ...(groupLabel ? [{ label: groupLabel }] : []),
        { label: currentLabel },
      ]}
    />
  );
}
