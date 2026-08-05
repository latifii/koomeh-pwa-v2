import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Map, MapPin } from "lucide-react";

import mapImage from "@/assets/images/others/maps1.webp";
import { Section } from "@/components/layout/section";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

/** Decorative markers — position only, no fabricated listing data. */
const markers = [
  { className: "start-[22%] top-[30%]", pulse: true },
  { className: "start-[46%] top-[62%]", pulse: false },
  { className: "start-[64%] top-[24%]", pulse: false },
];

export function MapCtaSection() {
  return (
    <Section id="map-search">
      <div className="relative flex min-h-88 items-end overflow-hidden rounded-3xl bg-primary text-primary-foreground sm:min-h-96 lg:min-h-112 lg:items-center">
        <Image
          src={mapImage}
          alt="نقشه شهر قم"
          fill
          sizes="100vw"
          quality={90}
          className="object-cover"
        />

        {/* Readability wash: from the bottom on phones, from the right on desktop */}
        <div className="absolute inset-0 bg-linear-to-t from-primary via-primary/75 to-primary/20 lg:bg-linear-to-l lg:from-primary lg:via-primary/70 lg:to-transparent" />

        {markers.map((marker) => (
          <span
            key={marker.className}
            aria-hidden
            className={cn("absolute hidden lg:block", marker.className)}
          >
            {marker.pulse && (
              <span className="absolute -inset-3 animate-ping rounded-full bg-secondary/25" />
            )}
            <span
              className={cn(
                "relative flex size-8 items-center justify-center rounded-full shadow-lg",
                marker.pulse
                  ? "bg-secondary text-secondary-foreground"
                  : "bg-white/90 text-primary-deep"
              )}
            >
              <MapPin className="size-4" />
            </span>
          </span>
        ))}

        <div className="relative flex w-full flex-col items-start gap-3 p-6 sm:p-10 lg:max-w-lg">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
            <Map className="size-5" />
          </span>

          <Typography variant="eyebrow" light>
            جستجو بر اساس موقعیت
          </Typography>
          <Typography variant="h2" light>
            روی نقشه قم بگردید
          </Typography>
          <Typography variant="muted" light>
            محله را انتخاب کنید و فایل‌های همان محدوده را ببینید.
          </Typography>

          <Link
            href="/search/qom"
            className="group mt-1 flex w-fit items-center gap-2 rounded-lg bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground transition-transform hover:scale-105"
          >
            <Map className="size-4" />
            باز کردن نقشه
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          </Link>
        </div>
      </div>
    </Section>
  );
}
