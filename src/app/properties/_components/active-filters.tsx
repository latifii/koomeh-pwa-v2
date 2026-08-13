"use client";

import { RotateCcw, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { propertyTypeLabels } from "@/data/home";
import {
  type SearchFilters,
  amenityLabels,
  buildingAgeOptions,
  formatToman,
  orientationLabels,
} from "@/data/search";
import { cn } from "@/lib/utils";

type Chip = { key: string; label: string; clear: Partial<SearchFilters> };

/** Turns the filter object into removable chips, so nothing is silently applied. */
function buildChips(filters: SearchFilters): Chip[] {
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
      label: propertyTypeLabels[type],
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

  if (filters.district) {
    chips.push({
      key: "district",
      label: filters.district,
      clear: { district: "" },
    });
  }

  if (filters.minPrice || filters.maxPrice) {
    chips.push({
      key: "price",
      label: rangeLabel(
        filters.minPrice,
        filters.maxPrice,
        (value) => formatToman(Number(value)),
        "قیمت"
      ),
      clear: { minPrice: "", maxPrice: "" },
    });
  }

  if (filters.minArea || filters.maxArea) {
    chips.push({
      key: "area",
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

  if (filters.minFloor || filters.maxFloor) {
    chips.push({
      key: "floor",
      label: rangeLabel(
        filters.minFloor,
        filters.maxFloor,
        (value) => Number(value).toLocaleString("fa-IR"),
        "طبقه"
      ),
      clear: { minFloor: "", maxFloor: "" },
    });
  }

  if (filters.maxUnitsPerFloor) {
    chips.push({
      key: "units",
      label: `حداکثر ${Number(filters.maxUnitsPerFloor).toLocaleString("fa-IR")} واحد در طبقه`,
      clear: { maxUnitsPerFloor: "" },
    });
  }

  if (filters.minRooms) {
    chips.push({
      key: "rooms",
      label: `${Number(filters.minRooms).toLocaleString("fa-IR")} خواب به بالا`,
      clear: { minRooms: "" },
    });
  }

  if (filters.orientation) {
    chips.push({
      key: "orientation",
      label:
        orientationLabels[
          filters.orientation as keyof typeof orientationLabels
        ] ?? filters.orientation,
      clear: { orientation: "" },
    });
  }

  for (const amenity of filters.amenities) {
    chips.push({
      key: `amenity-${amenity}`,
      label: amenityLabels[amenity],
      clear: {
        amenities: filters.amenities.filter((item) => item !== amenity),
      },
    });
  }

  if (filters.hasPhotos) {
    chips.push({
      key: "photos",
      label: "دارای عکس",
      clear: { hasPhotos: false },
    });
  }

  if (filters.isUrgent) {
    chips.push({ key: "urgent", label: "فوری", clear: { isUrgent: false } });
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
}: {
  filters: SearchFilters;
  onChange: (patch: Partial<SearchFilters>) => void;
  onReset: () => void;
  layout?: "wrap" | "scroll";
  className?: string;
}) {
  const chips = buildChips(filters);
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
