import Link from "next/link";
import { Building2, MapPin, Phone } from "lucide-react";

import { Section } from "@/components/layout/section";
import businessImage from "@/assets/images/card/business.webp";
import { ApiImage } from "@/components/shared/api-image";
import type { HomeBranchesSection } from "@/app/_home/_types/home-content.types";
import { routes } from "@/lib/routes";

import { CoverPlaceholder } from "./cover-placeholder";
import { SectionHeader } from "./section-header";

export function BranchesSection({ section }: { section: HomeBranchesSection }) {
  if (section.items.length === 0) return null;

  return (
    <Section id="branches">
      <SectionHeader
        eyebrow={section.eyebrow}
        title={section.title}
        description={section.subtitle}
        href={section.viewAllHref}
        className="mb-8"
      />

      {/* Mobile: horizontal snap carousel; grid from `sm` up */}
      <div className="-mx-page flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-hidden px-page pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
        {section.items.map((branch) => (
          <div
            key={branch.id}
            className="group relative w-[70%] shrink-0 snap-start overflow-hidden rounded-2xl border bg-card transition-colors hover:border-brand/30 sm:w-auto"
          >
            {branch.coverImage ? (
              <span className="relative block aspect-4/3 w-full overflow-hidden">
                <ApiImage
                  src={branch.coverImage}
                  fallbackSrc={businessImage}
                  alt={branch.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 70vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </span>
            ) : (
              <CoverPlaceholder
                icon={Building2}
                tone="muted"
                className="aspect-4/3 w-full"
                iconClassName="text-brand/50"
              />
            )}
            <div className="flex flex-col gap-2 p-4">
              <h3 className="font-heading text-sm font-semibold transition-colors group-hover:text-brand">
                {branch.name}
              </h3>
              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <MapPin className="mt-0.5 size-3.5 shrink-0" />
                {branch.address}
              </p>
              <a
                href={`tel:${branch.phone}`}
                className="relative z-20 flex w-fit items-center gap-1.5 text-xs font-medium text-brand dark:text-white"
              >
                <Phone className="size-3.5" />
                {branch.phone}
              </a>
            </div>

            <Link
              href={routes.branch(branch.id)}
              aria-label={branch.name}
              className="absolute inset-0 z-10"
            />
          </div>
        ))}
      </div>
    </Section>
  );
}
