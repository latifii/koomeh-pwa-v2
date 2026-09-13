"use client";

import { useQuery } from "@tanstack/react-query";

import {
  estateMapMarkerQueryOptions,
  estateMapPointsQueryOptions,
} from "@/app/properties/_queries/estate-map.query";
import type { EstateMapParams } from "@/app/properties/_types/estate-search.types";

export function useEstateMapPoints(
  params: EstateMapParams,
  options: { enabled?: boolean } = {},
) {
  return useQuery(estateMapPointsQueryOptions(params, options.enabled));
}

export function useEstateMapMarker(id: string | null) {
  return useQuery(estateMapMarkerQueryOptions(id));
}
