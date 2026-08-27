import type { Metadata } from "next";
import { SearchCheck } from "lucide-react";

import { FeaturePending } from "@/app/panel/_components/feature-pending";
import { PanelPageHeader } from "@/components/layout/panel-page-header";

export const metadata: Metadata = { title: "جست‌وجوهای ذخیره‌شده | پنل کومه" };

export default function SavedSearchesPage() {
  return (
    <div>
      <PanelPageHeader
        title="جست‌وجوهای ذخیره‌شده"
        description="فیلترهای پرکاربرد را نگه دارید و برای فایل‌های جدید اعلان دریافت کنید."
      />
      <FeaturePending
        icon={SearchCheck}
        title="ذخیره‌ی جست‌وجو هنوز آماده نیست"
        description="سرویسی برای نگه‌داشتن فیلترها روی حساب کاربری وجود ندارد. تا آن زمان نشانی صفحه‌ی جست‌وجو خودش همه‌ی فیلترها را نگه می‌دارد و قابل ذخیره در مرورگر است."
      />
    </div>
  );
}
