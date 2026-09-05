import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EditPropertyView } from "./_components/edit-property-view";

export const metadata: Metadata = { title: "ویرایش ملک | پنل کومه" };

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const estateId = Number(id);
  // The route accepts anything; the API would answer 404 for a non-number, and
  // a 404 page is the better answer than a form that cannot load.
  if (!Number.isInteger(estateId) || estateId <= 0) notFound();

  return <EditPropertyView id={String(estateId)} />;
}
