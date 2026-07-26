import Link from "next/link";
import { ArrowLeft, MapPinned } from "lucide-react";

import { Section } from "@/components/layout/section";
import type { AreaGuide } from "@/data/home";

import { CoverPlaceholder } from "./cover-placeholder";
import { SectionHeader } from "./section-header";

export function AreasSection({ areas }: { areas: AreaGuide[] }) {
  if (areas.length === 0) return null;

  return (
    <Section id="areas" tone="muted">
      <SectionHeader
        eyebrow="قم را بهتر بشناسید"
        title="محلات"
        description="راهنمای انتخاب محله مناسب برای زندگی و سرمایه‌گذاری."
        href="/blogs/9"
        className="mb-8"
      />

      {/* Mobile: horizontal snap carousel; grid from `sm` up */}
      <div className="-mx-page flex snap-x snap-mandatory gap-3 overflow-x-auto px-page pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-6">
        {areas.map((area) => (
          <Link
            key={area.id}
            href={`/blog/area-${area.id}`}
            className="group w-[38%] shrink-0 snap-start overflow-hidden rounded-2xl border bg-card sm:w-auto"
          >
            <CoverPlaceholder
              icon={MapPinned}
              tone="muted"
              className="aspect-square w-full"
              iconClassName="size-7 text-primary/50 dark:text-primary/40"
            />
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
