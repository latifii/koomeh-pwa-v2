export const homeQueryKeys = {
  all: ["home"] as const,
  sections: () => [...homeQueryKeys.all, "sections"] as const,
  latestSaleEstates: (limit: number) =>
    [...homeQueryKeys.sections(), "latest-sale-estates", { limit }] as const,
  latestRentEstates: (limit: number) =>
    [...homeQueryKeys.sections(), "latest-rent-estates", { limit }] as const,
};
