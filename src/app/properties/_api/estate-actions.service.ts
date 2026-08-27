import {
  compareListResponseSchema,
  compareToggleResponseSchema,
  estateViewResponseSchema,
  favoriteEstatesResponseSchema,
  favoriteToggleResponseSchema,
  reportEstateResponseSchema,
  reportReasonsResponseSchema,
  type CompareListResponse,
  type CompareToggleResponse,
  type FavoriteEstatesResponse,
  type FavoriteToggleResponse,
  type ReportReasonsResponse,
} from "@/app/properties/_schemas/estate-actions.schema";
import {
  deleteValidated,
  getValidated,
  postValidated,
} from "@/lib/api/http-client";

const endpoints = {
  favorite: (id: string | number) => `/api/site3/estates/${id}/favorite`,
  compare: (id: string | number) => `/api/site3/estates/${id}/compare`,
  view: (id: string | number) => `/api/site3/estates/${id}/view`,
  report: (id: string | number) => `/api/site3/estates/${id}/report`,
  reportReasons: "/api/site3/estates/report-reasons",
  favoriteEstates: "/api/site3/favorites/estates",
  compareList: "/api/site3/compare",
} as const;

export function addFavorite(
  id: string | number,
): Promise<FavoriteToggleResponse> {
  return postValidated(endpoints.favorite(id), favoriteToggleResponseSchema);
}

export function removeFavorite(
  id: string | number,
): Promise<FavoriteToggleResponse> {
  return deleteValidated(endpoints.favorite(id), favoriteToggleResponseSchema);
}

export function addToCompare(
  id: string | number,
): Promise<CompareToggleResponse> {
  return postValidated(endpoints.compare(id), compareToggleResponseSchema);
}

export function removeFromCompare(
  id: string | number,
): Promise<CompareToggleResponse> {
  return deleteValidated(endpoints.compare(id), compareToggleResponseSchema);
}

/**
 * Bumps the file's visit counter. `he` carries the share link a customer was
 * sent, which also marks that relationship as seen.
 */
export function recordEstateView(
  id: string | number,
  shareId?: number,
  signal?: AbortSignal,
) {
  return postValidated(endpoints.view(id), estateViewResponseSchema, undefined, {
    params: shareId ? { he: shareId } : undefined,
    signal,
  });
}

export function getFavoriteEstates(
  signal?: AbortSignal,
): Promise<FavoriteEstatesResponse> {
  return getValidated(endpoints.favoriteEstates, favoriteEstatesResponseSchema, {
    signal,
  });
}

export function getCompareList(
  signal?: AbortSignal,
): Promise<CompareListResponse> {
  return getValidated(endpoints.compareList, compareListResponseSchema, {
    signal,
  });
}

export function getReportReasons(
  signal?: AbortSignal,
): Promise<ReportReasonsResponse> {
  return getValidated(endpoints.reportReasons, reportReasonsResponseSchema, {
    signal,
  });
}

export function reportEstate(
  id: string | number,
  body: {
    reason_group: number;
    reason_subgroup?: number;
    description?: string;
  },
) {
  return postValidated(endpoints.report(id), reportEstateResponseSchema, body);
}
