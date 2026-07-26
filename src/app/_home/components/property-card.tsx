import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Heart,
  MapPin,
  Ruler,
  Video,
} from "lucide-react";

import apartmentImage from "@/assets/images/card/apartman.webp";
import businessImage from "@/assets/images/card/business.webp";
import plotImage from "@/assets/images/card/plot.webp";
import villaImage from "@/assets/images/card/villa.webp";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type Estate, propertyTypeLabels } from "@/data/home";

const propertyImages: Record<Estate["propertyType"], StaticImageData> = {
  apartment: apartmentImage,
  villa: villaImage,
  land: plotImage,
  commercial: businessImage,
};

export function PropertyCard({
  estate,
  className,
}: {
  estate: Estate;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "group gap-0 overflow-hidden py-0 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:ring-primary/15",
        className
      )}
    >
      <div className="relative">
        <Link href={`/estate/${estate.id}`} aria-label={estate.title}>
          <Image
            src={propertyImages[estate.propertyType]}
            alt={propertyTypeLabels[estate.propertyType]}
            className="aspect-4/3 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/45 to-transparent" />

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <Badge className="bg-white/90 text-ink backdrop-blur-sm">
              {propertyTypeLabels[estate.propertyType]}
            </Badge>
            {estate.isNew && <Badge variant="secondary">جدید</Badge>}
          </div>
          <button
            type="button"
            aria-label="افزودن به علاقه‌مندی"
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
          >
            <Heart className="size-4" />
          </button>
        </div>

        {estate.hasTour && (
          <Badge className="absolute bottom-3 inset-s-3 gap-1 bg-white/15 text-white backdrop-blur-sm">
            <Video className="size-3" />
            تور مجازی
          </Badge>
        )}
      </div>

      <CardContent className="flex flex-col gap-1.5 pt-3">
        <Link
          href={`/estate/${estate.id}`}
          className="line-clamp-1 font-heading text-sm font-semibold hover:text-primary dark:hover:text-primary"
        >
          {estate.title}
        </Link>
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5" />
          {estate.district}، قم
        </span>

        {estate.propertyType !== "land" && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Ruler className="size-3.5" />
              {estate.area} متر
            </span>
            {estate.rooms > 0 && (
              <span className="flex items-center gap-1">
                <BedDouble className="size-3.5" />
                {estate.rooms} خواب
              </span>
            )}
            <span className="flex items-center gap-1">
              <Bath className="size-3.5" />
              {estate.baths} سرویس
            </span>
          </div>
        )}
      </CardContent>

      <div className="mx-4 flex items-center gap-2 border-t py-2.5">
        <Avatar className="size-6">
          <AvatarFallback className="bg-primary/10 text-[10px] text-primary dark:text-primary">
            {estate.agentName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <span className="text-xs text-muted-foreground">
          {estate.agentName}
        </span>
      </div>

      <CardFooter className="flex items-center justify-between gap-2 border-t-0 bg-transparent pt-0">
        <span className="text-sm font-bold text-primary dark:text-primary">
          {estate.price}
        </span>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href={`/estate/${estate.id}`} />}
        >
          مشاهده ملک
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}
