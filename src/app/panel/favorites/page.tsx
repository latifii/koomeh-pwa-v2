import type { Metadata } from "next";

import { PanelPageHeader } from "@/components/layout/panel-page-header";

import { FavoritesView } from "./_components/favorites-view";

export const metadata: Metadata = { title: "علاقه‌مندی‌ها | پنل کومه" };

export default function FavoritesPage() {
  return (
    <div>
      <PanelPageHeader
        title="علاقه‌مندی‌ها"
        description="ملک‌ها و کارشناسانی که برای مراجعه بعدی ذخیره کرده‌اید."
      />
      <FavoritesView />
    </div>
  );
}
