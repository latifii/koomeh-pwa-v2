import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PanelPageHeader } from "@/components/layout/panel-page-header";

import { CustomerForm } from "../../_components/customer-form";

export const metadata: Metadata = { title: "ویرایش تقاضا | پنل کومه" };

export default async function EditRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  return (
    <div>
      <PanelPageHeader
        title="ویرایش تقاضا"
        description="خواسته‌ها و اطلاعات متقاضی را به‌روز کنید."
      />
      <CustomerForm customerId={id} />
    </div>
  );
}
