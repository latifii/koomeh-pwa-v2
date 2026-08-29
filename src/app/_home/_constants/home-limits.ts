/**
 * How many items each home section asks for.
 *
 * They live here rather than beside the queries because the server sections
 * need them too, and importing a query module server-side would drag the axios
 * client and the schema tree back across a boundary this split exists to keep
 * clear.
 */

export const HOME_ESTATE_LIMITS = {
  sale: 8,
  rent: 4,
  virtualTour: 3,
} as const;

export const HOME_AGENTS_LIMIT = 3;

export const HOME_CONTENT_LIMITS = {
  blogArticles: 3,
  neighborhoodGuides: 6,
} as const;
