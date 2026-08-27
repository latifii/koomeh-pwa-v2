import type { Metadata } from "next";
import { Clock3 } from "lucide-react";

import { FeaturePending } from "@/app/panel/_components/feature-pending";
import { PanelPageHeader } from "@/components/layout/panel-page-header";

export const metadata: Metadata = { title: "تاریخچه بازدید | پنل کومه" };

export default function HistoryPage() {
  return (
    <div>
      <PanelPageHeader
        title="تاریخچه بازدید"
        description="ملک‌هایی که اخیراً مشاهده کرده‌اید."
      />
      <FeaturePending
        icon={Clock3}
        title="تاریخچه بازدید هنوز آماده نیست"
        description="بازدیدهای شما روی سرور ثبت می‌شوند، ولی سرویسی برای خواندن آن‌ها وجود ندارد. تا آن زمان می‌توانید فایل‌های موردنظرتان را نشان کنید تا در «نشان‌شده‌ها» بمانند."
      />
    </div>
  );
}
