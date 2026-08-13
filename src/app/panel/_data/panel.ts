import { customerRequestDefaults, type CustomerRequestValues } from "@/app/panel/requests/_schema/customer-request.schema";
import { allListings } from "@/data/listings";
import type { Listing } from "@/data/search";

export type PanelPropertyStatus = "published" | "review" | "draft" | "expired";

export interface PanelProperty {
  listing: Listing;
  status: PanelPropertyStatus;
  inquiries: number;
  views: number;
  updatedAt: string;
}

export const panelProperties: PanelProperty[] = allListings.slice(0, 10).map((listing, index) => ({
  listing,
  status: (["published", "published", "review", "draft", "expired"] as const)[index % 5],
  inquiries: 2 + ((index * 7) % 21),
  views: 48 + index * 37,
  updatedAt: index < 2 ? "امروز" : `${index + 1} روز پیش`,
}));

export type RequestStatus = "new" | "following" | "matched" | "closed";

export interface PanelRequest {
  id: string;
  status: RequestStatus;
  createdAt: string;
  lastFollowUp: string;
  matches: number;
  values: CustomerRequestValues;
}

const requestSeeds = [
  ["r-1048", "مهدی احمدی", "09122541234", "buy", "apartment", "120", "180", "پردیسان", "خرید آپارتمان نوساز با پارکینگ و آسانسور در اولویت است."],
  ["r-1047", "زهرا موسوی", "09193564521", "rent", "villa", "100", "220", "سالاریه", "خانه ویلایی کم‌سن برای خانواده چهار نفره؛ دسترسی محلی مهم است."],
  ["r-1046", "علی رضایی", "09125558811", "buy", "commercial", "45", "90", "صفاشهر", "واحد تجاری بر خیابان اصلی با امکان تغییر دکور نیاز دارد."],
  ["r-1045", "سارا کریمی", "09191002030", "rent", "apartment", "75", "130", "زنبیل‌آباد", "آپارتمان دو خواب نزدیک مدرسه و حمل‌ونقل عمومی مدنظر است."],
  ["r-1044", "حسین محمدی", "09120112233", "buy", "land", "200", "450", "شهرک قدس", "زمین دارای سند رسمی برای ساخت مسکونی درخواست شده است."],
  ["r-1043", "مریم نوری", "09193334455", "buy", "office", "60", "120", "جمهوری", "دفتر اداری با جای پارک و دسترسی مناسب برای مراجعان."],
] as const;

const statuses: RequestStatus[] = ["new", "following", "matched", "following", "closed", "matched"];

export const panelRequests: PanelRequest[] = requestSeeds.map((seed, index) => ({
  id: seed[0],
  status: statuses[index],
  createdAt: index === 0 ? "امروز، ۱۰:۳۰" : `${index + 1} روز پیش`,
  lastFollowUp: index < 2 ? "امروز" : `${index} روز پیش`,
  matches: 3 + ((index * 5) % 12),
  values: {
    ...customerRequestDefaults,
    name: seed[1],
    mobile: seed[2],
    requestType: seed[3],
    estateType: seed[4],
    areaMin: seed[5],
    areaMax: seed[6],
    districts: [seed[7]],
    note: seed[8],
    priceMax: seed[3] === "buy" ? String(4_500_000_000 + index * 800_000_000) : "",
    rentMax: seed[3] === "rent" ? String(18_000_000 + index * 3_000_000) : "",
    status: index === 0 ? "new" : "confirmed",
  },
}));

export function getPanelRequest(id: string): PanelRequest | null {
  return panelRequests.find((request) => request.id === id) ?? null;
}

