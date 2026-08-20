import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Heart,
  MapPin,
  Rotate3d,
  Ruler,
} from "lucide-react";

import apartmentImage from "@/assets/images/card/apartman.webp";
import businessImage from "@/assets/images/card/business.webp";
import plotImage from "@/assets/images/card/plot.webp";
import villaImage from "@/assets/images/card/villa.webp";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ApiImage } from "@/components/shared/api-image";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";
import { defaultAvatars } from "@/data/avatars";
import { type Estate, propertyTypeLabels } from "@/data/home";

const propertyImages: Record<Estate["propertyType"], StaticImageData> = {
  apartment: apartmentImage,
  villa: villaImage,
  land: plotImage,
  commercial: businessImage,
  office: businessImage,
  industrial: businessImage,
};

export function PropertyCard({
  estate,
  className,
}: {
  estate: Estate;
  className?: string;
}) {
  const href = estate.href ?? routes.property(estate.id);
  const fallbackImage = propertyImages[estate.propertyType];

  return (
    <Card
      className={cn(
        "group relative gap-0 rounded-2xl py-0 ring-border transition-[transform,box-shadow,--tw-ring-color] duration-300 ",
        className,
      )}
    >
      <div className="relative aspect-4/3 overflow-hidden rounded-t-2xl">
        {estate.coverImage ? (
          <ApiImage
            src={estate.coverImage}
            fallbackSrc={fallbackImage}
            alt={propertyTypeLabels[estate.propertyType]}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 80vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-107"
          />
        ) : (
          <Image
            src={fallbackImage}
            alt={propertyTypeLabels[estate.propertyType]}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 80vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-107"
          />
        )}

        {/* Scrim: keeps the overlaid badges and price legible on any artwork */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-black/25" />

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <Badge className="border-white/25 bg-white/20 text-white shadow-sm backdrop-blur-md">
              {propertyTypeLabels[estate.propertyType]}
            </Badge>
            {estate.isNew && (
              <Badge variant="secondary" className="shadow-sm">
                جدید
              </Badge>
            )}
            {estate.isSpecial && (
              <Badge variant="secondary" className="shadow-sm">
                ویژه
              </Badge>
            )}
          </div>

          <button
            type="button"
            aria-label="افزودن به علاقه‌مندی"
            className="relative z-20 flex size-8 shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/20 text-white backdrop-blur-md transition-colors hover:bg-secondary hover:text-secondary-foreground"
          >
            <Heart className="size-4" />
          </button>
        </div>

        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
          {estate.agentName && (
            <span className="flex min-w-0 items-center gap-2 rounded-full border border-secondary/60 bg-black/30 py-1 pe-3 ps-1 text-white shadow-sm backdrop-blur-md">
              <Avatar className="size-6 ring-1 ring-white/30">
                <AvatarImage
                  src={
                    estate.agentPhoto ??
                    defaultAvatars[estate.agentGender ?? "male"].src
                  }
                  alt={estate.agentName}
                />
                <AvatarFallback className="bg-white/20 text-xs font-semibold text-white">
                  {estate.agentName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-[13px] font-medium">
                {estate.agentName}
              </span>
            </span>
          )}
          {estate.hasTour && (
            <span
              title="تور مجازی ۳۶۰ درجه"
              aria-label="تور مجازی ۳۶۰ درجه"
              className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/20 text-white backdrop-blur-md"
            >
              <Rotate3d className="size-4" />
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-3.5">
        <div className="flex flex-col gap-1">
          <h3 className="line-clamp-1 font-heading text-sm font-semibold transition-colors group-hover:text-brand">
            {estate.title}
          </h3>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            {estate.locationLabel ?? `${estate.district}، قم`}
          </span>
        </div>

        {estate.propertyType !== "land" ? (
          <div className="flex items-center justify-between rounded-xl bg-muted/60 px-2.5 py-1.5 text-xs text-muted-foreground">
            <Spec icon={Ruler} value={`${estate.area} متر`} />
            {estate.rooms > 0 && (
              <>
                <span className="h-3.5 w-px bg-border" />
                <Spec icon={BedDouble} value={`${estate.rooms} خواب`} />
              </>
            )}
            {typeof estate.baths === "number" && estate.baths > 0 && (
              <>
                <span className="h-3.5 w-px bg-border" />
                <Spec icon={Bath} value={`${estate.baths} سرویس`} />
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center rounded-xl bg-muted/60 px-2.5 py-1.5 text-xs text-muted-foreground">
            <Spec icon={Ruler} value={`${estate.area} متر مربع`} />
          </div>
        )}

        <div className="flex items-center justify-between gap-2 border-t pt-2.5">
          {estate.dealType === "rent" ? (
            <span className="grid min-w-0 flex-1 grid-cols-2">
              <PriceItem label="ودیعه" value={estate.deposit ?? estate.price} />
              <PriceItem
                label="اجاره ماهانه"
                value={estate.monthlyRent ?? "—"}
                className="border-s ps-2"
              />
            </span>
          ) : (
            <PriceItem
              label="قیمت فروش"
              value={estate.price}
              className="min-w-0 flex-1"
            />
          )}

          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors ">
            <ArrowLeft className="size-3.5 transition-transform " />
          </span>
        </div>
      </div>

      {/* Full-card hit area, layered under the wishlist button */}
      <Link
        href={href}
        aria-label={estate.title}
        className="absolute inset-0 z-10"
      />
    </Card>
  );
}

function PriceItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <span className={cn("flex min-w-0 flex-col", className)}>
      <span className="truncate text-[10px] text-muted-foreground">
        {label}
      </span>
      <span className="truncate font-heading text-[13px] font-bold text-brand dark:text-white">
        {value}
      </span>
    </span>
  );
}

function Spec({ icon: Icon, value }: { icon: typeof Ruler; value: string }) {
  return (
    <span className="flex items-center gap-1 whitespace-nowrap">
      <Icon className="size-3.5 shrink-0 text-brand/70" />
      {value}
    </span>
  );
}
