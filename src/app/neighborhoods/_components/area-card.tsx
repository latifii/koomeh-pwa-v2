import Link from "next/link";
import { ArrowLeft, Home, MapPinned, TrendingUp } from "lucide-react";

import { Typography } from "@/components/ui/typography";
import { routes } from "@/lib/routes";
import { type AreaDetail, formatToman } from "@/data/area-detail";
import { cn } from "@/lib/utils";

/**
 * Neighborhood card for the list grid: a gradient cover with the name, a short
 * tagline, and the two figures a house-hunter scans for — active files and the
 * typical apartment price per metre.
 */
export function AreaCard({
  area,
  className,
}: {
  area: AreaDetail;
  className?: string;
}) {
  const perMeter = area.stats.avgApartmentPerMeter || area.stats.avgLandPerMeter;

  return (
    <Link
      href={routes.neighborhood(area.id)}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border bg-card transition-colors hover:border-brand/30",
        className
      )}
    >
      <div className="relative flex h-28 items-center justify-center overflow-hidden bg-linear-to-br from-primary/90 via-primary to-primary-deep">
        <div
          aria-hidden
          className="pointer-events-none absolute -end-6 -top-8 size-28 rounded-full bg-white/10 blur-2xl"
        />
        <MapPinned
          className="relative size-9 text-white/80 transition-transform duration-300 group-hover:scale-110"
          strokeWidth={1.5}
        />
        <Typography
          as="span"
          variant="small"
          light
          className="absolute bottom-2.5 inset-s-3 text-[11px] text-white/75"
        >
          راهنمای محله
        </Typography>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <Typography variant="h4" as="h3" className="sm:text-sm">
            {area.name}
          </Typography>
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-brand transition-colors group-hover:bg-brand group-hover:text-white">
            <ArrowLeft className="size-3.5" />
          </span>
        </div>

        <Typography variant="small" className="line-clamp-1">
          {area.tagline}
        </Typography>

        <div className="mt-auto grid grid-cols-2 gap-2 border-t pt-2.5">
          <Stat
            icon={Home}
            label="فایل فعال"
            value={area.stats.listingCount.toLocaleString("fa-IR")}
          />
          <Stat
            icon={TrendingUp}
            label="متری از"
            value={perMeter ? `${formatToman(perMeter)}` : "—"}
          />
        </div>
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
