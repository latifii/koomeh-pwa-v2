import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EditBranchView } from "./_components/edit-branch-view";

export const metadata: Metadata = { title: "ویرایش شعبه | پنل کومه" };

export default async function EditBranchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const branchId = Number((await params).id);
  if (!Number.isInteger(branchId) || branchId <= 0) notFound();

  return <EditBranchView id={branchId} />;
}
