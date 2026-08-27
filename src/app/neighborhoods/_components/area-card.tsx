import Link from "next/link";
import { ArrowLeft, Home, MapPinned, TrendingUp } from "lucide-react";

import type { NeighborhoodCard } from "@/app/neighborhoods/_types/neighborhoods.types";
import cityImage from "@/assets/images/city/qom.webp";
import { ApiImage } from "@/components/shared/api-image";
import { Typography } from "@/components/ui/typography";
import { formatToman } from "@/data/search";
import { cn } from "@/lib/utils";

/**
 * Neighborhood card for the list grid: the guide's own cover, its name, and the
 * two figures a house-hunter scans for — active files and the typical price per
 * metre. Guides with no linked place show the name alone rather than zeros.
 */
export function AreaCard({
  area,
  className,
}: {
  area: NeighborhoodCard;
  className?: string;
}) {
  const perMeter = area.avgApartment ?? area.avgLand;
  const hasFigures = area.estateCount !== undefined || perMeter !== undefined;

  return (
    <Link
      href={area.href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card transition-colors hover:border-brand/30",
        className,
      )}
    >
      <div className="relative h-28 overflow-hidden bg-linear-to-br from-primary/90 via-primary to-primary-deep">
        {area.image ? (
          <ApiImage
            src={area.image}
            fallbackSrc={cityImage}
            alt={area.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover opacity-70 transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center">
            <MapPinned
              className="size-9 text-white/80 transition-transform duration-300 group-hover:scale-110"
              strokeWidth={1.5}
            />
          </span>
        )}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-primary-deep/80 to-transparent"
        />
        <Typography
          as="span"
          variant="small"
          light
          className="absolute bottom-2.5 inset-s-3 text-[11px] text-white/80"
        >
          {area.area ? `راهنمای ${area.area.kindLabel}` : "راهنمای محله"}
        </Typography>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <Typography variant="h4" as="h3" className="line-clamp-2 sm:text-sm">
            {area.title}
          </Typography>
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-brand transition-colors group-hover:bg-brand group-hover:text-white">
            <ArrowLeft className="size-3.5" />
          </span>
        </div>

        {area.summary && (
          <Typography variant="small" className="line-clamp-2">
            {area.summary}
          </Typography>
        )}

        {hasFigures && (
          <div className="mt-auto grid grid-cols-2 gap-2 border-t pt-2.5">
            <Stat
              icon={Home}
              label="فایل فعال"
              value={
                area.estateCount !== undefined
                  ? area.estateCount.toLocaleString("fa-IR")
                  : "—"
              }
            />
            <Stat
              icon={TrendingUp}
              label="متری از"
              value={perMeter ? formatToman(perMeter) : "—"}
            />
          </div>
        )}
      </div>
    </Link>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Home;
  label: string;
  value: string;
}) {
  return (
    <span className="flex flex-col gap-0.5">
      <Typography
        as="span"
        variant="small"
        className="flex items-center gap-1 text-[11px]"
      >
        <Icon className="size-3 text-brand/70" />
        {label}
      </Typography>
      <Typography as="span" variant="h4" className="text-[13px] sm:text-[13px]">
        {value}
      </Typography>
    </span>
  );
}
