import { customerRequestDefaults, type CustomerRequestValues } from "@/app/panel/requests/_schema/customer-request.schema";
import { allListings } from "@/data/listings";
import type { Listing } from "@/data/search";
import { routes } from "@/lib/routes";

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
export function getPanelProperty(id: string): PanelProperty | null {
  return panelProperties.find((item) => item.listing.id === id) ?? null;
}

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

export const favoriteProperties = allListings.slice(5, 11);
export const comparedProperties = allListings.slice(0, 3);
export const recentlyViewedProperties = allListings.slice(12, 18);

export interface SavedSearch {
  id: string;
  title: string;
  summary: string;
  resultCount: number;
  createdAt: string;
  alertsEnabled: boolean;
  query: Record<string, string>;
}

export const savedSearches: SavedSearch[] = [
  { id: "s1", title: "آپارتمان خرید در سالاریه", summary: "۸۰ تا ۱۵۰ متر · حداکثر ۸ میلیارد", resultCount: 12, createdAt: "۲ روز پیش", alertsEnabled: true, query: { deal: "sale", district: "سالاریه", propertyTypes: "apartment" } },
  { id: "s2", title: "رهن کامل در پردیسان", summary: "دو خواب · پارکینگ و آسانسور", resultCount: 8, createdAt: "۵ روز پیش", alertsEnabled: true, query: { deal: "rent", district: "پردیسان" } },
  { id: "s3", title: "واحد تجاری صفاشهر", summary: "۴۰ تا ۱۰۰ متر · بر خیابان اصلی", resultCount: 5, createdAt: "۲ هفته پیش", alertsEnabled: false, query: { deal: "sale", district: "صفاشهر", propertyTypes: "commercial" } },
];

export type NotificationKind = "match" | "property" | "account" | "message";
export interface PanelNotification { id: string; kind: NotificationKind; title: string; description: string; time: string; read: boolean; href?: string; }
export const panelNotifications: PanelNotification[] = [
  { id: "n1", kind: "match", title: "۳ فایل جدید با تقاضای شما تطبیق دارد", description: "فایل‌های جدید در محدوده پردیسان ثبت شده‌اند.", time: "۱۰ دقیقه پیش", read: false, href: routes.panel.request("r-1048") },
  { id: "n2", kind: "property", title: "آگهی شما منتشر شد", description: "فایل آپارتمان نوساز پس از بررسی منتشر شد.", time: "۲ ساعت پیش", read: false, href: routes.panel.properties },
  { id: "n3", kind: "message", title: "پیام جدید از کارشناس کومه", description: "زمان پیشنهادی بازدید برای فردا ساعت ۱۷ ثبت شد.", time: "دیروز", read: true },
  { id: "n4", kind: "account", title: "ورود جدید به حساب", description: "ورود از مرورگر Chrome در ویندوز شناسایی شد.", time: "۳ روز پیش", read: true, href: routes.panel.security },
];

export interface PanelNote { id: string; title: string; body: string; relatedTo: string; updatedAt: string; color: "amber" | "blue" | "green"; }
export const panelNotes: PanelNote[] = [
  { id: "note-1", title: "پیگیری مالک فایل ۱۰۲۷۴۰", body: "مالک برای بازدید عصر سه‌شنبه هماهنگ است؛ قبل از حرکت تماس گرفته شود.", relatedTo: "ملک l3", updatedAt: "امروز", color: "amber" },
  { id: "note-2", title: "اولویت‌های خانم موسوی", body: "نورگیر جنوبی و نزدیکی به مدرسه از متراژ مهم‌تر است.", relatedTo: "تقاضای ۱۰۴۷", updatedAt: "دیروز", color: "blue" },
  { id: "note-3", title: "مدارک قرارداد", body: "تصویر سند و پایان‌کار پیش از جلسه قرارداد دریافت شود.", relatedTo: "ملک l1", updatedAt: "۴ روز پیش", color: "green" },
];
