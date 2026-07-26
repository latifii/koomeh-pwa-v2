import Link from "next/link";
import {
  Bath,
  BedDouble,
  Building2,
  Heart,
  Home as HomeIcon,
  LandPlot,
  MapPin,
  Ruler,
  Store,
  Video,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { type Estate, propertyTypeLabels } from "@/data/home";

import { CoverPlaceholder } from "./cover-placeholder";

const propertyIcons = {
  apartment: Building2,
  villa: HomeIcon,
  land: LandPlot,
  commercial: Store,
} as const;

export function PropertyCard({
  estate,
  className,
}: {
  estate: Estate;
  className?: string;
}) {
  const Icon = propertyIcons[estate.propertyType];

  return (
    <Card className={cn("group overflow-hidden py-0 gap-0", className)}>
      <div className="relative">
        <Link href={`/estate/${estate.id}`} aria-label={estate.title}>
          <CoverPlaceholder
            icon={Icon}
            tone="primary"
            className="aspect-4/3 w-full"
          />
        </Link>

        <div className="absolute inset-x-3 top-3 flex items-start justify-between">
          <div className="flex flex-wrap gap-1.5">
            {estate.isNew && (
              <Badge variant="secondary">جدید</Badge>
            )}
            {estate.hasTour && (
              <Badge className="gap-1 bg-white/15 text-white backdrop-blur-sm">
                <Video className="size-3" />
                تور مجازی
              </Badge>
            )}
          </div>
          <button
            type="button"
            aria-label="افزودن به علاقه‌مندی"
            className="flex size-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
          >
            <Heart className="size-4" />
          </button>
        </div>

        <span className="absolute bottom-3 inset-s-3 rounded-md bg-black/40 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {propertyTypeLabels[estate.propertyType]}
        </span>
      </div>

      <CardContent className="flex flex-col gap-2 pt-4">
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
          <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
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

      <CardFooter className="mt-3 flex items-center justify-between gap-2 border-t-0 bg-transparent">
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
        </Button>
      </CardFooter>
    </Card>
  );
}
