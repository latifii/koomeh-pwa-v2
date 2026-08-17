const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Shared server-cache lifetimes, expressed in seconds. */
export const cacheTtl = {
  latestEstates: 5 * MINUTE,
  articles: 6 * HOUR,
  agents: DAY,
  branches: DAY,
  neighborhoods: DAY,
} as const;

export const cacheTags = {
  home: {
    latestSaleEstates: "home:latest-sale-estates",
    latestRentEstates: "home:latest-rent-estates",
    virtualTourEstates: "home:virtual-tour-estates",
    articles: "home:articles",
    agents: "home:agents",
    branches: "home:branches",
    neighborhoods: "home:neighborhoods",
  },
} as const;
