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

/** Pages that are not menu entries of their own, keyed by the prefix under it. */
const DETAIL_LABELS: ReadonlyArray<readonly [string, string]> = [
  [`${routes.panel.requests}/`, "جزئیات تقاضا"],
  [`${routes.panel.conversations}/`, "گفت‌وگو"],
  [`${routes.panel.properties}/`, "مدیریت ملک"],
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

  const detail = DETAIL_LABELS.find(([prefix]) => pathname.startsWith(prefix));
  const isEditRequest =
    pathname.startsWith(`${routes.panel.requests}/`) &&
    pathname.endsWith("/edit");

  const currentLabel = item
    ? item.href === pathname
      ? item.label
      : isEditRequest
        ? "ویرایش تقاضا"
        : (detail?.[1] ?? item.label)
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
