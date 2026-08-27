export const estateActionsQueryKeys = {
  all: ["estate-actions"] as const,
  reportReasons: () => [...estateActionsQueryKeys.all, "report-reasons"] as const,
};
