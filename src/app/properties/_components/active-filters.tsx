"use client";

import { RotateCcw, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { EstateFilters } from "@/app/_lookups/_schemas/lookups.schema";
import { propertyTypeLabels } from "@/data/home";
import {
  type SearchFilters,
  buildingAgeOptions,
  formatToman,
} from "@/data/search";
import { cn } from "@/lib/utils";

type Chip = { key: string; label: string; clear: Partial<SearchFilters> };

/** Turns the filter object into removable chips, so nothing is silently applied. */
function buildChips(filters: SearchFilters, lookups?: EstateFilters): Chip[] {
  const chips: Chip[] = [];

  if (filters.query.trim()) {
    chips.push({
      key: "query",
      label: `«${filters.query.trim()}»`,
      clear: { query: "" },
    });
  }

  for (const type of filters.types) {
    chips.push({
      key: `type-${type}`,
      label:
        lookups?.estate_types.items.find((item) => item.value === type)?.title ??
        propertyTypeLabels[type as keyof typeof propertyTypeLabels] ??
        type,
      clear: { types: filters.types.filter((item) => item !== type) },
    });
  }

  if (filters.code.trim()) {
    chips.push({
      key: "code",
      label: `کد ${filters.code.trim()}`,
      clear: { code: "" },
    });
  }

  for (const districtId of filters.districtIds) {
    chips.push({
      key: `district-${districtId}`,
      label:
        lookups?.districts.items.find((item) => item.value === districtId)
          ?.title ?? districtId,
      clear: {
        districtIds: filters.districtIds.filter((item) => item !== districtId),
      },
    });
  }

  for (const area of filters.areas) {
    chips.push({
      key: `city-area-${area}`,
      label:
        lookups?.areas.items.find((item) => item.value === area)?.title ??
        `منطقه ${area}`,
      clear: { areas: filters.areas.filter((item) => item !== area) },
    });
  }

  if (filters.minPrice || filters.maxPrice) {
    chips.push({
      key: "price",
      label: rangeLabel(
        filters.minPrice,
        filters.maxPrice,
        (value) => formatToman(Number(value)),
        filters.deal === "rent" ? "ودیعه" : "قیمت"
      ),
      clear: { minPrice: "", maxPrice: "" },
    });
  }

  if (filters.minRent || filters.maxRent) {
    chips.push({
      key: "rent",
      label: rangeLabel(
        filters.minRent,
        filters.maxRent,
        (value) => formatToman(Number(value)),
        "اجاره",
      ),
      clear: { minRent: "", maxRent: "" },
    });
  }

  if (filters.minArea || filters.maxArea) {
    chips.push({
      key: "area-range",
      label: rangeLabel(
        filters.minArea,
        filters.maxArea,
        (value) => `${Number(value).toLocaleString("fa-IR")} متر`,
        "متراژ"
      ),
      clear: { minArea: "", maxArea: "" },
    });
  }

  if (filters.buildingAge) {
    const option = buildingAgeOptions.find(
      (item) => item.value === filters.buildingAge
    );
    chips.push({
      key: "age",
      label: option?.label ?? "سن بنا",
      clear: { buildingAge: "" },
    });
  }

  if (filters.minRooms) {
    chips.push({
      key: "rooms",
      label:
        lookups?.room_counts.items.find(
          (item) => item.value === filters.minRooms,
        )?.title ?? `${Number(filters.minRooms).toLocaleString("fa-IR")} خواب به بالا`,
      clear: { minRooms: "" },
    });
  }

  if (filters.hasPhotos) {
    chips.push({
      key: "photos",
      label: "دارای عکس",
      clear: { hasPhotos: false },
    });
  }

  if (filters.hasVideo) {
    chips.push({ key: "video", label: "دارای ویدیو", clear: { hasVideo: false } });
  }

  if (filters.hasVirtualTour) {
    chips.push({
      key: "virtual-tour",
      label: "دارای تور مجازی",
      clear: { hasVirtualTour: false },
    });
  }

  if (filters.hasAgent) {
    chips.push({
      key: "agent",
      label: "دارای مشاور",
      clear: { hasAgent: false },
    });
  }

  return chips;
}

function rangeLabel(
  min: string,
  max: string,
  format: (value: string) => string,
  prefix: string
): string {
  if (min && max) return `${prefix}: ${format(min)} تا ${format(max)}`;
  if (min) return `${prefix} از ${format(min)}`;
  return `${prefix} تا ${format(max)}`;
}

export function ActiveFilters({
  filters,
  onChange,
  onReset,
  /**
   * `wrap` stacks chips over several lines (results column); `scroll` keeps them
   * on one swipeable line, for the map's fixed top bar.
   */
  layout = "wrap",
  className,
  lookups,
}: {
  filters: SearchFilters;
  onChange: (patch: Partial<SearchFilters>) => void;
  onReset: () => void;
  layout?: "wrap" | "scroll";
  className?: string;
  lookups?: EstateFilters;
}) {
  const chips = buildChips(filters, lookups);
  if (chips.length === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        layout === "wrap"
          ? "flex-wrap"
          : "overflow-x-auto [scrollbar-width:none]",
        className
      )}
    >
      {chips.map((chip) => (
        <Badge
          key={chip.key}
          variant="outline"
          className="h-7 shrink-0 cursor-pointer gap-1 border-brand/30 bg-brand/5 pe-1.5 ps-2.5 text-brand transition-colors hover:border-brand/60 hover:bg-brand/10"
          render={
            <button type="button" onClick={() => onChange(chip.clear)} />
          }
        >
          {chip.label}
          <X className="opacity-60 transition-opacity hover:opacity-100" />
        </Badge>
      ))}

      <Button
        variant="ghost"
        size="xs"
        onClick={onReset}
        className="shrink-0 text-muted-foreground hover:text-destructive"
      >
        <RotateCcw />
        حذف همه فیلترها
      </Button>
    </div>
  );
}
