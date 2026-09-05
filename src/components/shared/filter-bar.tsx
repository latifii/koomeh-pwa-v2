"use client";

import { useState, type ReactNode } from "react";
import {
  ChevronDown,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export type FilterChip = {
  key: string;
  label: string;
  onRemove: () => void;
};

/**
 * The filter box, once, for every list in the panel.
 *
 * Ten pages had grown their own — same card, same grid, same count line, same
 * «پاک کردن فیلترها» — and they had drifted: some had a search row and some
 * did not, the padding differed, the count read «۸۲٬۹۹۸ رکورد» here and
 * «۴۵ شعبه» there, and the controls sat in whatever column count that page's
 * author had reached for.
 *
 * Three things this adds that none of them had:
 *
 * - **A heading.** A card with six dropdowns in it and no title is a puzzle
 *   until you read all six.
 * - **What is actually applied**, as chips along the bottom. Reading the
 *   current state used to mean looking at every control in turn, and a filter
 *   scrolled out of view on a phone was invisible entirely.
 * - **Room on a phone.** Six controls push the results a screen and a half
 *   down; collapsed, the count and the chips stay and the results are where
 *   they should be. It is always open from `sm` up.
 */
export function PanelFilterBar({
  icon: Icon,
  title = "فیلترها",
  count,
  unit,
  pending = false,
  note,
  search,
  columns = 3,
  chips = [],
  isFiltered = chips.length > 0,
  onClear,
  actions,
  children,
}: {
  /** Beside the count — the same icon the page's empty state uses. */
  icon?: LucideIcon;
  title?: string;
  count?: number | null;
  /** «آگهی», «شعبه», «نتیجه» — whatever this list counts. */
  unit: string;
  pending?: boolean;
  /** An aside about the count, e.g. that the list is narrowed to the caller. */
  note?: string;
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
  };
  columns?: 2 | 3 | 4;
  chips?: FilterChip[];
  /** Whether anything is applied — chips do not cover a free-text search. */
  isFiltered?: boolean;
  onClear: () => void;
  /** A control that belongs to the list rather than to the filtering — the
      listings page's map/table switch, for one. */
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const countText = pending
    ? "در حال شمردن…"
    : count === null || count === undefined
      ? `${unit}‌ها`
      : `${count.toLocaleString("fa-IR")} ${unit}`;

  return (
    <section data-slot="filter-bar" className="rounded-xl border bg-card">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <Typography
          as="h2"
          variant="small"
          className="flex items-center gap-1.5 font-medium text-foreground"
        >
          <SlidersHorizontal className="size-4 text-brand" />
          {title}
          {chips.length > 0 && (
            <Badge className="h-5 min-w-5 justify-center px-1 tabular-nums">
              {chips.length.toLocaleString("fa-IR")}
            </Badge>
          )}
        </Typography>

        <span className="flex min-w-0 items-center gap-1">
          <Typography
            variant="small"
            className="flex min-w-0 items-center gap-1.5 truncate"
          >
            {Icon && <Icon className="size-3.5 shrink-0 text-brand/70" />}
            <span className="truncate tabular-nums">
              {countText}
              {note && ` · ${note}`}
            </span>
          </Typography>

          {actions}

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-expanded={open}
            aria-label={open ? "بستن فیلترها" : "باز کردن فیلترها"}
            onClick={() => setOpen((current) => !current)}
            className="sm:hidden"
          >
            <ChevronDown
              className={cn("size-4 transition-transform", open && "rotate-180")}
            />
          </Button>
        </span>
      </div>

      <div
        className={cn(
          "grid grid-cols-1 gap-2 p-3",
          columns === 2 && "sm:grid-cols-2",
          columns === 3 && "sm:grid-cols-2 lg:grid-cols-3",
          columns === 4 && "sm:grid-cols-2 lg:grid-cols-4",
          !open && "hidden sm:grid",
        )}
      >
        {search && (
          <div className="relative sm:col-span-full">
            <Search className="pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search.value}
              onChange={(event) => search.onChange(event.target.value)}
              placeholder={search.placeholder}
              aria-label={search.placeholder}
              className="ps-9"
            />
          </div>
        )}
        {children}
      </div>

      {isFiltered && (
        <div className="flex flex-wrap items-center gap-1.5 border-t px-3 py-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onRemove}
              aria-label={`برداشتن فیلتر ${chip.label}`}
              className="inline-flex max-w-full items-center gap-1 rounded-full border bg-muted/60 py-0.5 pe-1.5 ps-2.5 text-xs text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
            >
              <span className="truncate">{chip.label}</span>
              <X className="size-3 shrink-0" />
            </button>
          ))}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="ms-auto text-destructive"
          >
            <RotateCcw />
            پاک کردن همه
          </Button>
        </div>
      )}
    </section>
  );
}

type ChipSpec = {
  /** «کارشناس», «از تاریخ» — what the chip says before the value. */
  label: string;
  /** Turns a stored id back into the name the person picked. */
  options?: { value: string; title: string }[];
  /** For values that are not ids — a Jalali day, say. */
  format?: (value: string) => string;
};

/**
 * The applied filters, as chips.
 *
 * A filter's stored value is an id, and an id is not what anybody chose — the
 * chip has to say «کارشناس: محمدرضا شیر محمدی», not «کارشناس: ۴۲۰۳». Keys with
 * no spec are left out on purpose: a search box says what it holds by holding
 * it, and a chip repeating it would be noise.
 */
export function filterChips<T extends Record<string, string>>(
  filters: T,
  defaults: T,
  specs: Partial<Record<keyof T & string, ChipSpec>>,
  onChange: (key: keyof T & string, value: string) => void,
): FilterChip[] {
  const chips: FilterChip[] = [];

  for (const [key, spec] of Object.entries(specs) as [
    keyof T & string,
    ChipSpec,
  ][]) {
    const value = filters[key];
    if (!value || value === defaults[key]) continue;

    const shown =
      spec.options?.find((option) => option.value === value)?.title ??
      spec.format?.(value) ??
      value;

    chips.push({
      key,
      label: `${spec.label}: ${shown}`,
      onRemove: () => onChange(key, defaults[key]),
    });
  }

  return chips;
}
