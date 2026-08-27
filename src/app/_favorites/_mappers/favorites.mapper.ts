import { mapHomeEstate } from "@/app/_home/_mappers/home-estates.mapper";
import type {
  CompareListResponse,
  FavoriteAgentsResponse,
  FavoriteEstatesResponse,
} from "@/app/_favorites/_schemas/favorites.schema";
import type {
  CompareView,
  FavoriteAgent,
  FavoriteEstate,
} from "@/app/_favorites/_types/favorites.types";
import { toAbsoluteMediaUrl } from "@/lib/api/config";
import { routes } from "@/lib/routes";

export function mapFavoriteEstates(
  response: FavoriteEstatesResponse,
): FavoriteEstate[] {
  return response.result.items.map((item) => ({
    ...mapHomeEstate(item),
    pinned: item.pinned,
    isExpired: item.is_expired,
  }));
}

export function mapFavoriteAgents(
  response: FavoriteAgentsResponse,
): FavoriteAgent[] {
  return response.result.items;
}

export function mapCompareList(response: CompareListResponse): CompareView {
  return {
    total: response.result.total,
    groups: response.result.groups.map((group) => ({
      dealType: group.deal_type,
      dealTypeLabel: group.deal_type_label,
      rows: group.rows,
      items: group.items.map((item) => ({
        id: String(item.id),
        title: item.title.trim(),
        coverImage: toAbsoluteMediaUrl(item.cover_image ?? null),
        href: routes.property(item.id),
        pinned: item.pinned,
        values: item.values,
        best: item.best,
      })),
    })),
  };
}

/** The id sets the estate page uses to decide what its buttons say. */
export function toEstateIdSet(response: FavoriteEstatesResponse): Set<string> {
  return new Set(response.result.items.map((item) => String(item.id)));
}

export function toCompareIdSet(response: CompareListResponse): Set<string> {
  return new Set(
    response.result.groups.flatMap((group) =>
      group.items.map((item) => String(item.id)),
    ),
  );
}
