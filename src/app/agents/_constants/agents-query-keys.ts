import type { AgentsSearchParams } from "@/app/agents/_types/agents.types";

export const agentsQueryKeys = {
  all: ["agents"] as const,
  filters: (cityId?: number) =>
    [...agentsQueryKeys.all, "filters", cityId ?? "default"] as const,
  list: (params: Omit<AgentsSearchParams, "page">) =>
    [...agentsQueryKeys.all, "list", params] as const,
  profile: (id: string | number) => [...agentsQueryKeys.all, "profile", id] as const,
  estates: (id: string | number, type?: 1 | 2) =>
    [...agentsQueryKeys.all, "estates", id, type ?? "all"] as const,
};
