import Image from "next/image";
import Link from "next/link";
import { Expand, Smartphone, Sparkles } from "lucide-react";

import tourCover from "@/assets/images/card/360.webp";
import { Icon360 } from "@/components/icons/icon-360";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { cn } from "@/lib/utils";
import type { Estate } from "@/data/home";
import { propertyTypeLabels } from "@/data/home";

import { SectionHeader } from "./section-header";

const capabilities = [
  { icon: Icon360, label: "چرخش کامل ۳۶۰ درجه" },
  { icon: Smartphone, label: "بدون نصب اپلیکیشن" },
  { icon: Expand, label: "نمای تمام‌صفحه" },
  { icon: Sparkles, label: "کیفیت واقعیت‌افزوده" },
];

/** Explicit desktop cells: [feature (2×2), top-right, bottom-right]. */
const gridPlacement = [
  "lg:col-start-1 lg:col-span-2 lg:row-start-1 lg:row-span-2",
  "lg:col-start-3 lg:row-start-1",
  "lg:col-start-3 lg:row-start-2",
];

export function VirtualTourSection({ estates }: { estates: Estate[] }) {
  if (estates.length === 0) return null;

  return (
    <Section
      aria-labelledby="virtual-tour-title"
      tone="primary"
      container={false}
      className="relative overflow-hidden"
    >
      {/* Tech-feel backdrop: faint blueprint grid + two soft brand glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_left,var(--color-white)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-white)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,var(--color-black),transparent_75%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 start-1/4 size-72 rounded-full bg-secondary/20 blur-[100px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 end-0 size-80 rounded-full bg-primary-deep/60 blur-[110px]"
      />

      <Container className="relative z-10">
        <SectionHeader
          eyebrow="بازدید آنلاین و بدون محدودیت"
          title="املاک دارای تور مجازی"
          description="پیش از بازدید حضوری، تمام فضای ملک را به‌صورت ۳۶۰ درجه بررسی کنید."
          href="/c/qom?vr=1"
          light
          className="mb-6"
        />

        <ul className="mb-8 flex flex-wrap gap-2">
          {capabilities.map((item) => (
            <li
              key={item.label}
              className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white/80 backdrop-blur-sm sm:text-xs"
            >
              <item.icon className="size-3.5 text-secondary" />
              {item.label}
            </li>
          ))}
        </ul>

        {/*
          Desktop: one tall feature card taking two thirds and both rows, with
          the other two stacked in the third column beside it — all on a single
          row of the page. Cells are placed explicitly (not by auto-flow) so a
          spanning item can never push a later card onto a new row.
          Mobile: snap carousel.
        */}
        <div className="-mx-page flex snap-x snap-mandatory gap-4 overflow-x-auto px-page pb-2 [scrollbar-width:none] lg:mx-0 lg:grid lg:h-136 lg:grid-cols-3 lg:grid-rows-2 lg:overflow-visible lg:px-0 lg:pb-0">
          {estates.slice(0, 3).map((estate, index) => (
            <TourCard
              key={estate.id}
              estate={estate}
              featured={index === 0}
              className={cn(
                "w-[85%] shrink-0 snap-start sm:w-[60%] lg:h-full lg:w-auto",
                gridPlacement[index]
              )}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}

function TourCard({
  estate,
  featured,
  className,
}: {
  estate: Estate;
  featured?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/estate/${estate.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/12 backdrop-blur-sm transition-all duration-300 hover:ring-secondary/50 hover:shadow-[0_24px_60px_-30px_var(--color-black)]",
        className
      )}
    >
      <div className="relative aspect-video overflow-hidden lg:aspect-auto lg:min-h-0 lg:flex-1">
        <Image
          src={tourCover}
          alt={`تور مجازی ${estate.title}`}
          fill
          sizes="(min-width: 1024px) 640px, 85vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-primary-deep via-primary-deep/25 to-primary-deep/50" />

        {/* Viewfinder brackets — they push outward on hover, like a camera focusing */}
        <Bracket className="start-3 top-3 rounded-ss-lg border-t-2 border-s-2 transition-all duration-300 group-hover:start-2 group-hover:top-2" />
        <Bracket className="end-3 top-3 rounded-se-lg border-t-2 border-e-2 transition-all duration-300 group-hover:end-2 group-hover:top-2" />
        <Bracket className="bottom-3 start-3 rounded-es-lg border-b-2 border-s-2 transition-all duration-300 group-hover:bottom-2 group-hover:start-2" />
        <Bracket className="bottom-3 end-3 rounded-ee-lg border-b-2 border-e-2 transition-all duration-300 group-hover:bottom-2 group-hover:end-2" />

        <span className="absolute top-5 inset-s-5 flex items-center gap-1.5 rounded-full border border-secondary/40 bg-black/35 px-2.5 py-1 text-[11px] font-semibold text-secondary backdrop-blur-md">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-secondary opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-secondary" />
          </span>
          تور ۳۶۰°
        </span>

        <span className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              "relative flex size-14 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-110",
              featured && "lg:size-20"
            )}
          >
            <span className="absolute inset-0 rounded-full ring-1 ring-secondary/50 transition-transform duration-700 group-hover:scale-135 group-hover:opacity-0" />
            <Icon360
              className={cn(
                "size-7 transition-transform duration-700 group-hover:rotate-y-180",
                featured && "lg:size-10"
              )}
            />
          </span>
        </span>

      </div>

      <div className="flex items-center justify-between gap-3 p-4">
        <span className="flex min-w-0 flex-col gap-0.5">
          <h3
            className={cn(
              "truncate font-heading text-sm font-semibold text-white",
              featured && "lg:text-base"
            )}
          >
            {estate.title || propertyTypeLabels[estate.propertyType]}
          </h3>
          <span className="truncate text-xs text-white/55">
            {estate.district}، قم · {estate.area} متر
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-secondary px-3 py-1.5 text-[11px] font-semibold text-secondary-foreground transition-transform duration-300 group-hover:scale-105">
          شروع بازدید
        </span>
      </div>
    </Link>
  );
}

function Bracket({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute size-6 border-secondary/70",
        className
      )}
    />
  );
}
