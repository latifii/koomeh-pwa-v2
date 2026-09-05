import type { Metadata } from "next";

import { SettingsView } from "@/app/panel/settings/_components/settings-view";
import { PanelPageHeader } from "@/components/layout/panel-page-header";

export const metadata: Metadata = { title: "تنظیمات | پنل کومه" };

export default function SettingsPage() {
  return (
    <div>
      <PanelPageHeader
        title="تنظیمات"
        description="مقدارهایی که سرویس‌های سایت از آن‌ها می‌خوانند — دیوار، پیامک و آمار."
      />
      <SettingsView />
    </div>
  );
}
