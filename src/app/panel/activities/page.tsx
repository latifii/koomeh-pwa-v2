import type { Metadata } from "next";
import { Activity } from "lucide-react";

import { FeaturePending } from "@/app/panel/_components/feature-pending";
import { PanelPageHeader } from "@/components/layout/panel-page-header";

export const metadata: Metadata = { title: "فعالیت‌ها و پیگیری‌ها | پنل کومه" };

export default function ActivitiesPage() {
  return (
    <div>
      <PanelPageHeader
        title="فعالیت‌ها و پیگیری‌ها"
        description="تماس‌ها، بازدیدها، پیام‌ها و تغییرات پرونده‌های ملک و متقاضی را یکجا ببینید."
      />
      <FeaturePending
        icon={Activity}
        title="فید فعالیت‌ها هنوز آماده نیست"
        description="سرویس این بخش روی API موجود نیست. عملکردهای ثبت‌شده روی هر ملک را فعلاً در صفحه‌ی همان ملک، بخش «پنل مدیریت آگهی» می‌بینید."
      />
    </div>
  );
}
