import {
  mapHomeEstate,
  propertyTypeFrom,
} from "@/app/_home/_mappers/home-estates.mapper";
import type {
  EstateAgentDetailDto,
  EstateAgentResponse,
  EstateContactResponse,
  EstateDetailDto,
  EstateDetailResponse,
  EstateGalleryImageDto,
  EstateGalleryResponse,
  EstateLocationDto,
  EstateLocationResponse,
  EstateSimilarResponse,
  EstateVirtualTourResponse,
} from "@/app/properties/_schemas/estate-detail.schema";
import type {
  EstateAgentView,
  EstateContactEntry,
  EstateDetailView,
  EstateFeature,
  EstateFeatureGroup,
  EstateGalleryView,
  EstateLocationView,
  EstatePhoto,
  EstateSimilarView,
  EstateTourView,
} from "@/app/properties/_types/estate-detail.types";
import { toAbsoluteMediaUrl, toAbsoluteSiteUrl } from "@/lib/api/config";
import { routes } from "@/lib/routes";

function text(value: string | null | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

function coordinate(
  value: string | number | null | undefined,
): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Unset numeric fields come back as a literal "0" row (متراژ بر، مساحت بنا…).
 * They carry no information, so they never reach the specs table.
 */
function isMeaningfulFact(value: string): boolean {
  const normalized = value.trim();
  return Boolean(normalized) && !/^[۰0]+(\s|$)/.test(normalized);
}

/**
 * 360° files come back double-prefixed — the service prepends
 * `/upload/images/estate/` to a value that already carries it, and the result
 * 404s. Collapse the repeat until the upstream path is fixed.
 */
const DUPLICATED_UPLOAD_PATH = /\/upload\/images\/estate\/+(?=upload\/images\/estate\/)/g;

function mediaUrl(value: string | null | undefined): string | undefined {
  return toAbsoluteMediaUrl(value ?? null)?.replace(
    DUPLICATED_UPLOAD_PATH,
    "/",
  );
}

function mapPhoto(dto: EstateGalleryImageDto): EstatePhoto | undefined {
  const url = mediaUrl(dto.large ?? dto.url);
  if (!url) return undefined;

  return {
    id: dto.id,
    url,
    thumbnail: mediaUrl(dto.thumbnail),
    large: mediaUrl(dto.large),
    isCover: dto.is_cover,
  };
}

function mapPhotos(images: EstateGalleryImageDto[]): EstatePhoto[] {
  return images
    .map(mapPhoto)
    .filter((photo): photo is EstatePhoto => Boolean(photo));
}

function mapFeature(item: {
  id: number;
  label: string;
  icon?: string | null;
}): EstateFeature {
  return { id: item.id, label: item.label, icon: text(item.icon) };
}

export function mapEstateLocation(dto: EstateLocationDto): EstateLocationView {
  const lat = coordinate(dto.latitude);
  const lng = coordinate(dto.longitude);

  return {
    cityName: text(dto.city?.name),
    districtName: text(dto.district?.name),
    districtId: dto.district?.id,
    street: text(dto.street),
    addressLabel: text(dto.address_label),
    isFullAddress: dto.is_full_address,
    hasMap: dto.has_map && lat !== undefined && lng !== undefined,
    lat,
    lng,
  };
}

export function mapEstateAgent(dto: EstateAgentDetailDto): EstateAgentView {
  return {
    id: dto.id,
    name: dto.name.trim(),
    code: text(dto.code),
    title: text(dto.title),
    bio: text(dto.bio),
    photo: mediaUrl(dto.photo),
    activityLabel: text(dto.activity_label),
    roles: dto.roles,
    canChat: dto.can_chat,
    href: dto.url ? routes.agent(dto.id) : undefined,
  };
}

export function mapEstateAgentResponse(
  response: EstateAgentResponse,
): EstateAgentView | undefined {
  return response.result.agent ? mapEstateAgent(response.result.agent) : undefined;
}

export function mapEstateLocationResponse(
  response: EstateLocationResponse,
): EstateLocationView {
  return mapEstateLocation(response.result);
}

export function mapEstateGallery(
  response: EstateGalleryResponse,
): EstateGalleryView {
  const result = response.result;

  return {
    coverImage: mediaUrl(result.cover_image),
    photos: mapPhotos(result.photos),
    plans: mapPhotos(result.plans),
    tour: mapPhotos(result.tour),
  };
}

export function mapEstateVirtualTour(
  response: EstateVirtualTourResponse,
): EstateTourView {
  const result = response.result;
  const images = mapPhotos(result.images).map((photo) => ({
    id: photo.id,
    url: photo.url,
  }));

  return {
    estateId: String(result.estate_id),
    title: result.title,
    externalTourUrl: toAbsoluteSiteUrl(result.external_tour_url ?? null),
    imageCount: result.image_count || images.length,
    images,
  };
}

export function mapEstateContacts(
  response: EstateContactResponse,
): EstateContactEntry[] {
  return response.result.contacts.map((contact) => ({
    role: contact.role,
    roleLabel: contact.role_label,
    name: text(contact.name),
    phone: contact.phone,
    telUrl: text(contact.tel_url) ?? `tel:${contact.phone}`,
  }));
}

export function mapSimilarEstates(
  response: EstateSimilarResponse,
): EstateSimilarView {
  return {
    title: response.result.title,
    total: response.result.total,
    items: response.result.items.map(mapHomeEstate),
  };
}

function mapFeatureGroups(
  features: EstateDetailDto["features"],
): EstateFeatureGroup[] {
  return Object.entries(features)
    .map(([key, group]) => ({
      key,
      label: group.label,
      items: group.items.map(mapFeature),
    }))
    .filter((group) => group.items.length > 0);
}

function mapLinks(links: EstateDetailDto["links"]): Record<string, string> {
  const entries = Object.entries(links).flatMap(([key, value]) => {
    const href = toAbsoluteSiteUrl(value ?? null);
    return href ? [[key, href] as const] : [];
  });

  return Object.fromEntries(entries);
}

export function mapEstateDetail(response: EstateDetailResponse): EstateDetailView {
  const result = response.result;
  const media = result.media;
  const exchange = result.exchange;

  return {
    id: String(result.id),
    numericId: result.id,
    title: result.title.trim(),
    dealType: result.deal_type === 2 ? "rent" : "sale",
    dealTypeLabel: result.deal_type_label,
    propertyType: propertyTypeFrom(result.estate_type_label, result.estate_type),
    estateTypeLabel: result.estate_type_label,
    area: result.area ?? undefined,
    roomLabel: text(result.room_label),
    status: {
      confirmation: result.status.confirmation,
      confirmationLabel: result.status.confirmation_label,
      isVerified: result.status.is_verified,
      isExpired: result.status.is_expired,
      stamp: text(result.status.stamp),
    },
    price: result.price
      ? {
          label: result.price.label,
          perMeterLabel: text(result.price.per_meter_label),
          isNegotiable: result.price.is_negotiable,
        }
      : undefined,
    rent: result.rent
      ? {
          mortgageLabel: result.rent.mortgage_label,
          rentLabel: result.rent.rent_label,
        }
      : undefined,
    location: mapEstateLocation(result.location),
    facts: result.details.filter((row) => isMeaningfulFact(row.value)),
    featureGroups: mapFeatureGroups(result.features),
    conditions: result.conditions.map(mapFeature),
    description: text(result.description),
    exchange: exchange?.available
      ? { available: true, description: text(exchange.description) }
      : undefined,
    media: {
      coverImage: mediaUrl(media.cover_image),
      photoCount: media.photo_count,
      planCount: media.plan_count,
      tourImageCount: media.tour_image_count,
      hasVirtualTour: media.has_virtual_tour,
      hasVideo: media.has_video,
      video: media.video?.embed_url
        ? {
            provider: text(media.video.provider),
            embedUrl: media.video.embed_url,
          }
        : undefined,
    },
    agent: result.agent ? mapEstateAgent(result.agent) : undefined,
    contact: result.contact
      ? {
          type: result.contact.type,
          name: text(result.contact.name),
          hasPhone: result.contact.has_phone,
        }
      : undefined,
    visitCount: result.stats?.visit_count,
    publishedLabel: text(result.dates?.created_at_jalali),
    updatedDaysAgo: result.dates?.updated_days_ago ?? undefined,
    isSpecial: result.flags?.is_special ?? false,
    links: mapLinks(result.links),
  };
}
