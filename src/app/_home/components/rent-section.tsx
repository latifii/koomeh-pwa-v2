import Link from "next/link";

import { Section } from "@/components/layout/section";
import type { Estate } from "@/data/home";
import { cn } from "@/lib/utils";

import { PropertyCard } from "@/components/features/property/property-card";
import { SectionHeader } from "./section-header";
import { routes } from "@/lib/routes";

const filters = [
  { label: "آپارتمان", href: routes.properties({ deal: "rent", propertyTypes: "apartment" }) },
  { label: "خانه ویلایی", href: routes.properties({ deal: "rent", propertyTypes: "villa" }) },
  { label: "تجاری", href: routes.properties({ deal: "rent", propertyTypes: "commercial" }) },
  { label: "رهن کامل", href: routes.properties({ deal: "rent" }) },
  { label: "اجاره ماهانه", href: routes.properties({ deal: "rent" }) },
];

export function RentSection({ estates }: { estates: Estate[] }) {
  if (estates.length === 0) return null;

  return (
    <Section tone="muted">
      <SectionHeader
        eyebrow="برای یک شروع تازه"
        title="املاک رهن و اجاره"
        description="فایل‌های مناسب اجاره را بدون شلوغی مرور کنید."
        href={routes.properties({ deal: "rent" })}
        className="mb-6"
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((filter, i) => (
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

      <div className="-mx-page flex snap-x snap-mandatory gap-4 overflow-x-auto px-page pb-2 [scrollbar-width:none]">
        {estates.map((estate) => (
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
