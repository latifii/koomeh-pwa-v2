import type { Gender } from "./avatars";
import { type Branch, branches } from "./home";
import { allListings } from "./listings";
import type { Listing } from "./search";

/** A single advisor working out of a branch. */
export interface BranchExpert {
  id: string;
  /** Canonical agent id, so the card links to the advisor's profile. */
  agentId: string;
  name: string;
  gender: Gender;
  /** "مشاور فروش" / "مشاور اجاره" / "مشاور فروش و اجاره". */
  role: string;
  deals: number;
  isManager?: boolean;
}

/** Everything the branch detail page needs beyond the lean homepage `Branch`. */
export interface BranchDetail extends Branch {
  slug: string;
  description: string;
  establishedYear: number;
  rating: number;
  reviewsCount: number;
  activeListings: number;
  monthlyDeals: number;
  totalDeals: number;
  lat: number;
  lng: number;
  secondaryPhone: string;
  managerName: string;
  workingHours: { days: string; hours: string; closed?: boolean }[];
  experts: BranchExpert[];
  featuredListings: Listing[];
}

/** Approximate branch coordinates around Qom, keyed by branch id. */
const coordinates: Record<string, [number, number]> = {
  b1: [34.6301, 50.8298],
  b2: [34.6412, 50.8801],
  b3: [34.6552, 50.8604],
  b4: [34.6208, 50.9007],
};

const managerNames: Record<string, string> = {
  b1: "علی محمدی",
  b2: "زهرا احمدی",
  b3: "حسین رضایی",
  b4: "مریم کریمی",
};

// The canonical roster, so every branch advisor links to a real profile.
const expertPool: { name: string; gender: Gender; agentId: string }[] = [
  { name: "علی محمدی", gender: "male", agentId: "a1" },
  { name: "زهرا احمدی", gender: "female", agentId: "a2" },
  { name: "حسین رضایی", gender: "male", agentId: "a3" },
  { name: "مریم کریمی", gender: "female", agentId: "a4" },
  { name: "امیر حسینی", gender: "male", agentId: "a5" },
  { name: "سارا نوری", gender: "female", agentId: "a6" },
];

const roles = ["مشاور فروش", "مشاور اجاره", "مشاور فروش و اجاره"];

const workingHours = [
  { days: "شنبه تا چهارشنبه", hours: "۹:۰۰ تا ۲۰:۰۰" },
  { days: "پنجشنبه", hours: "۹:۰۰ تا ۱۴:۰۰" },
  { days: "جمعه", hours: "تعطیل", closed: true },
];

/** Deterministic LCG, matching the rest of the mock data layer. */
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/** Latin → Persian digits, so a phone number reads as one script, no commas. */
function toFaDigits(value: number | string): string {
  return String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

function buildDescription(branch: Branch): string {
  return [
    `${branch.name} گروه املاک کومه یکی از فعال‌ترین دفاتر مشاور املاک در قم است که با تکیه بر تیمی از مشاوران متخصص، خدمات خرید، فروش و اجاره انواع ملک را در این منطقه ارائه می‌دهد.`,
    "تمرکز این شعبه بر شفافیت در معامله، فایلینگ به‌روز و بدرقه مشتری تا مرحله عقد قرارداد است. کارشناسان ما با شناخت دقیق از بازار محله، بهترین گزینه‌ها را متناسب با بودجه و نیاز شما معرفی می‌کنند.",
  ].join("\n\n");
}

/** Builds the detail view for a branch by id, or `null` if unknown. */
export function getBranchDetail(id: string): BranchDetail | null {
  const branch = branches.find((item) => item.id === id);
  if (!branch) return null;

  const seed = Number(id.replace(/\D/g, "")) || 1;
  const random = createRandom(seed * 4099 + 17);
  const between = (min: number, max: number) =>
    min + Math.floor(random() * (max - min + 1));

  const manager = managerNames[branch.id] ?? expertPool[0].name;
  const managerPerson =
    expertPool.find((p) => p.name === manager) ?? expertPool[0];

  // Manager leads, then a rotating window of the pool (skipping the manager) so
  // each branch shows a different, non-repeating team.
  const expertCount = between(4, 6);
  const rest = expertPool.filter((p) => p.name !== managerPerson.name);
  const start = seed % rest.length;

  const experts: BranchExpert[] = [
    {
      id: `${branch.id}-e1`,
      agentId: managerPerson.agentId,
      name: managerPerson.name,
      gender: managerPerson.gender,
      role: "مدیر شعبه",
      deals: between(40, 90),
      isManager: true,
    },
    ...Array.from({ length: expertCount - 1 }, (_, i) => {
      const person = rest[(start + i) % rest.length];
      return {
        id: `${branch.id}-e${i + 2}`,
        agentId: person.agentId,
        name: person.name,
        gender: person.gender,
        role: roles[between(0, roles.length - 1)],
        deals: between(8, 64),
      };
    }),
  ];

  // A deterministic slice of the inventory stands in for "this branch's files".
  const featuredListings = allListings
    .filter((_, i) => i % branches.length === seed % branches.length)
    .slice(0, 4);

  return {
    ...branch,
    slug: branch.id,
    description: buildDescription(branch),
    establishedYear: between(1388, 1400),
    rating: Number((4.3 + random() * 0.6).toFixed(1)),
    reviewsCount: between(45, 320),
    activeListings: between(60, 480),
    monthlyDeals: between(8, 34),
    totalDeals: between(320, 1900),
    lat: coordinates[branch.id]?.[0] ?? 34.6416,
    lng: coordinates[branch.id]?.[1] ?? 50.8746,
    secondaryPhone: `۰۹۱۲${toFaDigits(between(1000000, 9999999))}`,
    managerName: manager,
    workingHours,
    experts,
    featuredListings,
  };
}

/** Every branch id, for static generation. */
export function getAllBranchIds(): string[] {
  return branches.map((branch) => branch.id);
}

/** Other branches, for the "شعب دیگر" rail. */
export function getOtherBranches(currentId: string): Branch[] {
  return branches.filter((branch) => branch.id !== currentId);
}
