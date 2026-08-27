import { queryOptions } from "@tanstack/react-query";

import { getReportReasons } from "@/app/properties/_api/estate-actions.service";
import { estateActionsQueryKeys } from "@/app/properties/_constants/estate-actions-query-keys";

export {
  compareIdsQueryOptions,
  favoriteEstateIdsQueryOptions as favoriteIdsQueryOptions,
} from "@/app/_favorites/_queries/favorites.query";

/** The report form's options — the same for every file, so fetched once. */
export function reportReasonsQueryOptions(enabled: boolean) {
  return queryOptions({
    queryKey: estateActionsQueryKeys.reportReasons(),
    queryFn: async ({ signal }) => (await getReportReasons(signal)).result,
    enabled,
    staleTime: Infinity,
  });
}
