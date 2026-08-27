export const favoritesQueryKeys = {
  all: ["favorites"] as const,
  estates: () => [...favoritesQueryKeys.all, "estates"] as const,
  agents: () => [...favoritesQueryKeys.all, "agents"] as const,
  compare: () => [...favoritesQueryKeys.all, "compare"] as const,
};
