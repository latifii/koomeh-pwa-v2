import Link from "next/link";
import { ArrowLeft, MapPinned } from "lucide-react";

import type { AreaGuide } from "@/data/home";

import { CoverPlaceholder } from "./cover-placeholder";
import { SectionHeader } from "./section-header";

export function AreasSection({ areas }: { areas: AreaGuide[] }) {
  if (areas.length === 0) return null;

  return (
    <section id="areas" className="bg-muted/40 py-14">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="قم را بهتر بشناسید"
          title="محلات"
          description="راهنمای انتخاب محله مناسب برای زندگی و سرمایه‌گذاری."
          href="/blogs/9"
          className="mb-8"
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {areas.map((area) => (
            <Link
              key={area.id}
              href={`/blog/area-${area.id}`}
              className="group overflow-hidden rounded-2xl border bg-card"
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
      </div>
    </section>
  );
}
