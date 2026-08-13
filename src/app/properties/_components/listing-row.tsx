"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { BedDouble, Ruler } from "lucide-react";

import apartmentImage from "@/assets/images/card/apartman.webp";
import businessImage from "@/assets/images/card/business.webp";
import plotImage from "@/assets/images/card/plot.webp";
import villaImage from "@/assets/images/card/villa.webp";
import { Badge } from "@/components/ui/badge";
import { type PropertyType, propertyTypeLabels } from "@/data/home";
import type { Listing } from "@/data/search";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";

const propertyImages: Record<PropertyType, StaticImageData> = {
  apartment: apartmentImage,
  villa: villaImage,
  land: plotImage,
  commercial: businessImage,
  office: businessImage,
  industrial: businessImage,
};

/**
 * The condensed card used in the map layout's middle column, where a full
 * PropertyCard would leave room for only two results at a time.
 */
export function ListingRow({
  listing,
  active,
  onHover,
  onSelect,
}: {
  listing: Listing;
  active?: boolean;
  onHover?: (id: string | null) => void;
  onSelect?: (id: string) => void;
}) {
  return (
    <Link
      href={routes.property(listing.id)}
      onMouseEnter={() => onHover?.(listing.id)}
      onMouseLeave={() => onHover?.(null)}
      onFocus={() => onHover?.(listing.id)}
      onClick={(event) => {
        if (!onSelect) return;
        // In the map layout a click should reveal the pin, not navigate away.
        event.preventDefault();
        onSelect(listing.id);
      }}
      className={cn(
        "flex gap-3 rounded-2xl border bg-card p-2.5 transition-all",
        active
          ? "border-brand ring-1 ring-brand/30"
          : "hover:border-brand/40 hover:shadow-sm"
      )}
    >
      <span className="relative size-24 shrink-0 overflow-hidden rounded-xl">
        <Image
          src={propertyImages[listing.propertyType]}
          alt={propertyTypeLabels[listing.propertyType]}
          fill
          sizes="96px"
          className="object-cover"
        />
        {listing.isUrgent && (
          <Badge
            variant="secondary"
            className="absolute top-1 inset-s-1 h-4 px-1.5 text-[9px]"
          >
            فوری
          </Badge>
        )}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="line-clamp-1 font-heading text-[13px] font-semibold">
          {listing.title}
        </span>
        <span className="truncate text-[11px] text-muted-foreground">
          {listing.district}، {listing.city}
        </span>

        <span className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Ruler className="size-3 text-brand/70" />
            {listing.area} متر
          </span>
          {listing.rooms > 0 && (
            <span className="flex items-center gap-1">
              <BedDouble className="size-3 text-brand/70" />
              {listing.rooms} خواب
            </span>
          )}
        </span>

        <span className="mt-auto font-heading text-xs font-bold text-brand dark:text-white">
          {listing.dealType === "rent"
            ? `ودیعه ${listing.deposit} · اجاره ${listing.monthlyRent}`
            : listing.price}
        </span>
      </span>
    </Link>
  );
}
