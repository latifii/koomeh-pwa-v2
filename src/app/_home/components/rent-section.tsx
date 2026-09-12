"use client";

import { useState } from "react";

import {
  RENT_QUICK_FILTERS,
  type RentQuickFilter,
} from "@/app/_home/_constants/rent-filters";
import type { HomeRentEstateSection } from "@/app/_home/_types/home-estates.types";
import type { Estate } from "@/data/home";
import { Section } from "@/components/layout/section";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

import { PropertyCard } from "@/components/features/property/property-card";
import { SectionHeader } from "./section-header";

/**
 * «املاک رهن و اجاره» with its chips doing what chips look like they do: each
 * one swaps the row of cards for that kind of file, in place. The cards for
 * every chip come down with the page, so a press is instant and nothing is
 * fetched from the browser.
 */
export function RentSection({
  section,
  variants,
}: {
  section: HomeRentEstateSection;
  /** The cards per chip, keyed by `RentQuickFilter.key`. */
  variants: Record<string, Estate[]>;
}) {
  const [active, setActive] = useState<RentQuickFilter>(RENT_QUICK_FILTERS[0]);
  const items = (variants[active.key] ?? []).filter(
    (estate) =>
      !active.propertyType || estate.propertyType === active.propertyType,
  );

  if (Object.values(variants).every((list) => list.length === 0)) return null;

  return (
    <Section tone="muted">
      <SectionHeader
        eyebrow={section.eyebrow}
        title={section.title}
        description={section.subtitle}
        href={active.href}
        className="mb-6"
      />

      <div
        role="tablist"
        aria-label="نوع ملک اجاره‌ای"
        className="mb-6 flex flex-wrap gap-2"
      >
        {RENT_QUICK_FILTERS.map((filter) => {
          const selected = filter.key === active.key;
          return (
            <button
              key={filter.key}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(filter)}
              className={cn(
                "rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-colors",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {items.length === 0 ? (
        <Typography
          variant="small"
          className="rounded-xl border border-dashed p-6 text-center"
        >
          فعلاً فایل تازه‌ای در «{active.label}» نداریم؛ چیپ دیگری را ببینید.
        </Typography>
      ) : (
        <div
          key={active.key}
          className="-mx-page flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden px-page pb-2 [scrollbar-width:none]"
        >
          {items.map((estate) => (
            <PropertyCard
              key={estate.id}
              estate={estate}
              className="w-[80%] shrink-0 snap-start sm:w-[45%] lg:w-[calc(25%-0.75rem)]"
            />
          ))}
        </div>
      )}
    </Section>
  );
}
