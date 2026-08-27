import type { Metadata } from "next";

import { PanelPageHeader } from "@/components/layout/panel-page-header";

import { CompareView } from "./_components/compare-view";

export const metadata: Metadata = { title: "مقایسه املاک | پنل کومه" };

export default function ComparePage() {
  return (
    <div>
      <PanelPageHeader
        title="مقایسه املاک"
        description="ملک‌های انتخاب‌شده را کنار هم و ردیف‌به‌ردیف بسنجید."
      />
      <CompareView />
    </div>
  );
}
