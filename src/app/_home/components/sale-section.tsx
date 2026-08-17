import { Home } from "lucide-react";

import { Section } from "@/components/layout/section";
import { Typography } from "@/components/ui/typography";
import type { HomeSaleEstateSection } from "@/app/_home/_types/home-estates.types";

import { PropertyCard } from "@/components/features/property/property-card";
import { SectionHeader } from "./section-header";

export function SaleSection({ section }: { section: HomeSaleEstateSection }) {
  return (
    <Section id="sale-estates" tone="muted">
      <SectionHeader
        eyebrow={section.eyebrow}
        title={section.title}
        description={section.subtitle}
        href={section.viewAllHref}
        className="mb-8"
      />

      {section.items.length > 0 ? (
        <div className="-mx-page flex snap-x snap-mandatory gap-4 overflow-x-auto px-page pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
          {section.items.map((estate) => (
            <PropertyCard
              key={estate.id}
              estate={estate}
              className="w-[80%] shrink-0 snap-start sm:w-auto"
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center">
          <Home className="size-8 text-muted-foreground" />
          <Typography as="h3" variant="h4">
            فایل جدیدی پیدا نشد
          </Typography>
          <Typography variant="muted">
            کمی بعد دوباره بررسی کنید یا درخواست خود را ثبت کنید.
          </Typography>
        </div>
      )}
    </Section>
  );
}
