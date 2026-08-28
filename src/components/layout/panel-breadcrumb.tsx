"use client";

import { usePathname } from "next/navigation";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { routes } from "@/lib/routes";

const routeLabels: Record<string, string> = {
  [routes.panel.dashboard]: "داشبورد",
  [routes.panel.newProperty]: "ثبت ملک",
  [routes.panel.newRequest]: "ثبت تقاضا",
  [routes.panel.requests]: "تقاضاهای ملکی",
  [routes.panel.properties]: "ملک‌های من",
  [routes.panel.favorites]: "علاقه‌مندی‌ها",
  [routes.panel.compare]: "مقایسه املاک",
  [routes.panel.savedSearches]: "جست‌وجوهای ذخیره‌شده",
  [routes.panel.history]: "تاریخچه بازدید",
  [routes.panel.notes]: "یادداشت‌ها",
  [routes.panel.matches]: "تطبیق هوشمند",
  [routes.panel.activities]: "فعالیت‌ها",
  [routes.panel.tasks]: "وظایف",
  [routes.panel.conversations]: "گفت‌وگوها",
  [routes.panel.contacts]: "مخاطبان",
  [routes.panel.appointments]: "تقویم قرارها",
  [routes.panel.agentStats]: "لیگ ستارگان",
  [routes.panel.notifications]: "اعلان‌ها",
  [routes.panel.profile]: "تنظیمات حساب",
  [routes.panel.security]: "امنیت حساب",
};

export function PanelBreadcrumb() {
  const pathname = usePathname();
  const currentLabel = getCurrentLabel(pathname);

  return (
    <Breadcrumb
      inContainer={false}
      className="mb-4"
      items={[
        { label: "خانه", href: routes.home },
        { label: "پنل کاربری", href: routes.panel.dashboard },
        { label: currentLabel },
      ]}
    />
  );
}

function getCurrentLabel(pathname: string): string {
  if (routeLabels[pathname]) return routeLabels[pathname];
  if (pathname.startsWith(`${routes.panel.requests}/`) && pathname.endsWith("/edit")) {
    return "ویرایش تقاضا";
  }
  if (pathname.startsWith(`${routes.panel.requests}/`)) return "جزئیات تقاضا";
  if (pathname.startsWith(`${routes.panel.conversations}/`)) return "گفت‌وگو";
  if (pathname.startsWith(`${routes.panel.properties}/`)) return "مدیریت ملک";
  return "داشبورد";
}
