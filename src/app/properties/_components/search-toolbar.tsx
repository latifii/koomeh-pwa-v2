"use client";

import { Search, SlidersHorizontal } from "lucide-react";

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
  SelectValue,
} from "@/components/ui/select";
import { type SearchFilters, type SortKey, sortLabels } from "@/data/search";
import type { EstateFilters } from "@/app/_lookups/_schemas/lookups.schema";
import { cn } from "@/lib/utils";

import { DealTypeToggle } from "./deal-type-toggle";

/** The free-text box, on its own so the map layout's sidebar can hold it. */
export function QueryInput({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <InputGroup className={className}>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="جستجو بر اساس عنوان یا محله…"
        aria-label="جستجوی آگهی"
      />
    </InputGroup>
  );
}

/** The sort dropdown, likewise. */
export function SortSelect({
  value,
  onChange,
  lookups,
  className,
}: {
  value: SortKey;
  onChange: (value: SortKey) => void;
  lookups?: EstateFilters;
  className?: string;
}) {
  const sortOptions = lookups?.sort_options.items ??
    Object.entries(sortLabels).map(([value, title]) => ({ value, title }));
  const sortItems = Object.fromEntries(
    sortOptions.map((item) => [item.value, item.title]),
  );

  return (
    <Select
      items={sortItems}
      value={value}
      onValueChange={(next) => onChange(next as SortKey)}
    >
      <SelectTrigger className={className} aria-label="مرتب‌سازی">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {sortOptions.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function SearchToolbar({
  filters,
  onChange,
  activeCount,
  onOpenFilters,
  className,
  lookups,
}: {
  filters: SearchFilters;
  onChange: (patch: Partial<SearchFilters>) => void;
  activeCount: number;
  onOpenFilters: () => void;
  className?: string;
  lookups?: EstateFilters;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border bg-card p-3 sm:p-4",
        className
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Below `lg` the deal toggle lives in the filters drawer instead */}
        <DealTypeToggle
          value={filters.deal}
          onChange={(deal) => onChange({ deal })}
          options={lookups?.deal_types.items}
          className="hidden lg:flex"
        />

        <QueryInput
          value={filters.query}
          onChange={(query) => onChange({ query })}
          className="flex-1"
        />

        <div className="flex items-center gap-2">
          <SortSelect
            value={filters.sort}
            onChange={(sort) => onChange({ sort })}
            lookups={lookups}
            className="flex-1 lg:w-40"
          />

          {/* Filters live in a drawer below `lg`, where the sidebar is hidden */}
          <Button
            variant="outline"
            className="relative shrink-0 lg:hidden"
            onClick={onOpenFilters}
          >
            <SlidersHorizontal />
            فیلترها
            {activeCount > 0 && (
              <Badge className="ms-1 size-5 justify-center rounded-full p-0 text-[10px]">
                {activeCount.toLocaleString("fa-IR")}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
