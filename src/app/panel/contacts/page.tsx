import type { Metadata } from "next";

import { ContactBook } from "@/app/panel/contacts/_components/contact-book";
import { PanelPageHeader } from "@/components/layout/panel-page-header";

export const metadata: Metadata = { title: "دفترچه تلفن و پیامک | پنل کومه" };

export default function ContactsPage() {
  return (
    <div>
      <PanelPageHeader
        title="دفترچه تلفن و پیامک"
        description="مخاطبان را جست‌وجو کنید، پیامک بفرستید و سابقه‌ی ارسال‌ها را ببینید."
      />
      <ContactBook />
    </div>
  );
}
