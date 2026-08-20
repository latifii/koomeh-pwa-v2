"use client";

import { useQuery } from "@tanstack/react-query";

import { estateMapQueryOptions } from "@/app/properties/_queries/estate-map.query";
import type { EstateMapParams } from "@/app/properties/_types/estate-search.types";

export function useEstateMap(
  params: EstateMapParams,
  options: { enabled?: boolean } = {},
) {
  return useQuery(estateMapQueryOptions(params, options.enabled));
}
