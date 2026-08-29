import { getCachedVirtualTourEstates } from "@/app/_home/_cache/home-estates.cache";
import { HOME_ESTATE_LIMITS } from "@/app/_home/_constants/home-limits";
import { getApiErrorMessage } from "@/lib/api/api-error";

import { FeatureSectionError } from "./feature-section-state";
import { VirtualTourSection } from "./virtual-tour-section";

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
export async function VirtualTourEstatesServer() {
  let section;

  try {
    section = await getCachedVirtualTourEstates(HOME_ESTATE_LIMITS.virtualTour);
  } catch (error) {
    return (
      <FeatureSectionError
        title="دریافت املاک دارای تور مجازی ناموفق بود"
        message={getApiErrorMessage(error)}
      />
    );
  }

  return <VirtualTourSection section={section} />;
}
