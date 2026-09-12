import type { Metadata } from "next";

import { PhonebookView } from "@/app/panel/phonebook/_components/phonebook-view";
import { PanelPageHeader } from "@/components/layout/panel-page-header";

export const metadata: Metadata = { title: "دفترچه تلفن | پنل کومه" };

export default function PhonebookPage() {
  return (
    <div>
      <PanelPageHeader
        title="دفترچه تلفن"
        description="مخاطبان دفتر، مالکان فایل‌ها، مشتریان و همکاران — یک جست‌وجو روی همه."
      />
      <PhonebookView />
    </div>
  );
}
