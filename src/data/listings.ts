import type { PropertyType } from "./home";
import {
  type Amenity,
  type Listing,
  type Orientation,
  formatToman,
} from "./search";

/*
 * Deterministic mock inventory. A seeded generator (rather than Math.random)
 * keeps the server and client renders identical — random data would hydrate
 * into a mismatch — and keeps the list stable between filter changes.
 */
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const titlesByType: Record<PropertyType, string[]> = {
  apartment: [
    "آپارتمان نوساز",
    "آپارتمان بازسازی‌شده",
    "آپارتمان دیدار به پارک",
    "آپارتمان تک‌واحدی",
  ],
  villa: ["خانه ویلایی حیاط‌دار", "ویلایی دوبلکس", "ویلایی نوساز"],
  land: ["زمین با کاربری مسکونی", "باغ ویلا", "زمین تجاری"],
  commercial: ["مغازه خیابان اصلی", "واحد تجاری پاساژ"],
  office: ["دفتر کار اداری", "واحد اداری نوساز"],
  industrial: ["سوله صنعتی", "کارگاه تولیدی"],
};

const districts = [
  "پردیسان",
  "سالاریه",
  "زنبیل‌آباد",
  "صفاشهر",
  "شهرک قدس",
  "جمهوری",
  "کریمی",
  "فردوسی",
];

const agents = [
  { name: "علی محمدی", gender: "male" as const },
  { name: "زهرا احمدی", gender: "female" as const },
  { name: "حسین رضایی", gender: "male" as const },
  { name: "مریم کریمی", gender: "female" as const },
  { name: "امیر حسینی", gender: "male" as const },
  { name: "سارا نوری", gender: "female" as const },
];

const propertyTypes: PropertyType[] = [
  "apartment",
  "apartment",
  "apartment",
  "villa",
  "villa",
  "land",
  "commercial",
  "office",
  "industrial",
];

const allAmenities: Amenity[] = [
  "elevator",
  "parking",
  "storage",
  "balcony",
  "titleDeed",
];

const orientations: Orientation[] = ["north", "south", "east", "west"];

function buildListing(index: number): Listing {
  const random = createRandom(index * 7919 + 13);
  const pick = <T,>(items: T[]): T =>
    items[Math.floor(random() * items.length)];
  const between = (min: number, max: number) =>
    min + Math.floor(random() * (max - min + 1));

  const propertyType = pick(propertyTypes);
  const dealType = random() > 0.42 ? "sale" : "rent";
  const isLand = propertyType === "land";
  const area = isLand ? between(120, 900) : between(45, 320);
  const rooms = isLand ? 0 : between(1, 4);
  const agent = pick(agents);

  // Land is priced per square metre; everything else scales with area and type.
  const pricePerMeter = isLand
    ? between(18, 45) * 1_000_000
    : between(28, 90) * 1_000_000;
  const priceValue = Math.round((area * pricePerMeter) / 100_000_000) * 100_000_000;
  const depositValue = Math.round(priceValue * 0.08);
  const rentValue = Math.round(priceValue * 0.0025);

  const amenities = isLand
    ? (["titleDeed"] as Amenity[])
    : allAmenities.filter(() => random() > 0.4);

  const totalFloors = isLand ? 0 : between(1, 12);
  const floor = isLand ? 0 : between(0, totalFloors);

  return {
    id: `l${index + 1}`,
    code: `${100_000 + index * 137}`,
    title: `${pick(titlesByType[propertyType])} ${area} متری`,
    city: "قم",
    district: pick(districts),
    dealType,
    propertyType,
    price:
      dealType === "sale"
        ? `${formatToman(priceValue)} تومان`
        : `ودیعه ${formatToman(depositValue)}`,
    deposit: dealType === "rent" ? formatToman(depositValue) : undefined,
    monthlyRent: dealType === "rent" ? formatToman(rentValue) : undefined,
    priceValue: dealType === "sale" ? priceValue : depositValue,
    depositValue: dealType === "rent" ? depositValue : undefined,
    rentValue: dealType === "rent" ? rentValue : undefined,
    area,
    rooms,
    baths: isLand ? 0 : between(1, 3),
    agentName: agent.name,
    agentGender: agent.gender,
    isNew: random() > 0.75,
    hasTour: random() > 0.78,
    buildingAge: isLand ? 0 : between(0, 25),
    floor,
    totalFloors,
    unitsPerFloor: isLand ? 0 : between(1, 6),
    orientation: pick(orientations),
    amenities,
    hasPhotos: random() > 0.15,
    isUrgent: random() > 0.85,
    publishedDaysAgo: between(0, 60),
    // Scattered around the centre of Qom so the map has believable spread.
    lat: 34.6416 + (random() - 0.5) * 0.09,
    lng: 50.8746 + (random() - 0.5) * 0.12,
  };
}

export const allListings: Listing[] = Array.from({ length: 48 }, (_, index) =>
  buildListing(index)
);

export class SearchRequestError extends Error {
  constructor() {
    super("دریافت آگهی‌ها با خطا مواجه شد");
    this.name = "SearchRequestError";
  }
}

/**
 * Stands in for the real endpoint: adds a short delay so the loading state is
 * exercised, and fails on demand (`?debug=error`) so the error state stays
 * reachable while the backend is still being built.
 */
export function fetchListings(options?: {
  shouldFail?: boolean;
}): Promise<Listing[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (options?.shouldFail) {
        reject(new SearchRequestError());
        return;
      }
      resolve(allListings);
    }, 450);
  });
}
