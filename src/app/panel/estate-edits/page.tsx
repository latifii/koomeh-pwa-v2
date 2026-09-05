import type { Metadata } from "next";

import { EstateEditsView } from "@/app/panel/_admin/_components/estate-edits-view";
import { PanelPageHeader } from "@/components/layout/panel-page-header";

export const metadata: Metadata = { title: "ویرایش‌های املاک | پنل کومه" };

export default function EstateEditsPage() {
  return (
    <div>
      <PanelPageHeader
        title="ویرایش‌های املاک"
        description="هر ستونی که روی یک فایل عوض شده، با مقدار پیش و پس از آن."
      />
      <EstateEditsView />
    </div>
  );
}
