import type { Metadata } from "next";

import { OperationsView } from "@/app/panel/_operations/_components/operations-view";
import { PanelPageHeader } from "@/components/layout/panel-page-header";

export const metadata: Metadata = { title: "عملکرد املاک | پنل کومه" };

export default function EstateOperationsPage() {
  return (
    <div>
      <PanelPageHeader
        title="عملکرد املاک"
        description="هر کارشناسی روی هر فایل چه کرده — کارشناسی، سرویس، آگهی و نردبان."
      />
      <OperationsView kind="estate" />
    </div>
  );
}
