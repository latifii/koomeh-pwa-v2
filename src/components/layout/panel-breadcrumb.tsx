"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Home } from "lucide-react";

import { Typography } from "@/components/ui/typography";

const routeLabels: Record<string, string> = {
  "/panel/dashboard": "داشبورد",
  "/panel/properties": "ملک‌های من",
  "/panel/favorites": "علاقه‌مندی‌ها",
  "/panel/notifications": "اعلان‌ها",
  "/panel/settings": "تنظیمات حساب",
};

export function PanelBreadcrumb() {
  const pathname = usePathname();
  const currentLabel = routeLabels[pathname] ?? "داشبورد";

  return (
    <nav aria-label="مسیر صفحه" className="mb-4 flex items-center gap-1.5">
      <Link
        href="/"
        className="inline-flex items-center gap-1 rounded-md px-1 py-1 text-muted-foreground transition-colors hover:text-brand"
      >
        <Home className="size-3.5" />
        <Typography as="span" variant="small">
          خانه
        </Typography>
      </Link>
      <ChevronLeft className="size-3.5 text-muted-foreground/60" />
      <Link
        href="/panel/dashboard"
        className="rounded-md px-1 py-1 text-muted-foreground transition-colors hover:text-brand"
      >
        <Typography as="span" variant="small">
          پنل کاربری
        </Typography>
      </Link>
      <ChevronLeft className="size-3.5 text-muted-foreground/60" />
      <Typography as="span" variant="small" className="font-medium text-foreground">
        {currentLabel}
      </Typography>
    </nav>
  );
}
