import { getCachedLatestRentEstates } from "@/app/_home/_cache/home-estates.cache";
import { HOME_ESTATE_LIMITS } from "@/app/_home/_constants/home-limits";
import { getApiErrorMessage } from "@/lib/api/api-error";

import { EstateSectionError } from "./estate-section-state";
import { RentSection } from "./rent-section";

/**
 * Fetched and rendered on the server.
 *
 * This used to hand the data to a client component through a
 * `HydrationBoundary`, which meant the browser downloaded the query, the axios
 * client and the whole Zod schema tree for a `queryFn` that never ran: the
 * data was already hydrated, `staleTime` is five minutes and
 * `refetchOnWindowFocus` is off. The section below has no interactivity of its
 * own, so rendering it here keeps it — and everything it imports — out of the
 * client bundle entirely.
 */
export async function LatestRentEstatesServer() {
  let section;

  try {
    section = await getCachedLatestRentEstates(HOME_ESTATE_LIMITS.rent);
  } catch (error) {
    return (
      <EstateSectionError
        title="دریافت املاک رهن و اجاره ناموفق بود"
        message={getApiErrorMessage(error)}
      />
    );
  }

  return <RentSection section={section} />;
}
