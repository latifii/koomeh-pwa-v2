import type {
  EstateMapMarkerDto,
  EstateMapPointsResponse,
  EstateMapResponse,
} from "@/app/properties/_schemas/estate-map.schema";
import { toAbsoluteMediaUrl } from "@/lib/api/config";
import { routes, slugFromApiUrl } from "@/lib/routes";

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
    href: routes.property(dto.id, slugFromApiUrl(dto.url)),
  };
}

/** On the globe at all — one longitude of −669 fitted the map to the world. */
function onGlobe(dto: { latitude: number; longitude: number }): boolean {
  return Math.abs(dto.latitude) <= 90 && Math.abs(dto.longitude) <= 180;
}

/** A point on the search map: where it is and what its pin says. */
export type EstateMapPoint = {
  id: string;
  lat: number;
  lng: number;
  pinLabel: string;
};

export function mapEstateMapPoints(response: EstateMapPointsResponse) {
  const { points, markers, ...rest } = response.result;

  if (points) {
    return {
      ...rest,
      points: points
        .filter(([, latitude, longitude]) => onGlobe({ latitude, longitude }))
        .map(
          ([id, lat, lng, pinLabel]): EstateMapPoint => ({
            id: String(id),
            lat,
            lng,
            pinLabel,
          }),
        ),
      legacyMarkers: undefined,
    };
  }

  // The old answer: full markers. Points are cut from them, and the markers
  // themselves are handed back so the popups need not ask again.
  const legacyMarkers = (markers ?? []).filter(onGlobe).map(mapEstateMapMarker);
  return {
    ...rest,
    points: legacyMarkers.map(
      (marker): EstateMapPoint => ({
        id: marker.id,
        lat: marker.lat,
        lng: marker.lng,
        pinLabel: marker.pinLabel,
      }),
    ),
    legacyMarkers,
  };
}

export function mapEstateMap(response: EstateMapResponse) {
  return {
    ...response.result,
    markers: response.result.markers.filter(onGlobe).map(mapEstateMapMarker),
  };
}
