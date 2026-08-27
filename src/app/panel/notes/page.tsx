import type { Metadata } from "next";
import { StickyNote } from "lucide-react";

import { FeaturePending } from "@/app/panel/_components/feature-pending";
import { PanelPageHeader } from "@/components/layout/panel-page-header";

export const metadata: Metadata = { title: "یادداشت‌ها | پنل کومه" };

export default function NotesPage() {
  return (
    <div>
      <PanelPageHeader
        title="یادداشت‌ها"
        description="نکات مهم مربوط به ملک‌ها، متقاضیان و پیگیری‌ها را ثبت کنید."
      />
      <FeaturePending
        icon={StickyNote}
        title="یادداشت شخصی هنوز آماده نیست"
        description="API فقط یادداشت روی پرونده‌ی یک مشتری را می‌پذیرد، نه یادداشت آزاد. آن مورد در صفحه‌ی هر مشتری فعال است."
      />
    </div>
  );
}
