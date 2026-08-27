import type { NeighborhoodListParams } from "@/app/neighborhoods/_types/neighborhoods.types";

export const neighborhoodQueryKeys = {
  all: ["neighborhoods"] as const,
  list: (params: Omit<NeighborhoodListParams, "page">) =>
    [...neighborhoodQueryKeys.all, "list", params] as const,
  estates: (id: string | number, type?: number) =>
    [...neighborhoodQueryKeys.all, "estates", String(id), type ?? "all"] as const,
};
