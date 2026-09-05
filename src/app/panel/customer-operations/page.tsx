import type { Metadata } from "next";

import { OperationsView } from "@/app/panel/_operations/_components/operations-view";
import { PanelPageHeader } from "@/components/layout/panel-page-header";

export const metadata: Metadata = { title: "عملکرد مشتریان | پنل کومه" };

export default function CustomerOperationsPage() {
  return (
    <div>
      <PanelPageHeader
        title="عملکرد مشتریان"
        description="تماس‌ها، نظر مشاوران و جابه‌جایی کارشناس روی هر تقاضا."
      />
      <OperationsView kind="customer" />
    </div>
  );
}
