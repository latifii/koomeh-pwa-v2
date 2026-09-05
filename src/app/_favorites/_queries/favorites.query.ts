import { queryOptions } from "@tanstack/react-query";

import {
  getCompareList,
  getFavoriteAgents,
  getFavoriteEstates,
} from "@/app/_favorites/_api/favorites.service";
import { favoritesQueryKeys } from "@/app/_favorites/_constants/favorites-query-keys";
import {
  mapCompareList,
  mapFavoriteAgents,
  mapFavoriteEstates,
  toAgentIdSet,
  toCompareIdSet,
  toEstateIdSet,
} from "@/app/_favorites/_mappers/favorites.mapper";

/**
 * One fetch backs two very different readers, so each list is cached under a
 * single key and `select` narrows it: the panel pages want the whole list, the
 * estate page only wants to know whether one id is in it.
 */

export function favoriteEstatesQueryOptions(enabled = true) {
  return queryOptions({
    queryKey: favoritesQueryKeys.estates(),
    queryFn: ({ signal }) => getFavoriteEstates(signal),
    enabled,
    staleTime: 5 * 60 * 1_000,
    select: mapFavoriteEstates,
  });
}

export function favoriteEstateIdsQueryOptions(enabled = true) {
  return queryOptions({
    queryKey: favoritesQueryKeys.estates(),
    queryFn: ({ signal }) => getFavoriteEstates(signal),
    enabled,
    staleTime: 5 * 60 * 1_000,
    select: toEstateIdSet,
  });
}

export function favoriteAgentsQueryOptions(enabled = true) {
  return queryOptions({
    queryKey: favoritesQueryKeys.agents(),
    queryFn: ({ signal }) => getFavoriteAgents(signal),
    enabled,
    staleTime: 5 * 60 * 1_000,
    select: mapFavoriteAgents,
  });
}

/** Just the ids, for a card that only needs to know if this agent is saved. */
export function favoriteAgentIdsQueryOptions(enabled = true) {
  return queryOptions({
    queryKey: favoritesQueryKeys.agents(),
    queryFn: ({ signal }) => getFavoriteAgents(signal),
    enabled,
    staleTime: 5 * 60 * 1_000,
    select: toAgentIdSet,
  });
}

export function compareQueryOptions(enabled = true) {
  return queryOptions({
    queryKey: favoritesQueryKeys.compare(),
    queryFn: ({ signal }) => getCompareList(signal),
    enabled,
    staleTime: 5 * 60 * 1_000,
    select: mapCompareList,
  });
}

export function compareIdsQueryOptions(enabled = true) {
  return queryOptions({
    queryKey: favoritesQueryKeys.compare(),
    queryFn: ({ signal }) => getCompareList(signal),
    enabled,
    staleTime: 5 * 60 * 1_000,
    select: toCompareIdSet,
  });
}
