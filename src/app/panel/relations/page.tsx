import type { Metadata } from "next";

import { RelationsView } from "@/app/panel/_admin/_components/relations-view";
import { PanelPageHeader } from "@/components/layout/panel-page-header";

export const metadata: Metadata = { title: "مشتریان و املاک متناسب | پنل کومه" };

export default function RelationsPage() {
  return (
    <div>
      <PanelPageHeader
        title="مشتریان و املاک متناسب"
        description="فایل‌های پیشنهادی هر تقاضا و وضعیت تایید هرکدام."
      />
      <RelationsView />
    </div>
  );
}
