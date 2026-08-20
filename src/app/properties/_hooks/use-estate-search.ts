"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import { estateSearchInfiniteQueryOptions } from "@/app/properties/_queries/estate-search.query";
import type { EstateSearchParams } from "@/app/properties/_types/estate-search.types";

export function useEstateSearch(params: Omit<EstateSearchParams, "page">) {
  return useInfiniteQuery(estateSearchInfiniteQueryOptions(params));
}
