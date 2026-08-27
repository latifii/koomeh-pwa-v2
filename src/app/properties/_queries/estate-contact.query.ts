import { queryOptions } from "@tanstack/react-query";

import { getEstateContact } from "@/app/properties/_api/estate-detail.service";
import { estateDetailQueryKeys } from "@/app/properties/_constants/estate-detail-query-keys";
import { mapEstateContacts } from "@/app/properties/_mappers/estate-detail.mapper";

/**
 * Phone numbers sit behind their own rate-limited endpoint, so the query only
 * runs once the visitor asks for it and its result is never refetched.
 */
export function estateContactQueryOptions(
  estateId: string | number,
  enabled: boolean,
) {
  return queryOptions({
    queryKey: estateDetailQueryKeys.contact(estateId),
    queryFn: async ({ signal }) =>
      mapEstateContacts(await getEstateContact(estateId, { signal })),
    enabled,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
