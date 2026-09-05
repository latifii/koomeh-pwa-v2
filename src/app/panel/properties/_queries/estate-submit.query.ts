import { queryOptions } from "@tanstack/react-query";

import {
  getEstateForEdit,
  getEstateFormOptions,
} from "@/app/panel/properties/_api/estate-submit.service";

/** The form's shape changes rarely, so it is fetched once per session. */
export function estateFormOptionsQueryOptions() {
  return queryOptions({
    queryKey: ["panel-estates", "form-options"] as const,
    queryFn: async ({ signal }) => (await getEstateFormOptions(signal)).result,
    staleTime: 30 * 60 * 1_000,
  });
}

/**
 * The listing being edited. Never cached: the form seeds itself from this once,
 * and a stale copy would quietly resurrect values somebody has already changed
 * — including from another tab.
 */
export function estateEditQueryOptions(id: string | number) {
  return queryOptions({
    queryKey: ["panel-estates", "edit", String(id)] as const,
    queryFn: async ({ signal }) => (await getEstateForEdit(id, signal)).result,
    staleTime: 0,
    gcTime: 0,
    retry: false,
  });
}
