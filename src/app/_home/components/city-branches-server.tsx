import { getCachedCityBranches } from "@/app/_home/_cache/home-content.cache";
import { getApiErrorMessage } from "@/lib/api/api-error";

import { ContentSectionError } from "./content-section-state";
import { BranchesSection } from "./branches-section";

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
export async function CityBranchesServer() {
  let section;

  try {
    section = await getCachedCityBranches();
  } catch (error) {
    return (
      <ContentSectionError
        variant="branches"
        title="دریافت شعب کومه ناموفق بود"
        message={getApiErrorMessage(error)}
      />
    );
  }

  return <BranchesSection section={section} />;
}
