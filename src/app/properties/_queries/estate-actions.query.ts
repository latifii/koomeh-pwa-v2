import { queryOptions } from "@tanstack/react-query";

import {
  getCompareList,
  getFavoriteEstates,
  getReportReasons,
} from "@/app/properties/_api/estate-actions.service";
import { estateActionsQueryKeys } from "@/app/properties/_constants/estate-actions-query-keys";

/**
 * The saved-file ids, as a set. The detail response cannot tell us whether a
 * file is already saved — `flags.is_favorite` is always `null` — so membership
 * is derived from the list instead. One request per session covers every
 * estate page the visitor opens.
 */
export function favoriteIdsQueryOptions(enabled: boolean) {
  return queryOptions({
    queryKey: estateActionsQueryKeys.favorites(),
    queryFn: async ({ signal }) => {
      const response = await getFavoriteEstates(signal);
      return new Set(response.result.items.map((item) => String(item.id)));
    },
    enabled,
    staleTime: 5 * 60 * 1_000,
  });
}

export function compareIdsQueryOptions(enabled: boolean) {
  return queryOptions({
    queryKey: estateActionsQueryKeys.compare(),
    queryFn: async ({ signal }) => {
      const response = await getCompareList(signal);
      return new Set(
        response.result.groups.flatMap((group) =>
          group.items.map((item) => String(item.id)),
        ),
      );
    },
    enabled,
    staleTime: 5 * 60 * 1_000,
  });
}

/** The report form's options — the same for every file, so fetched once. */
export function reportReasonsQueryOptions(enabled: boolean) {
  return queryOptions({
    queryKey: estateActionsQueryKeys.reportReasons(),
    queryFn: async ({ signal }) => (await getReportReasons(signal)).result,
    enabled,
    staleTime: Infinity,
  });
}
