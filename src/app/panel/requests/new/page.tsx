import type { Metadata } from "next";

import { PanelPageHeader } from "@/components/layout/panel-page-header";

import { CustomerForm } from "../_components/customer-form";

export const metadata: Metadata = { title: "ثبت تقاضا | پنل کومه" };

export default function NewRequestPage() {
  return (
    <div>
      <PanelPageHeader
        title="ثبت تقاضا"
        description="خواسته‌های متقاضی را ثبت کنید تا فایل‌های متناسب پیشنهاد شود."
      />
      <CustomerForm />
    </div>
  );
}
