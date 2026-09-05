import type { Metadata } from "next";

import { EstateReportsView } from "@/app/panel/_admin/_components/estate-reports-view";
import { PanelPageHeader } from "@/components/layout/panel-page-header";

export const metadata: Metadata = { title: "گزارش‌های مشکل | پنل کومه" };

export default function EstateReportsPage() {
  return (
    <div>
      <PanelPageHeader
        title="گزارش‌های مشکل در املاک"
        description="آنچه بازدیدکننده‌ها درباره‌ی فایل‌ها گزارش کرده‌اند."
      />
      <EstateReportsView />
    </div>
  );
}
