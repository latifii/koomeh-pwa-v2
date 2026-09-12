import { getCachedLatestRentEstates } from "@/app/_home/_cache/home-estates.cache";
import { HOME_ESTATE_LIMITS } from "@/app/_home/_constants/home-limits";
import { RENT_QUICK_FILTERS } from "@/app/_home/_constants/rent-filters";
import type { Estate } from "@/data/home";
import { getApiErrorMessage } from "@/lib/api/api-error";

import { EstateSectionError } from "./estate-section-state";
import { RentSection } from "./rent-section";

/**
 * Fetched on the server, one request per chip, in parallel and each cached
 * on its own — so pressing a chip in the browser swaps cards that are
 * already there. A chip whose request fails simply has no cards; only all
 * four failing is an error worth showing.
 */
export async function LatestRentEstatesServer() {
  const results = await Promise.allSettled(
    RENT_QUICK_FILTERS.map((filter) =>
      getCachedLatestRentEstates(HOME_ESTATE_LIMITS.rent, filter.params),
    ),
  );

  const first = results.find((result) => result.status === "fulfilled");
  if (!first) {
    const failed = results[0];
    return (
      <EstateSectionError
        title="دریافت املاک رهن و اجاره ناموفق بود"
        message={getApiErrorMessage(
          failed.status === "rejected" ? failed.reason : undefined,
        )}
      />
    );
  }

  const variants: Record<string, Estate[]> = {};
  RENT_QUICK_FILTERS.forEach((filter, index) => {
    const result = results[index];
    variants[filter.key] =
      result.status === "fulfilled" ? result.value.items : [];
  });

  return <RentSection section={first.value} variants={variants} />;
}
