import { cache } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getCachedEstateVirtualTour } from "@/app/properties/_cache/estate-detail.cache";
import { mapEstateVirtualTour } from "@/app/properties/_mappers/estate-detail.mapper";

import { TourExperience } from "./_components/tour-experience";

export const revalidate = 300;

// Signals that this route can be statically generated; without it Next treats
// every dynamic segment as fully dynamic and never caches the result.
export function generateStaticParams() {
  return [];
}

/** The service 404s for files without a tour, so failure means "no tour". */
const getTour = cache(async (id: string) => {
  if (!/^\d+$/.test(id)) notFound();

  try {
    return mapEstateVirtualTour(await getCachedEstateVirtualTour(id));
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
