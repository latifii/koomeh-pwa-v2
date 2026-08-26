import type { Gender } from "./avatars";
import type { PropertyType } from "./home";
import { allListings } from "./listings";
import type { Listing } from "./search";

export type AgentActivity = "sale" | "rent" | "both";

export interface Agent {
  /** Slug — also the profile route param. */
  id: string;
  name: string;
  gender: Gender;
  branch: string;
  phone: string;
  activity: AgentActivity;
  activityLabel?: string;
  bio: string;
  rating: number;
  reviewsCount: number;
  totalDeals: number;
  activeEstateCount?: number;
  saleCount?: number;
  rentCount?: number;
  yearsActive: number;
  joinedYear: number;
  specialties: PropertyType[];
  districts: string[];
  social: { whatsapp?: boolean; instagram?: boolean; telegram?: boolean };
  isTopRated?: boolean;
  photo?: string;
  branchUrl?: string;
}

export const activityLabels: Record<AgentActivity, string> = {
  sale: "کارشناس خرید و فروش",
  rent: "کارشناس رهن و اجاره",
  both: "کارشناس فروش و اجاره",
};

/** Short form for chips and dense rows. */
export const activityShortLabels: Record<AgentActivity, string> = {
  sale: "خرید و فروش",
  rent: "رهن و اجاره",
  both: "فروش و اجاره",
};

export type AgentSortKey = "topRated" | "mostDeals" | "experienced";

export const agentSortLabels: Record<AgentSortKey, string> = {
  topRated: "بیشترین امتیاز",
  mostDeals: "بیشترین معامله",
  experienced: "باسابقه‌ترین",
};

/**
 * Canonical advisors. Names match `agentName` on the listings, so a profile's
 * active files are simply the listings assigned to that name — no extra wiring.
 */
export const agents: Agent[] = [
  {
    id: "a1",
    name: "علی محمدی",
    gender: "male",
    branch: "پردیسان",
    phone: "۰۹۱۲۳۴۵۶۷۸۱",
    activity: "sale",
    bio: "با نُه سال سابقه در بازار مسکن قم، تمرکز من روی خرید و فروش آپارتمان و ویلایی در مناطق پردیسان و سالاریه است. باور دارم یک معامله خوب با شناخت دقیق نیاز مشتری و شفافیت کامل شکل می‌گیرد.",
    rating: 4.9,
    reviewsCount: 214,
    totalDeals: 148,
    yearsActive: 9,
    joinedYear: 1395,
    specialties: ["apartment", "villa"],
    districts: ["پردیسان", "سالاریه"],
    social: { whatsapp: true, instagram: true, telegram: true },
    isTopRated: true,
  },
  {
    id: "a2",
    name: "زهرا احمدی",
    gender: "female",
    branch: "جمهوری",
    phone: "۰۹۱۲۳۴۵۶۷۸۲",
    activity: "both",
    bio: "کارشناس فروش و اجاره با هفت سال تجربه، متخصص واحدهای مسکونی و تجاری در محدوده جمهوری و کریمی. همراهی مشتری تا لحظه عقد قرارداد، اصل کاری من است.",
    rating: 4.8,
    reviewsCount: 176,
    totalDeals: 132,
    yearsActive: 7,
    joinedYear: 1397,
    specialties: ["apartment", "commercial"],
    districts: ["جمهوری", "کریمی"],
    social: { whatsapp: true, telegram: true },
    isTopRated: true,
  },
  {
    id: "a3",
    name: "حسین رضایی",
    gender: "male",
    branch: "صدوقی",
    phone: "۰۹۱۲۳۴۵۶۷۸۳",
    activity: "rent",
    bio: "شش سال است در حوزه رهن و اجاره فعالیت می‌کنم و بیشتر روی آپارتمان و واحدهای اداری در صفاشهر و شهرک قدس تمرکز دارم. سرعت و صداقت در پاسخ‌گویی، مهم‌ترین تعهد من است.",
    rating: 4.7,
    reviewsCount: 143,
    totalDeals: 96,
    yearsActive: 6,
    joinedYear: 1398,
    specialties: ["apartment", "office"],
    districts: ["صفاشهر", "شهرک قدس"],
    social: { whatsapp: true, telegram: true, instagram: true },
    isTopRated: true,
  },
  {
    id: "a4",
    name: "مریم کریمی",
    gender: "female",
    branch: "زمرد",
    phone: "۰۹۱۲۳۴۵۶۷۸۴",
    activity: "sale",
    bio: "متخصص فروش ویلایی و زمین در محله‌های زنبیل‌آباد و فردوسی. تجربه پنج‌ساله من نشان داده که سرمایه‌گذاری درست، از انتخاب موقعیت مناسب شروع می‌شود.",
    rating: 4.6,
    reviewsCount: 118,
    totalDeals: 88,
    yearsActive: 5,
    joinedYear: 1399,
    specialties: ["villa", "land"],
    districts: ["زنبیل‌آباد", "فردوسی"],
    social: { whatsapp: true, instagram: true },
  },
  {
    id: "a5",
    name: "امیر حسینی",
    gender: "male",
    branch: "پردیسان",
    phone: "۰۹۱۲۳۴۵۶۷۸۵",
    activity: "both",
    bio: "کارشناس فروش و اجاره با تمرکز بر آپارتمان و زمین در پردیسان و زنبیل‌آباد. تلاش می‌کنم گزینه‌هایی متناسب با بودجه واقعی هر مشتری معرفی کنم.",
    rating: 4.5,
    reviewsCount: 92,
    totalDeals: 74,
    yearsActive: 4,
    joinedYear: 1400,
    specialties: ["apartment", "land"],
    districts: ["پردیسان", "زنبیل‌آباد"],
    social: { whatsapp: true, telegram: true },
  },
  {
    id: "a6",
    name: "سارا نوری",
    gender: "female",
    branch: "جمهوری",
    phone: "۰۹۱۲۳۴۵۶۷۸۶",
    activity: "rent",
    bio: "چهار سال است در حوزه رهن و اجاره آپارتمان و واحدهای تجاری در کریمی و جمهوری فعالیت می‌کنم. رضایت مستأجر و مالک، هر دو برایم اهمیت دارد.",
    rating: 4.7,
    reviewsCount: 81,
    totalDeals: 63,
    yearsActive: 4,
    joinedYear: 1400,
    specialties: ["apartment", "commercial"],
    districts: ["کریمی", "جمهوری"],
    social: { whatsapp: true, instagram: true, telegram: true },
  },
];

