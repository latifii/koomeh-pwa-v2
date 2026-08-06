import { allListings } from "./listings";
import { type Listing, amenityLabels, formatToman } from "./search";

/**
 * Extras that only the detail page needs. The search list stays lean — these
 * fields are derived on demand from the listing's own id, so a file always
 * renders the same details no matter which route reached it.
 */
export interface EstateDetail extends Listing {
  description: string;
  /** Bullet list under "شرایط ملک" — commercial terms, not physical features. */
  conditions: string[];
  /** "کاربری" — what the file may legally be used for. */
  usage: string;
  /** "سند" — the deed type. */
  deed: string;
  buildYear: number;
  floorType: string;
  pricePerMeterValue: number;
  hasPlan: boolean;
  hasExchange: boolean;
  views: number;
  agent: {
    name: string;
    gender: "male" | "female";
    branch: string;
    phone: string;
    deals: number;
    yearsActive: number;
  };
}

const usages = ["مسکونی", "مسکونی و اداری", "تجاری", "اداری"];
const deeds = ["تک‌برگ", "شش‌دانگ منگوله‌دار", "قولنامه‌ای", "وکالتی"];
const floorTypes = ["سرامیک", "پارکت", "سنگ", "موکت"];
const branches = ["پردیسان", "جمهوری", "صدوقی", "زمرد"];

const conditionPool = [
  "قابل معاوضه با ملک کوچک‌تر",
  "وام بانکی قابل انتقال",
  "تخلیه و تحویل فوری",
  "پرداخت بخشی از مبلغ به صورت اقساط",
  "قیمت توافقی پس از بازدید",
  "بدون مستأجر",
  "هزینه شارژ ماهانه بر عهده خریدار",
];

/** Same LCG as `listings.ts`: deterministic, so server and client agree. */
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function buildDescription(listing: Listing): string {
  const lines: string[] = [];

  lines.push(
    `این فایل ${
      listing.dealType === "sale" ? "فروشی" : "اجاره‌ای"
    } با ${listing.area} متر زیربنا در محله ${listing.district} قم قرار دارد و توسط کارشناسان کومه بازدید و تأیید شده است.`
  );

  if (listing.rooms > 0) {
    lines.push(
      `واحد دارای ${listing.rooms} اتاق خواب و ${listing.baths} سرویس بهداشتی است؛ نورگیری ${
        listing.orientation === "north" ? "شمالی" : "مناسب"
      } و نقشه بدون پرت فضا طراحی شده و آشپزخانه به صورت اوپن اجرا شده است.`
    );
  } else {
    lines.push(
      "زمین دارای موقعیت هندسی منظم و دسترسی مستقیم به معبر اصلی است و برای ساخت یا سرمایه‌گذاری میان‌مدت گزینه مناسبی به شمار می‌رود."
    );
  }

  if (listing.amenities.length > 0) {
    lines.push(
      `از امکانات این ملک می‌توان به ${listing.amenities
        .map((amenity) => amenityLabels[amenity])
        .join("، ")} اشاره کرد.`
    );
  }

  lines.push(
    "دسترسی مناسب به خطوط حمل‌ونقل عمومی، مراکز خرید، مدرسه و درمانگاه از نقاط قوت این موقعیت است. برای هماهنگی بازدید حضوری با کارشناس پرونده تماس بگیرید."
  );

  return lines.join("\n\n");
}

/** Builds the detail view for one listing, or `null` for an unknown id. */
export function getEstateDetail(id: string): EstateDetail | null {
  const listing = allListings.find((item) => item.id === id);
  if (!listing) return null;

  const random = createRandom(listing.code.length * 7717 + Number(listing.code));
  const pick = <T,>(items: T[]): T =>
    items[Math.floor(random() * items.length)];
  const between = (min: number, max: number) =>
    min + Math.floor(random() * (max - min + 1));

  const conditions = conditionPool.filter(() => random() > 0.55);

  return {
    ...listing,
    description: buildDescription(listing),
    conditions: conditions.length > 0 ? conditions : [conditionPool[0]],
    usage:
      listing.propertyType === "commercial"
        ? "تجاری"
        : listing.propertyType === "office"
          ? "اداری"
          : pick(usages),
    deed: pick(deeds),
    buildYear: 1404 - listing.buildingAge,
    floorType: pick(floorTypes),
    pricePerMeterValue: Math.round(listing.priceValue / listing.area),
    hasPlan: listing.propertyType !== "land" && random() > 0.35,
    hasExchange: conditions.some((item) => item.includes("معاوضه")),
    views: between(120, 4800),
    agent: {
      name: listing.agentName,
      gender: listing.agentGender,
      branch: pick(branches),
      phone: `۰۹۱۲۳۴۵${between(1000, 9999)}`,
      deals: between(12, 90),
      yearsActive: between(2, 14),
    },
  };
}

/** Every id the route can pre-render. */
export function getAllEstateIds(): string[] {
  return allListings.map((listing) => listing.id);
}

/**
 * Files a visitor is most likely to compare this one against: same deal and
 * property type, closest in area, with the same district floated to the top.
 */
export function getSimilarListings(detail: EstateDetail, limit = 6): Listing[] {
  return allListings
    .filter(
      (listing) =>
        listing.id !== detail.id &&
        listing.dealType === detail.dealType &&
        listing.propertyType === detail.propertyType
    )
    .sort((a, b) => {
      const districtScore =
        Number(b.district === detail.district) -
        Number(a.district === detail.district);
      if (districtScore !== 0) return districtScore;
      return (
        Math.abs(a.area - detail.area) - Math.abs(b.area - detail.area)
      );
    })
    .slice(0, limit);
}

/** "۳ روز پیش" / "امروز" — the relative wording used across the site. */
export function formatPublished(daysAgo: number): string {
  if (daysAgo === 0) return "امروز";
  if (daysAgo === 1) return "دیروز";
  if (daysAgo < 30) return `${daysAgo.toLocaleString("fa-IR")} روز پیش`;
  const months = Math.floor(daysAgo / 30);
  return `${months.toLocaleString("fa-IR")} ماه پیش`;
}

export { formatToman };
