import Link from "next/link";
import { Play } from "lucide-react";

import { Section } from "@/components/layout/section";
import type { Estate } from "@/data/home";
import { propertyTypeLabels } from "@/data/home";

import { CoverPlaceholder } from "./cover-placeholder";
import { SectionHeader } from "./section-header";

export function VirtualTourSection({ estates }: { estates: Estate[] }) {
  if (estates.length === 0) return null;

  return (
    <Section aria-labelledby="virtual-tour-title" tone="primary">
      <SectionHeader
        eyebrow="بازدید آنلاین و بدون محدودیت"
        title="املاک دارای تور مجازی"
        description="پیش از بازدید حضوری، تمام فضای ملک را به‌صورت ۳۶۰ درجه بررسی کنید."
        href="/c/qom?vr=1"
        light
        className="mb-8"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {estates.map((estate) => (
          <Link
            key={estate.id}
            href={`/estate/${estate.id}`}
            className="group overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 transition-colors hover:bg-white/10"
          >
            <div className="relative">
              <CoverPlaceholder
                icon={Play}
                tone="secondary"
                className="aspect-video w-full"
              />
              <span className="absolute top-3 inset-s-3 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-primary">
                تور مجازی ۳۶۰°
              </span>
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform group-hover:scale-110">
                  <Play className="size-5 fill-white text-white" />
                </span>
              </span>
            </div>
            <div className="flex flex-col gap-1 p-4">
              <h3 className="font-heading text-sm font-semibold">
                {estate.title || propertyTypeLabels[estate.propertyType]}
              </h3>
              <p className="text-xs text-primary-foreground/60">
                {estate.district}، قم
              </p>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}
