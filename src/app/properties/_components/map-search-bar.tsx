"use client";

import { ArrowDownUp, Search, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { type SearchFilters, type SortKey, sortLabels } from "@/data/search";
import type { EstateFilters } from "@/app/_lookups/_schemas/lookups.schema";

import { ActiveFilters } from "./active-filters";

/**
 * The phone-sized map header: the search field with the filter and sort
 * buttons beside it, and under them — only when there are any — the filters
 * already on, in one swipeable row. It stays pinned above the map while the
 * results sheet moves underneath it.
 */
export function MapSearchBar({
  filters,
  onChange,
  activeCount,
  onOpenFilters,
  onReset,
  lookups,
}: {
  filters: SearchFilters;
  onChange: (patch: Partial<SearchFilters>) => void;
  activeCount: number;
  onOpenFilters: () => void;
  onReset: () => void;
  lookups?: EstateFilters;
}) {
  const sortOptions = lookups?.sort_options.items ??
    Object.entries(sortLabels).map(([value, title]) => ({ value, title }));
  const sortItems = Object.fromEntries(
    sortOptions.map((item) => [item.value, item.title]),
  );

  return (
    <div className="flex flex-col gap-2 border-b bg-card/95 p-3 shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-2">
        <InputGroup className="flex-1">
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
          <InputGroupInput
            type="search"
            value={filters.query}
            onChange={(event) => onChange({ query: event.target.value })}
            placeholder="جستجو بر اساس عنوان یا محله…"
            aria-label="جستجوی آگهی"
          />
        </InputGroup>

        <Button
          variant="outline"
          size="icon-sm"
          onClick={onOpenFilters}
          aria-label={
            activeCount > 0
              ? `فیلترهای پیشرفته، ${activeCount.toLocaleString("fa-IR")} فعال`
              : "فیلترهای پیشرفته"
          }
          className="relative shrink-0"
        >
          <SlidersHorizontal className="size-4" />
          {activeCount > 0 && (
            <Badge className="absolute -top-1.5 -end-1.5 size-4 justify-center rounded-full p-0 text-[10px]">
              {activeCount.toLocaleString("fa-IR")}
            </Badge>
          )}
        </Button>

        {/* Icon-only: the trigger's own text is dropped so just the sort
            glyph shows, matching the surrounding icon buttons. */}
        <Select
          items={sortItems}
          value={filters.sort}
          onValueChange={(value) => onChange({ sort: value as SortKey })}
        >
          <SelectTrigger
            aria-label="مرتب‌سازی"
            // The trigger always appends its own chevron after `children` as a
            // second bare svg, so it — not our icon — is the one hidden here.
            className="size-8 shrink-0 justify-center p-0 [&>svg:last-child]:hidden"
          >
            <ArrowDownUp className="size-4 text-muted-foreground" />
          </SelectTrigger>
          <SelectContent align="end">
            {sortOptions.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {activeCount > 0 && (
        <ActiveFilters
          filters={filters}
          onChange={onChange}
          onReset={onReset}
          layout="scroll"
          className="min-w-0"
          lookups={lookups}
        />
      )}
    </div>
  );
}
