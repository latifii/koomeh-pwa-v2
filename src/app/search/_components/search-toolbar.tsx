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
import { cn } from "@/lib/utils";

import { DealTypeToggle } from "./deal-type-toggle";

export function SearchToolbar({
  filters,
  onChange,
  activeCount,
  onOpenFilters,
  className,
}: {
  filters: SearchFilters;
  onChange: (patch: Partial<SearchFilters>) => void;
  activeCount: number;
  onOpenFilters: () => void;
  className?: string;
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
          className="hidden lg:flex"
        />

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

        <div className="flex items-center gap-2">
          <Select
            items={sortLabels}
            value={filters.sort}
            onValueChange={(value) => onChange({ sort: value as SortKey })}
          >
            <SelectTrigger className="flex-1 lg:w-40" aria-label="مرتب‌سازی">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(sortLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
