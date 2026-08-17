import type { Estate } from "@/data/home";

export type HomeSectionLimit = number;

export interface HomeEstateSection {
  key: "latest_sale_estates" | "latest_rent_estates";
  eyebrow: string;
  title: string;
  subtitle: string;
  viewAllHref: string;
  total: number;
  items: Estate[];
}

export interface HomeQuickFilter {
  label: string;
  href: string;
}

export interface HomeRentEstateSection extends HomeEstateSection {
  key: "latest_rent_estates";
  quickFilters: HomeQuickFilter[];
}

export interface HomeSaleEstateSection extends HomeEstateSection {
  key: "latest_sale_estates";
}
