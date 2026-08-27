export const dashboardQueryKeys = {
  all: ["dashboard"] as const,
  summary: () => [...dashboardQueryKeys.all, "summary"] as const,
  tasks: () => [...dashboardQueryKeys.all, "tasks"] as const,
  followUps: () => [...dashboardQueryKeys.all, "follow-ups"] as const,
  highlights: () => [...dashboardQueryKeys.all, "highlights"] as const,
  notes: () => [...dashboardQueryKeys.all, "notes"] as const,
};
