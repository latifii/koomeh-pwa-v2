import type {
  CustomerDto,
  CustomersResponse,
} from "@/app/panel/requests/_schemas/customers.schema";

const moneyFormatter = new Intl.NumberFormat("fa-IR", {
  maximumFractionDigits: 0,
});

export type CustomerRow = {
  id: string;
  numericId: number;
  name: string;
  mobile?: string;
  requestTypeLabel?: string;
  estateTypeLabel?: string;
  statusLabel?: string;
  budgetLabel?: string;
  areaLabel?: string;
  districts: string[];
  agentName?: string;
  noteCount: number;
  sentEstates: number;
  isStale: boolean;
  isFavorite: boolean;
  updatedAt?: string;
  canViewMobile: boolean;
};

function text(value: string | null | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

/** "از ۹ تا ۱۳ میلیارد" — either bound may be missing, so all four cases matter. */
function range(
  min: number | null | undefined,
  max: number | null | undefined,
  unit: string,
): string | undefined {
  const from = min ? moneyFormatter.format(min) : undefined;
  const to = max ? moneyFormatter.format(max) : undefined;

  if (from && to) return `${from} تا ${to} ${unit}`;
  if (from) return `از ${from} ${unit}`;
  if (to) return `تا ${to} ${unit}`;
  return undefined;
}

export function mapCustomer(dto: CustomerDto): CustomerRow {
  const budget = dto.budget;
  const isRent = dto.request_type === 2;

  return {
    id: String(dto.id),
    numericId: dto.id,
    name: text(dto.name) ?? `تقاضای ${dto.id.toLocaleString("fa-IR")}`,
    mobile: text(dto.mobile),
    requestTypeLabel: text(dto.request_type_label),
    estateTypeLabel: text(dto.estate_type_label),
    statusLabel: text(dto.status_label),
    budgetLabel: isRent
      ? (range(budget?.mortgage_min, budget?.mortgage_max, "تومان ودیعه") ??
        range(budget?.rent_min, budget?.rent_max, "تومان اجاره"))
      : range(budget?.price_min, budget?.price_max, "تومان"),
    areaLabel: range(budget?.area_min, budget?.area_max, "متر"),
    districts: dto.districts.map((district) => district.name),
    agentName: text(dto.agent?.name),
    noteCount: dto.note_count,
    sentEstates: dto.sent_estates,
    isStale: dto.is_stale,
    isFavorite: dto.is_favorite,
    updatedAt: text(dto.dates?.updated_at),
    canViewMobile: dto.permissions.can_view_mobile,
  };
}

export function mapCustomersPage(response: CustomersResponse) {
  return {
    ...response.result,
    items: response.result.items.map(mapCustomer),
  };
}
