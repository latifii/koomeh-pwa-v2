import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PanelPageHeader } from "@/components/layout/panel-page-header";

import { AdManagement } from "./_components/ad-management";

export const metadata: Metadata = { title: "مدیریت آگهی | پنل کومه" };

export default async function ManageAdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const estateId = Number((await params).id);
  if (!Number.isInteger(estateId) || estateId <= 0) notFound();

  return (
    <div>
      <PanelPageHeader
        title="مدیریت آگهی"
        description="وضعیت پرونده، آمار بازدید و اطلاعات مالک این فایل."
      />
      <AdManagement estateId={estateId} />
    </div>
  );
}
