import { memo } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { Bath, BedDouble, Heart, MapPin, Rotate3d, Ruler } from "lucide-react";

import apartmentImage from "@/assets/images/card/apartman.webp";
import businessImage from "@/assets/images/card/business.webp";
import plotImage from "@/assets/images/card/plot.webp";
import villaImage from "@/assets/images/card/villa.webp";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
 * A horizontal, rectangular alternative to `PropertyCard` for contexts with
 * little vertical room — the mobile map results sheet stacks many of these in
 * a short scroll area, where the homepage's tall image-on-top card would let
 * only one or two show at a time.
 *
 * Memoised: that sheet re-renders on every keystroke in the search field above
 * it, and by then the list can hold several pages of cards.
 */
export const ListingCard = memo(function ListingCard({
  listing,
  className,
}: {
  listing: Listing;
  className?: string;
}) {
  return (
    <Card className="group relative gap-0 overflow-hidden rounded-2xl py-0 ring-border">
      <div className={cn("flex gap-3 p-2.5", className)}>
        <div className="relative size-28 shrink-0 overflow-hidden rounded-xl">
          <Image
            src={propertyImages[listing.propertyType]}
            alt={propertyTypeLabels[listing.propertyType]}
            fill
            sizes="112px"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-107"
          />
          {listing.isUrgent && (
            <Badge
              variant="secondary"
              className="absolute top-1.5 inset-s-1.5 shadow-sm"
            >
              فوری
            </Badge>
          )}
          {listing.hasTour && (
            <span
              title="تور مجازی ۳۶۰ درجه"
              aria-label="تور مجازی ۳۶۰ درجه"
              className="absolute bottom-1.5 inset-e-1.5 flex size-6 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-md"
            >
              <Rotate3d className="size-3.5" />
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-0.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-col gap-0.5">
              <h3 className="line-clamp-1 font-heading text-[13px] font-semibold transition-colors group-hover:text-brand">
                {listing.title}
              </h3>
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <MapPin className="size-3 shrink-0" />
                {listing.district}، {listing.city}
              </span>
            </div>

            <button
              type="button"
              aria-label="افزودن به علاقه‌مندی"
              className="relative z-20 flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-secondary"
            >
              <Heart className="size-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Ruler className="size-3 shrink-0 text-brand/70" />
              {listing.area} متر
            </span>
            {listing.rooms > 0 && (
              <span className="flex items-center gap-1">
                <BedDouble className="size-3 shrink-0 text-brand/70" />
                {listing.rooms} خواب
              </span>
            )}
            {listing.baths > 0 && (
              <span className="flex items-center gap-1">
                <Bath className="size-3 shrink-0 text-brand/70" />
                {listing.baths} سرویس
              </span>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between gap-2 border-t pt-1.5">
            {listing.dealType === "rent" ? (
              <span className="flex min-w-0 flex-1 items-baseline gap-1 truncate font-heading text-xs font-bold text-brand dark:text-white">
                ودیعه {listing.deposit}
                <span className="font-normal text-muted-foreground">·</span>
                اجاره {listing.monthlyRent}
              </span>
            ) : (
              <span className="truncate font-heading text-xs font-bold text-brand dark:text-white">
                {listing.price}
              </span>
            )}
          </div>
        </div>
      </div>

      <Link
        href={listing.href ?? routes.property(listing.id)}
        aria-label={listing.title}
        className="absolute inset-0 z-10"
      />
    </Card>
  );
});
