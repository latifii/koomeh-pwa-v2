"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Home } from "lucide-react";

import { Typography } from "@/components/ui/typography";
import { routes } from "@/lib/routes";

const routeLabels: Record<string, string> = {
  [routes.panel.dashboard]: "داشبورد",
  [routes.panel.newProperty]: "ثبت ملک",
  [routes.panel.newRequest]: "ثبت تقاضا",
  [routes.panel.properties]: "ملک‌های من",
  [routes.panel.favorites]: "علاقه‌مندی‌ها",
  [routes.panel.notifications]: "اعلان‌ها",
  [routes.panel.profile]: "تنظیمات حساب",
};

export function PanelBreadcrumb() {
  const pathname = usePathname();
  const currentLabel = routeLabels[pathname] ?? "داشبورد";

  return (
    <nav aria-label="مسیر صفحه" className="mb-4 flex items-center gap-1.5">
      <Link
        href={routes.home}
        className="inline-flex items-center gap-1 rounded-md px-1 py-1 text-muted-foreground transition-colors hover:text-brand"
      >
        <Home className="size-3.5" />
        <Typography as="span" variant="small">
          خانه
        </Typography>
      </Link>
      <ChevronLeft className="size-3.5 text-muted-foreground/60" />
      <Link
        href={routes.panel.dashboard}
        className="rounded-md px-1 py-1 text-muted-foreground transition-colors hover:text-brand"
      >
        <Typography as="span" variant="small">
          پنل کاربری
        </Typography>
      </Link>
      <ChevronLeft className="size-3.5 text-muted-foreground/60" />
      <Typography
        as="span"
        variant="small"
        className="font-medium text-foreground"
      >
        {currentLabel}
      </Typography>
    </nav>
  );
}
