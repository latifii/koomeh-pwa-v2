import type {
  PanelEstateDto,
  PanelEstatesResponse,
  RowPermissions,
} from "@/app/panel/properties/_schemas/panel-estates.schema";
import { toAbsoluteMediaUrl } from "@/lib/api/config";
import { routes } from "@/lib/routes";

const moneyFormatter = new Intl.NumberFormat("fa-IR", {
  maximumFractionDigits: 0,
});

export type PanelEstateRow = {
  id: string;
  numericId: number;
  title: string;
  dealTypeLabel: string;
  estateTypeLabel: string;
  area?: number;
  priceLabel: string;
  perMeterLabel?: string;
  confirmation: string;
  confirmationLabel: string;
  isVisible: boolean;
  locationLabel?: string;
  ownerName?: string;
  ownerPhone?: string;
  expertName?: string;
  coverImage?: string;
  imageCount: number;
  hasVirtualTour: boolean;
  createdAt?: string;
  fromDivar: boolean;
  permissions: RowPermissions;
  href: string;
};

function text(value: string | null | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

function money(value: number | null | undefined): string | undefined {
  return value ? `${moneyFormatter.format(value)} تومان` : undefined;
}

/** Rent files price as deposit plus monthly; sale files as one figure. */
function priceLabel(dto: PanelEstateDto): string {
  if (dto.deal_type === 2) {
    const deposit = money(dto.mortgage) ?? "توافقی";
    const rent = money(dto.rent) ?? "توافقی";
    return `${deposit} / ${rent}`;
  }
  return money(dto.price) ?? "توافقی";
}

export function mapPanelEstate(dto: PanelEstateDto): PanelEstateRow {
  return {
    id: String(dto.id),
    numericId: dto.id,
    title: text(dto.title) ?? `${dto.estate_type_label} بدون عنوان`,
    dealTypeLabel: dto.deal_type_label,
    estateTypeLabel: dto.estate_type_label,
    area: dto.area ?? undefined,
    priceLabel: priceLabel(dto),
    perMeterLabel: money(dto.price_per_meter),
    confirmation: dto.confirmation,
    confirmationLabel: dto.confirmation_label,
    isVisible: dto.visibility === 1,
    locationLabel: text(dto.location?.address_label),
    ownerName: text(dto.owner?.name),
    ownerPhone: text(dto.owner?.phone),
    expertName: text(dto.expert?.name),
    coverImage: toAbsoluteMediaUrl(dto.media?.cover_image ?? null),
    imageCount: dto.media?.image_count ?? 0,
    hasVirtualTour: dto.media?.has_virtual_tour ?? false,
    createdAt: text(dto.dates?.created_at),
    fromDivar: dto.dates?.from_divar ?? false,
    permissions: dto.permissions,
    href: routes.property(dto.id),
  };
}

export function mapPanelEstatesPage(response: PanelEstatesResponse) {
  return {
    ...response.result,
    items: response.result.items.map(mapPanelEstate),
  };
}
