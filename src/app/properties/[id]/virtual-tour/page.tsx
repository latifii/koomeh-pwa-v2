import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAllEstateIds, getEstateDetail } from "@/data/estate-detail";
import { getEstateTour } from "@/data/virtual-tour";

import { TourExperience } from "./_components/tour-experience";

export function generateStaticParams() {
  return getAllEstateIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const detail = getEstateDetail(id);
  const title = detail ? detail.title : "ملک";

  return {
    title: `تور مجازی ۳۶۰ درجه ${title} | کومه`,
    description: `بازدید آنلاین و ۳۶۰ درجه از ${title} در قم، پیش از بازدید حضوری.`,
  };
}

export default async function EstateTourPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tour = getEstateTour(id);

  if (!tour) notFound();

  return <TourExperience tour={tour} />;
}
