const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Shared server-cache lifetimes, expressed in seconds. */
export const cacheTtl = {
  latestEstates: 5 * MINUTE,
  estateDetail: 5 * MINUTE,
  articles: 6 * HOUR,
  agents: DAY,
  branches: DAY,
  neighborhoods: DAY,
  /** Lookup lists change about as often as the database schema does. */
  lookups: DAY,
} as const;

/**
 * Tags for the server data cache.
 *
 * These are only worth anything if something purges them: `POST /api/revalidate`
 * is that something, and the backend calls it when content changes. Without a
 * purge every entry simply ages out on its own TTL, which is why the times
 * above stay conservative.
 */
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
  agents: {
    all: "agents",
    list: "agents:list",
    filters: "agents:filters",
    detail: (id: string | number) => `agents:${id}`,
  },
  articles: {
    all: "articles",
    list: "articles:list",
    categories: "articles:categories",
    detail: (id: string | number) => `articles:${id}`,
  },
  branches: {
    all: "branches",
    list: "branches:list",
    detail: (id: string | number) => `branches:${id}`,
  },
  neighborhoods: {
    all: "neighborhoods",
    list: "neighborhoods:list",
    detail: (id: string | number) => `neighborhoods:${id}`,
  },
  estates: {
    all: "estates",
    detail: (id: string | number) => `estates:${id}`,
  },
  lookups: "lookups",
} as const;

/**
 * Every tag a purge request may name. A caller that asks for something outside
 * this list is refused rather than silently ignored — a typo in a webhook
 * should be loud, not a cache that quietly never clears.
 */
export const purgeableTags = new Set<string>([
  ...Object.values(cacheTags.home),
  cacheTags.agents.all,
  cacheTags.agents.list,
  cacheTags.agents.filters,
  cacheTags.articles.all,
  cacheTags.articles.list,
  cacheTags.articles.categories,
  cacheTags.branches.all,
  cacheTags.branches.list,
  cacheTags.neighborhoods.all,
  cacheTags.neighborhoods.list,
  cacheTags.estates.all,
  cacheTags.lookups,
]);

/** `agents:42`, `estates:1234` — an entity tag for any of the known groups. */
const ENTITY_TAG = /^(agents|articles|branches|neighborhoods|estates):\d+$/;

export function isPurgeableTag(tag: string): boolean {
  return purgeableTags.has(tag) || ENTITY_TAG.test(tag);
}
