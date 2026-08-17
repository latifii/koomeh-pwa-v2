export const homeQueryKeys = {
  all: ["home"] as const,
  sections: () => [...homeQueryKeys.all, "sections"] as const,
  latestSaleEstates: (limit: number) =>
    [...homeQueryKeys.sections(), "latest-sale-estates", { limit }] as const,
  latestRentEstates: (limit: number) =>
    [...homeQueryKeys.sections(), "latest-rent-estates", { limit }] as const,
  virtualTourEstates: (limit: number) =>
    [...homeQueryKeys.sections(), "virtual-tour-estates", { limit }] as const,
  topRankedAgents: (limit: number) =>
    [...homeQueryKeys.sections(), "top-ranked-agents", { limit }] as const,
  latestBlogArticles: (limit: number) =>
    [...homeQueryKeys.sections(), "latest-blog-articles", { limit }] as const,
  neighborhoodGuides: (limit: number) =>
    [...homeQueryKeys.sections(), "neighborhood-guides", { limit }] as const,
  cityBranches: () =>
    [...homeQueryKeys.sections(), "city-branches"] as const,
};
