import {
  clearCompareResponseSchema,
  clearFavoritesResponseSchema,
  compareListResponseSchema,
  favoriteAgentToggleResponseSchema,
  favoriteAgentsResponseSchema,
  favoriteEstatesResponseSchema,
  pinAgentResponseSchema,
  pinEstateResponseSchema,
  type CompareListResponse,
  type FavoriteAgentsResponse,
  type FavoriteEstatesResponse,
} from "@/app/_favorites/_schemas/favorites.schema";
import {
  deleteValidated,
  getValidated,
  postValidated,
} from "@/lib/api/http-client";

const endpoints = {
  estates: "/api/site3/favorites/estates",
  agents: "/api/site3/favorites/agents",
  pinEstate: (id: string | number) =>
    `/api/site3/favorites/estates/${id}/pin`,
  agent: (id: string | number) => `/api/site3/favorites/agents/${id}`,
  pinAgent: (id: string | number) => `/api/site3/favorites/agents/${id}/pin`,
  compare: "/api/site3/compare",
} as const;

export function getFavoriteEstates(
  signal?: AbortSignal,
): Promise<FavoriteEstatesResponse> {
  return getValidated(endpoints.estates, favoriteEstatesResponseSchema, { signal });
}

export function getFavoriteAgents(
  signal?: AbortSignal,
): Promise<FavoriteAgentsResponse> {
  return getValidated(endpoints.agents, favoriteAgentsResponseSchema, { signal });
}

export function getCompareList(
  signal?: AbortSignal,
): Promise<CompareListResponse> {
  return getValidated(endpoints.compare, compareListResponseSchema, { signal });
}

/** Toggles the pin; a file that is not saved at all answers 422. */
export function pinFavoriteEstate(id: string | number) {
  return postValidated(endpoints.pinEstate(id), pinEstateResponseSchema);
}

/** Toggles: saves the agent when they are not saved, removes them when they are. */
export function toggleFavoriteAgent(id: string | number) {
  return postValidated(endpoints.agent(id), favoriteAgentToggleResponseSchema);
}

export function pinFavoriteAgent(id: string | number) {
  return postValidated(endpoints.pinAgent(id), pinAgentResponseSchema);
}

export function clearFavoriteEstates() {
  return deleteValidated(endpoints.estates, clearFavoritesResponseSchema);
}

export function clearCompareList() {
  return deleteValidated(endpoints.compare, clearCompareResponseSchema);
}