export function getAgent(id: string): Agent | null {
  return agents.find((agent) => agent.id === id) ?? null;
}

export function getAllAgentIds(): string[] {
  return agents.map((agent) => agent.id);
}

/** Maps a listing's `agentName` back to a canonical agent id, if one exists. */
export function getAgentIdByName(name: string): string | null {
  return agents.find((agent) => agent.name === name)?.id ?? null;
}

/**
 * The advisor's active files: every listing assigned to their name, newest
 * first. This is the profile page's core content.
 */
export function getAgentListings(agent: Agent): Listing[] {
  return allListings
    .filter((listing) => listing.agentName === agent.name)
    .sort((a, b) => a.publishedDaysAgo - b.publishedDaysAgo);
}

/** Live count without materialising the full list — for cards and stats. */
export function getAgentListingCount(agent: Agent): number {
  return allListings.filter((listing) => listing.agentName === agent.name)
    .length;
}

export interface AgentFilters {
  query: string;
  activity: AgentActivity | "";
  specialty: PropertyType | "";
  sort: AgentSortKey;
}

export const defaultAgentFilters: AgentFilters = {
  query: "",
  activity: "",
  specialty: "",
  sort: "topRated",
};

export function filterAgents(list: Agent[], filters: AgentFilters): Agent[] {
  const query = filters.query.trim();

  const result = list.filter((agent) => {
    if (filters.activity && agent.activity !== filters.activity) return false;
    if (filters.specialty && !agent.specialties.includes(filters.specialty))
      return false;
    if (query && !agent.name.includes(query)) return false;
    return true;
  });

  return sortAgents(result, filters.sort);
}

function sortAgents(list: Agent[], sort: AgentSortKey): Agent[] {
  const sorted = [...list];
  switch (sort) {
    case "mostDeals":
      return sorted.sort((a, b) => b.totalDeals - a.totalDeals);
    case "experienced":
      return sorted.sort((a, b) => b.yearsActive - a.yearsActive);
    default:
      return sorted.sort((a, b) => b.rating - a.rating);
  }
}
