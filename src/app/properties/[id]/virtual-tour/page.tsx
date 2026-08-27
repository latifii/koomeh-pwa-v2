import { cache } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getEstateVirtualTour } from "@/app/properties/_api/estate-detail.service";
import { mapEstateVirtualTour } from "@/app/properties/_mappers/estate-detail.mapper";

import { TourExperience } from "./_components/tour-experience";

export const revalidate = 300;

/** The service 404s for files without a tour, so failure means "no tour". */
const getTour = cache(async (id: string) => {
  if (!/^\d+$/.test(id)) notFound();

  try {
    return mapEstateVirtualTour(await getEstateVirtualTour(id));
  } catch {
    notFound();
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const tour = await getTour(id);
    return {
      title: `تور مجازی ۳۶۰ درجه ${tour.title} | کومه`,
      description: `بازدید آنلاین و ۳۶۰ درجه از ${tour.title}، پیش از بازدید حضوری.`,
    };
  } catch {
    return { title: "تور مجازی یافت نشد | کومه" };
  }
}

export default async function EstateTourPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tour = await getTour(id);

  // Some files are hosted on an external tour platform instead of our own
  // panoramas; those have nothing to render here.
  if (tour.images.length === 0) {
    if (tour.externalTourUrl) redirect(tour.externalTourUrl);
    notFound();
  }

  return <TourExperience tour={tour} />;
}
