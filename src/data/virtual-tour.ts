import { allListings } from "./listings";

/** The kind of room a scene depicts — drives its generated look. */
export type SceneTone =
  | "entrance"
  | "living"
  | "kitchen"
  | "bedroom"
  | "bath"
  | "balcony"
  | "plot";

export interface TourScene {
  id: string;
  name: string;
  tone: SceneTone;
}

export interface EstateTour {
  estateId: string;
  title: string;
  scenes: TourScene[];
}

const toneNames: Record<SceneTone, string> = {
  entrance: "ورودی",
  living: "پذیرایی",
  kitchen: "آشپزخانه",
  bedroom: "اتاق خواب",
  bath: "سرویس بهداشتی",
  balcony: "بالکن",
  plot: "نمای زمین",
};

/**
 * Builds a believable multi-scene tour from a listing's own features. Real
 * projects will replace these generated scenes with `is_360` panorama images
 * from the API — the viewer already consumes an image per scene, so only the
 * source changes.
 */
export function getEstateTour(id: string): EstateTour | null {
  const listing = allListings.find((item) => item.id === id);
  if (!listing || !listing.hasTour) return null;

  const scenes: TourScene[] = [];
  const add = (tone: SceneTone, label?: string) =>
    scenes.push({
      id: `${tone}-${scenes.length + 1}`,
      name: label ?? toneNames[tone],
      tone,
    });

  if (listing.propertyType === "land") {
    add("plot", "نمای کلی زمین");
    add("plot", "ضلع شمالی");
    add("plot", "ضلع جنوبی");
    return { estateId: id, title: listing.title, scenes };
  }

  add("entrance");
  add("living");
  add("kitchen");

  const bedrooms = Math.min(Math.max(listing.rooms, 1), 3);
  for (let i = 0; i < bedrooms; i += 1) {
    add("bedroom", bedrooms > 1 ? `اتاق خواب ${(i + 1).toLocaleString("fa-IR")}` : "اتاق خواب");
  }

  if (listing.baths > 0) add("bath");
  if (listing.amenities.includes("balcony")) add("balcony");

  return { estateId: id, title: listing.title, scenes };
}

/** Whether a property has a tour, without materialising it. */
export function hasVirtualTour(id: string): boolean {
  const listing = allListings.find((item) => item.id === id);
  return Boolean(listing?.hasTour);
}

export { toneNames };
