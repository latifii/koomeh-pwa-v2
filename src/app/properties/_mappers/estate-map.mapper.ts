import type {
  EstateMapMarkerDto,
  EstateMapResponse,
} from "@/app/properties/_schemas/estate-map.schema";
import { toAbsoluteMediaUrl } from "@/lib/api/config";
import { routes } from "@/lib/routes";

export type EstateMapMarker = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  place: string;
  dealType: "sale" | "rent";
  estateTypeLabel: string;
  area: number;
  roomLabel?: string;
  priceLabel: string;
  pinLabel: string;
  coverImage?: string;
  href: string;
};

export function mapEstateMapMarker(dto: EstateMapMarkerDto): EstateMapMarker {
  return {
    id: String(dto.id),
    lat: dto.latitude,
    lng: dto.longitude,
    title: dto.title,
    place: dto.place,
    dealType: dto.deal_type === 2 ? "rent" : "sale",
    estateTypeLabel: dto.estate_type_label,
    area: dto.area,
    roomLabel: dto.room_label ?? undefined,
    priceLabel: dto.price_label,
    pinLabel: dto.pin_label,
    coverImage: toAbsoluteMediaUrl(dto.cover_image),
    // `dto.url` is a legacy-site link; markers open our own detail route.
    href: routes.property(dto.id),
  };
}

export function mapEstateMap(response: EstateMapResponse) {
  return {
    ...response.result,
    markers: response.result.markers.map(mapEstateMapMarker),
  };
}
