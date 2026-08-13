import type { PropertyType } from "./home";
import { allListings } from "./listings";
import { type Listing, formatToman } from "./search";

/** A neighborhood guide entry. */
export interface Area {
  /** Slug — also the detail route param. */
  id: string;
  /** District name, matching `listing.district` so stats can be derived. */
  name: string;
  tagline: string;
  description: string[];
  lat: number;
  lng: number;
  highlights: string[];
  popularFor: PropertyType[];
}

/** Price and inventory figures computed from the live listing set. */
export interface AreaStats {
  listingCount: number;
  saleCount: number;
  rentCount: number;
  /** Toman per square metre for apartments on sale (0 when none). */
  avgApartmentPerMeter: number;
  /** Toman per square metre for land on sale (0 when none). */
  avgLandPerMeter: number;
  /** Average rent deposit, Toman (0 when none). */
  avgRentDeposit: number;
  minPrice: number;
  maxPrice: number;
}

export interface AreaDetail extends Area {
  stats: AreaStats;
}

export const areas: Area[] = [
  {
    id: "pardisan",
    name: "پردیسان",
    tagline: "منطقه‌ای مدرن با دسترسی بالا",
    description: [
      "پردیسان یکی از مدرن‌ترین و پرتقاضاترین محله‌های قم است که با بافت نوساز، بلوارهای عریض و دسترسی مناسب به بزرگراه‌ها، به گزینه‌ای محبوب برای خانواده‌ها تبدیل شده است.",
      "وجود مراکز خرید، فضای سبز و مجتمع‌های مسکونی به‌روز، این محله را هم برای سکونت و هم برای سرمایه‌گذاری میان‌مدت جذاب کرده است.",
    ],
    lat: 34.6295,
    lng: 50.8305,
    highlights: ["نوساز", "خانواده‌پسند", "دسترسی بالا", "فضای سبز"],
    popularFor: ["apartment", "villa"],
  },
  {
    id: "salariyeh",
    name: "سالاریه",
    tagline: "نزدیک به حرم و بافت قدیمی",
    description: [
      "سالاریه با نزدیکی به حرم مطهر و بافت سنتی خود، ترکیبی از اصالت و دسترسی عالی به مرکز شهر را ارائه می‌دهد.",
      "این محله برای کسانی که به نزدیکی به اماکن مذهبی و بازار اهمیت می‌دهند گزینه‌ای مطلوب است و تنوع خوبی از واحدهای کوچک تا متوسط دارد.",
    ],
    lat: 34.645,
    lng: 50.885,
    highlights: ["نزدیک حرم", "بافت قدیمی", "دسترسی مرکزی"],
    popularFor: ["apartment", "commercial"],
  },
  {
    id: "zanbil-abad",
    name: "زنبیل‌آباد",
    tagline: "مناسب سرمایه‌گذاری",
    description: [
      "زنبیل‌آباد از محله‌های رو به رشد قم است که با قیمت‌های منطقی‌تر و پتانسیل بالای رشد، توجه سرمایه‌گذاران را جلب کرده است.",
      "تنوع فایل از زمین و ویلایی تا آپارتمان، انتخاب گسترده‌ای پیش روی خریداران قرار می‌دهد.",
    ],
    lat: 34.638,
    lng: 50.895,
    highlights: ["سرمایه‌گذاری", "روبه‌رشد", "قیمت مناسب"],
    popularFor: ["apartment", "villa", "land"],
  },
  {
    id: "safashahr",
    name: "صفاشهر",
    tagline: "محله‌ای آرام و مسکونی",
    description: [
      "صفاشهر با فضای آرام و بافت کاملاً مسکونی، محیطی مناسب برای زندگی خانوادگی فراهم می‌کند.",
      "دوری از شلوغی مرکز شهر و در عین حال دسترسی قابل قبول، از ویژگی‌های شاخص این محله است.",
    ],
    lat: 34.652,
    lng: 50.868,
    highlights: ["آرام", "مسکونی", "خانوادگی"],
    popularFor: ["apartment", "villa"],
  },
  {
    id: "shahrak-qods",
    name: "شهرک قدس",
    tagline: "ویلایی‌نشین و پردرخت",
    description: [
      "شهرک قدس با خانه‌های ویلایی، کوچه‌های پردرخت و فضای دلباز، یکی از خوش‌آب‌وهواترین محله‌های قم به شمار می‌رود.",
      "این محله بیشتر برای متقاضیان ویلایی و واحدهای بزرگ‌متراژ گزینه‌ای ایده‌آل است.",
    ],
    lat: 34.625,
    lng: 50.878,
    highlights: ["ویلایی‌نشین", "پردرخت", "خوش‌آب‌وهوا"],
    popularFor: ["villa", "land"],
  },
  {
    id: "jomhouri",
    name: "جمهوری",
    tagline: "مرکز تجاری و اداری شهر",
    description: [
      "خیابان جمهوری از محورهای اصلی تجاری و اداری قم است که تراکم بالای واحدهای تجاری و دفاتر کار آن را متمایز می‌کند.",
      "این محله برای کسب‌وکارها و سرمایه‌گذاری تجاری، یکی از پرتقاضاترین نقاط شهر محسوب می‌شود.",
    ],
    lat: 34.6412,
    lng: 50.8801,
    highlights: ["تجاری", "اداری", "پررفت‌وآمد"],
    popularFor: ["commercial", "office", "apartment"],
  },
  {
    id: "karimi",
    name: "کریمی",
    tagline: "دسترسی خوب به مرکز شهر",
    description: [
      "محله کریمی با موقعیت میانی و دسترسی مناسب به مرکز شهر، ترکیبی متعادل از سکونت و خدمات را ارائه می‌دهد.",
      "تنوع واحدهای اجاره‌ای و مسکونی، این محله را برای مستأجران و خریداران هر دو جذاب کرده است.",
    ],
    lat: 34.647,
    lng: 50.872,
    highlights: ["موقعیت میانی", "دسترسی خوب"],
    popularFor: ["apartment", "commercial"],
  },
  {
    id: "ferdowsi",
    name: "فردوسی",
    tagline: "محله‌ای پرتقاضا و روبه‌رشد",
    description: [
      "محله فردوسی با رشد ساخت‌وساز در سال‌های اخیر و تقاضای پایدار، به یکی از مقاصد محبوب خریداران تبدیل شده است.",
      "دسترسی مناسب و تنوع فایل، انتخاب را برای متقاضیان آسان می‌کند.",
    ],
    lat: 34.636,
    lng: 50.866,
    highlights: ["پرتقاضا", "روبه‌رشد"],
    popularFor: ["apartment", "villa"],
  },
];

