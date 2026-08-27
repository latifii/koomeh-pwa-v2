export const estateActionsQueryKeys = {
  all: ["estate-actions"] as const,
  favorites: () => [...estateActionsQueryKeys.all, "favorites"] as const,
  compare: () => [...estateActionsQueryKeys.all, "compare"] as const,
  reportReasons: () => [...estateActionsQueryKeys.all, "report-reasons"] as const,
};
