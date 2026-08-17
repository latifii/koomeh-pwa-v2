import Link from "next/link";
import { ArrowLeft, MapPinned } from "lucide-react";

import { Section } from "@/components/layout/section";
import blogCover from "@/assets/images/card/blog.webp";
import { ApiImage } from "@/components/shared/api-image";
import type { HomeNeighborhoodGuidesSection } from "@/app/_home/_types/home-content.types";
import { routes } from "@/lib/routes";

import { CoverPlaceholder } from "./cover-placeholder";
import { SectionHeader } from "./section-header";

export function AreasSection({
  section,
}: {
  section: HomeNeighborhoodGuidesSection;
}) {
  if (section.items.length === 0) return null;

  return (
    <Section id="areas" tone="muted">
      <SectionHeader
        eyebrow={section.eyebrow}
        title={section.title}
        description={section.subtitle}
        href={section.viewAllHref}
        className="mb-8"
      />

      {/* Mobile: horizontal snap carousel; grid from `sm` up */}
      <div className="-mx-page flex snap-x snap-mandatory gap-3 overflow-x-auto px-page pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-6">
        {section.items.map((area) => (
          <Link
            key={area.id}
            href={routes.neighborhood(area.id)}
            className="group w-[38%] shrink-0 snap-start overflow-hidden rounded-2xl border bg-card sm:w-auto"
          >
            {area.image ? (
              <span className="relative block aspect-square w-full overflow-hidden">
                <ApiImage
                  src={area.image}
                  fallbackSrc={blogCover}
                  alt={area.name}
                  fill
                  sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 38vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </span>
            ) : (
              <CoverPlaceholder
                icon={MapPinned}
                tone="muted"
                className="aspect-square w-full"
                iconClassName="size-7 text-brand/50"
              />
            )}
            <div className="flex flex-col gap-0.5 p-3">
              <span className="text-[11px] text-muted-foreground">
                راهنمای محله
              </span>
              <h3 className="flex items-center justify-between gap-1 text-sm font-semibold">
                {area.name}
                <ArrowLeft className="size-3.5 text-muted-foreground transition-transform group-hover:-translate-x-1" />
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}
