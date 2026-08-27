import type { PanelEstateParams } from "@/app/panel/properties/_types/panel-estates.types";

export const panelEstatesQueryKeys = {
  all: ["panel-estates"] as const,
  list: (params: Omit<PanelEstateParams, "page">) =>
    [...panelEstatesQueryKeys.all, "list", params] as const,
  map: (params: Omit<PanelEstateParams, "page">) =>
    [...panelEstatesQueryKeys.all, "map", params] as const,
  filters: () => [...panelEstatesQueryKeys.all, "filters"] as const,
};
