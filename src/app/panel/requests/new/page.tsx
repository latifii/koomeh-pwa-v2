import type { Metadata } from "next";

import { PanelPageHeader } from "@/components/layout/panel-page-header";

import { CustomerForm } from "../_components/customer-form";

export const metadata: Metadata = { title: "ثبت مشتری | پنل کومه" };

export default async function NewRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ estate_id?: string }>;
}) {
  // «درخواست بازدید» on a listing lands here with the file's id — the old
  // site's `/customers/create?estate_id=…` — and the form starts from it.
  const { estate_id } = await searchParams;
  const estateId = /^\d+$/.test(estate_id ?? "") ? estate_id : undefined;

  return (
    <div>
      <PanelPageHeader
        title="ثبت مشتری"
        description="خواسته‌های مشتری را ثبت کنید تا فایل‌های متناسب پیشنهاد شود."
      />
      <CustomerForm estateId={estateId} />
    </div>
  );
}
