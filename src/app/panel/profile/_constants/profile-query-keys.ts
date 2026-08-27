export const profileQueryKeys = {
  all: ["profile"] as const,
  detail: () => [...profileQueryKeys.all, "detail"] as const,
  preferences: () => [...profileQueryKeys.all, "preferences"] as const,
};
