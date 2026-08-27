import { queryOptions } from "@tanstack/react-query";

import { getEstateFormOptions } from "@/app/panel/properties/_api/estate-submit.service";

/** The form's shape changes rarely, so it is fetched once per session. */
export function estateFormOptionsQueryOptions() {
  return queryOptions({
    queryKey: ["panel-estates", "form-options"] as const,
    queryFn: async ({ signal }) => (await getEstateFormOptions(signal)).result,
    staleTime: 30 * 60 * 1_000,
  });
}