const average = (values: number[]): number =>
  values.length === 0
    ? 0
    : Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);

/** Derives the price/inventory figures for an area from the listing set. */
function computeStats(name: string): AreaStats {
  const inArea = allListings.filter((listing) => listing.district === name);
  const sale = inArea.filter((listing) => listing.dealType === "sale");
  const rent = inArea.filter((listing) => listing.dealType === "rent");

  const apartmentPerMeter = sale
    .filter((listing) => listing.propertyType === "apartment")
    .map((listing) => Math.round(listing.priceValue / listing.area));
  const landPerMeter = sale
    .filter((listing) => listing.propertyType === "land")
    .map((listing) => Math.round(listing.priceValue / listing.area));

  const salePrices = sale.map((listing) => listing.priceValue);

  return {
    listingCount: inArea.length,
    saleCount: sale.length,
    rentCount: rent.length,
    avgApartmentPerMeter: average(apartmentPerMeter),
    avgLandPerMeter: average(landPerMeter),
    avgRentDeposit: average(
      rent.map((listing) => listing.depositValue ?? 0).filter(Boolean)
    ),
    minPrice: salePrices.length ? Math.min(...salePrices) : 0,
    maxPrice: salePrices.length ? Math.max(...salePrices) : 0,
  };
}

export function getAreaDetail(id: string): AreaDetail | null {
  const area = areas.find((item) => item.id === id);
  if (!area) return null;
  return { ...area, stats: computeStats(area.name) };
}

export function getAllAreaIds(): string[] {
  return areas.map((area) => area.id);
}

/** Areas with their stats, for the list page cards. */
export function getAreaSummaries(): AreaDetail[] {
  return areas.map((area) => ({ ...area, stats: computeStats(area.name) }));
}

/** Active listings in the area, newest first. */
export function getAreaListings(area: Area, limit?: number): Listing[] {
  const list = allListings
    .filter((listing) => listing.district === area.name)
    .sort((a, b) => a.publishedDaysAgo - b.publishedDaysAgo);
  return limit ? list.slice(0, limit) : list;
}

export function getOtherAreas(currentId: string, limit = 4): Area[] {
  return areas.filter((area) => area.id !== currentId).slice(0, limit);
}

export { formatToman };
