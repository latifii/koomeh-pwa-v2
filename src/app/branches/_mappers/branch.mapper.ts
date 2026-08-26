import { mapHomeEstate } from "@/app/_home/_mappers/home-estates.mapper";
import type {
  BranchAgentsResponse,
  BranchCardDto,
  BranchEstatesResponse,
  BranchProfileResponse,
  BranchesResponse,
} from "@/app/branches/_schemas/branch.schema";
import type {
  BranchCard,
  BranchGalleryImage,
  BranchProfile,
  BranchWorkingHour,
} from "@/app/branches/_types/branch.types";
import { toAbsoluteMediaUrl } from "@/lib/api/config";
import { routes } from "@/lib/routes";

function text(value: string | null | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

function numberValue(value: string | number | null | undefined): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function displayName(name: string): string {
  const normalized = name.trim();
  return normalized.startsWith("شعبه") ? normalized : `شعبه ${normalized}`;
}

function defaultDescription(branch: BranchCard): string {
  const location = branch.address ? ` در ${branch.address}` : "";
  return `${branch.name} گروه املاک کومه${location} آماده ارائه مشاوره حضوری برای خرید، فروش، رهن و اجاره ملک در قم است.`;
}

function splitParagraphs(value: string): string[] {
  return value
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function workingHourFromEntry(
  days: string,
  value: unknown,
): BranchWorkingHour | undefined {
  if (typeof value === "string" || typeof value === "number") {
    const hours = String(value).trim();
    return hours ? { days, hours, closed: /تعطیل|closed/i.test(hours) } : undefined;
  }

  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;
    const label =
      text(String(record.days ?? record.day ?? record.label ?? days)) ?? days;
    const hours =
      text(String(record.hours ?? record.hour ?? record.time ?? record.value ?? ""));
    if (!hours) return undefined;
    return {
      days: label,
      hours,
      closed:
        Boolean(record.closed) ||
        /تعطیل|closed/i.test(hours),
    };
  }

  return undefined;
}

function mapWorkingHours(value: unknown): BranchWorkingHour[] {
  if (Array.isArray(value)) {
    return value
      .map((item, index) => workingHourFromEntry(`بازه ${index + 1}`, item))
      .filter((item): item is BranchWorkingHour => Boolean(item));
  }

  if (typeof value === "object" && value !== null) {
    return Object.entries(value)
      .map(([days, item]) => workingHourFromEntry(days, item))
      .filter((item): item is BranchWorkingHour => Boolean(item));
  }

  const single = workingHourFromEntry("ساعات کاری", value);
  return single ? [single] : [];
}

function mapGalleryImage(
  image: BranchProfileResponse["result"]["images"][number],
): BranchGalleryImage | undefined {
  const url = toAbsoluteMediaUrl(image.large ?? image.url ?? null);
  return url
    ? {
        id: image.id,
        url,
        isCover: image.is_cover,
      }
    : undefined;
}

function isBranchProfileResponse(
  source: BranchProfileResponse | BranchCardDto,
): source is BranchProfileResponse {
  return "status" in source;
}

export function mapBranchCard(dto: BranchCardDto): BranchCard {
  const lat = numberValue(dto.latitude);
  const lng = numberValue(dto.longitude);

  return {
    id: String(dto.id),
    numericId: dto.id,
    name: displayName(dto.name),
    type: dto.type ?? undefined,
    typeLabel: text(dto.type_label),
    phone: text(dto.phone),
    address: text(dto.address),
    city: dto.city ?? undefined,
    district: dto.district ?? undefined,
    lat,
    lng,
    hasMap: lat !== undefined && lng !== undefined,
    coverImage: toAbsoluteMediaUrl(dto.cover_image ?? null),
    agentCount: dto.agent_count ?? undefined,
    experience: text(dto.experience),
    href: routes.branch(dto.id),
  };
}

export function mapBranchesPage(response: BranchesResponse) {
  return {
    ...response.result,
    items: response.result.items.map(mapBranchCard),
  };
}

export function mapBranchProfile(
  source: BranchProfileResponse | BranchCardDto,
  agentsResponse?: BranchAgentsResponse,
  estatesResponse?: BranchEstatesResponse,
): BranchProfile {
  const profileResult = isBranchProfileResponse(source) ? source.result : undefined;
  const branchDto = isBranchProfileResponse(source) ? source.result.branch : source;
  const branch = mapBranchCard(branchDto);
  const description = text(profileResult?.description) ?? defaultDescription(branch);
  const images =
    profileResult?.images
      .map(mapGalleryImage)
      .filter((item): item is BranchGalleryImage => Boolean(item)) ?? [];

  return {
    ...branch,
    hasMap: profileResult?.has_map ?? branch.hasMap,
    description,
    descriptionParagraphs: splitParagraphs(description),
    workingHours: mapWorkingHours(profileResult?.working_hours),
    coveredDistricts: profileResult?.covered_districts ?? [],
    images,
    telUrl: text(profileResult?.contact?.tel_url) ?? (branch.phone ? `tel:${branch.phone}` : undefined),
    agents: agentsResponse?.result.items ?? [],
    estates: estatesResponse?.result.items.map(mapHomeEstate) ?? [],
    estateTotal: estatesResponse?.result.total,
  };
}
