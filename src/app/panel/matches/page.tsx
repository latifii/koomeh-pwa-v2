import type { Metadata } from "next";
import { Network } from "lucide-react";

import { FeaturePending } from "@/app/panel/_components/feature-pending";
import { PanelPageHeader } from "@/components/layout/panel-page-header";

export const metadata: Metadata = { title: "تطبیق ملک و تقاضا | پنل کومه" };

export default function MatchesPage() {
  return (
    <div>
      <PanelPageHeader
        title="تطبیق ملک و تقاضا"
        description="فایل‌های مناسب هر متقاضی را بر اساس محدوده، بودجه و مشخصات بررسی کنید."
      />
      <FeaturePending
        icon={Network}
        title="برد تطبیق هنوز آماده نیست"
        description="API تطبیق را فقط برای یک ملک مشخص می‌دهد، نه به‌صورت سراسری. «خریداران متناسب» هر فایل را در صفحه‌ی همان ملک ببینید."
      />
    </div>
  );
}
