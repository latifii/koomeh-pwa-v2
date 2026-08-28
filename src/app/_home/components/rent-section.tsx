import Link from "next/link";

import type { HomeRentEstateSection } from "@/app/_home/_types/home-estates.types";
import { Section } from "@/components/layout/section";
import { cn } from "@/lib/utils";

import { PropertyCard } from "@/components/features/property/property-card";
import { SectionHeader } from "./section-header";

export function RentSection({ section }: { section: HomeRentEstateSection }) {
  if (section.items.length === 0) return null;

  return (
    <Section tone="muted">
      <SectionHeader
        eyebrow={section.eyebrow}
        title={section.title}
        description={section.subtitle}
        href={section.viewAllHref}
        className="mb-6"
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {section.quickFilters.map((filter, i) => (
          <Link
            key={filter.label + i}
            href={filter.href}
            className={cn(
              "rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-colors",
              i === 0
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-background text-muted-foreground hover:text-foreground"
            )}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      <div className="-mx-page flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden px-page pb-2 [scrollbar-width:none]">
        {section.items.map((estate) => (
          <PropertyCard
            key={estate.id}
            estate={estate}
            className="w-[80%] shrink-0 snap-start sm:w-[45%] lg:w-[calc(25%-0.75rem)]"
          />
        ))}
      </div>
    </Section>
  );
}
