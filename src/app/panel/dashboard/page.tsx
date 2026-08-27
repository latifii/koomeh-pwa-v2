import type { Metadata } from "next";

import { PanelPageHeader } from "@/components/layout/panel-page-header";

import { DashboardView } from "./_components/dashboard-view";

export const metadata: Metadata = { title: "داشبورد | پنل کومه" };

export default function DashboardPage() {
  return (
    <div>
      <PanelPageHeader
        title="داشبورد"
        description="خلاصه‌ی فایل‌ها، مشتریان و کارهای پیش رو."
      />
      <DashboardView />
    </div>
  );
}
