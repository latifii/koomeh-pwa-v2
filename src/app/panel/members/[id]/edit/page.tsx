import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EditMemberView } from "./_components/edit-member-view";

export const metadata: Metadata = { title: "ویرایش عضو | پنل کومه" };

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const memberId = Number((await params).id);
  if (!Number.isInteger(memberId) || memberId <= 0) notFound();

  return <EditMemberView id={String(memberId)} />;
}
