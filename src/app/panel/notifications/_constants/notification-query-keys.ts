export const notificationQueryKeys = {
  all: ["notifications"] as const,
  feed: () => [...notificationQueryKeys.all, "feed"] as const,
  broadcasts: () => [...notificationQueryKeys.all, "broadcasts"] as const,
};
