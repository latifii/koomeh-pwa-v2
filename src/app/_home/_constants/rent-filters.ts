import type { PropertyType } from "@/data/home";
import { routes } from "@/lib/routes";

/**
 * The «املاک رهن و اجاره» chips — the same four the API lists, defined here
 * so the page can fetch each one's cards up front and swap them in place
 * when a chip is pressed, instead of leaving for the search page. `params`
 * is what the section endpoint takes; `href` is the old site's indexed URL
 * for the same list, kept for «مشاهده همه».
 */
export type RentQuickFilter = {
  key: string;
  label: string;
  href: string;
  params: { estateType?: number; fullMortgage?: boolean };
  /** The card-side twin of `estateType`, so the chip can also narrow a list
      that came back unfiltered from a server that predates the parameter. */
  propertyType?: PropertyType;
};

export const RENT_QUICK_FILTERS: readonly RentQuickFilter[] = [
  {
    key: "apartment",
    label: "آپارتمان",
    href: routes.properties({ type: 2, estateTypes: 1 }),
    params: { estateType: 1 },
    propertyType: "apartment",
  },
  {
    key: "villa",
    label: "خانه ویلایی",
    href: routes.properties({ type: 2, estateTypes: 2 }),
    params: { estateType: 2 },
    propertyType: "villa",
  },
  {
    key: "commercial",
    label: "تجاری",
    // مغازه is type 3; the old page's chip sent 4, which is «زمین و کلنگی».
    href: routes.properties({ type: 2, estateTypes: 3 }),
    params: { estateType: 3 },
    propertyType: "commercial",
  },
  {
    key: "full-mortgage",
    label: "رهن کامل",
    href: routes.properties({ type: 2 }),
    params: { fullMortgage: true },
  },
];
