import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EditContractView } from "./_components/edit-contract-view";

export const metadata: Metadata = { title: "ویرایش قولنامه | پنل کومه" };

export default async function EditContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const contractId = Number((await params).id);
  if (!Number.isInteger(contractId) || contractId <= 0) notFound();

  return <EditContractView id={contractId} />;
}
