"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import Lightbox from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { Expand, Images, Rotate3d } from "lucide-react";

import apartmentImage from "@/assets/images/card/apartman.webp";
import businessImage from "@/assets/images/card/business.webp";
import plotImage from "@/assets/images/card/plot.webp";
import villaImage from "@/assets/images/card/villa.webp";
import intro1 from "@/assets/images/intro/intro1.webp";
import intro2 from "@/assets/images/intro/intro2.webp";
import intro3 from "@/assets/images/intro/intro3.webp";
import intro4 from "@/assets/images/intro/intro4.webp";
import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui/typography";
import type { PropertyType } from "@/data/home";
import { cn } from "@/lib/utils";

const coverByType: Record<PropertyType, StaticImageData> = {
  apartment: apartmentImage,
  villa: villaImage,
  land: plotImage,
  commercial: businessImage,
  office: businessImage,
  industrial: businessImage,
};

/**
 * Until the API serves real photo sets, every file gets the same believable
 * gallery: its type-specific cover first, then the shared interior shots.
 */
export function galleryImages(propertyType: PropertyType): StaticImageData[] {
  return [coverByType[propertyType], intro1, intro2, intro3, intro4];
}

export function EstateGallery({
  estateId,
  propertyType,
  title,
  badges,
  hasTour,
}: {
  estateId: string;
  propertyType: PropertyType;
  title: string;
  badges: string[];
  hasTour?: boolean;
}) {
  const images = galleryImages(propertyType);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [current, setCurrent] = useState(0);

  const openAt = (photoIndex: number) => {
    setIndex(photoIndex);
    setOpen(true);
  };

  const slides = images.map((image) => ({
    src: image.src,
    width: image.width,
    height: image.height,
    alt: title,
  }));

  // The mobile rail is a scroll-snap strip; derive the counter from scroll
  // position instead of wiring a carousel library for five static photos.
  const onRailScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const rail = event.currentTarget;
    const photoIndex = Math.round(
      Math.abs(rail.scrollLeft) / Math.max(rail.clientWidth, 1)
    );
    setCurrent(Math.min(photoIndex, images.length - 1));
  };

  return (
    <>
      {/* Mobile: full-bleed swipeable rail */}
      <div className="relative md:hidden">
        <div
          onScroll={onRailScroll}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((image, photoIndex) => (
            <button
              key={photoIndex}
              type="button"
              onClick={() => openAt(photoIndex)}
              aria-label={`تصویر ${photoIndex + 1} از ${images.length}`}
              className="relative aspect-4/3 w-full shrink-0 snap-center"
            >
              <Image
                src={image}
                alt={`${title} — تصویر ${photoIndex + 1}`}
                fill
                sizes="100vw"
                priority={photoIndex === 0}
                className="object-cover"
              />
            </button>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 bg-linear-to-b from-black/45 to-transparent p-3">
          <div className="flex flex-wrap gap-1.5">
            {badges.map((badge) => (
              <Badge
                key={badge}
                className="border-white/25 bg-white/20 text-white backdrop-blur-md"
              >
                {badge}
              </Badge>
            ))}
          </div>
          {hasTour && (
            <Link
              href={`/estate/${estateId}/tour`}
              aria-label="ورود به تور مجازی ۳۶۰ درجه"
              className="flex size-8 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur-md transition-colors hover:bg-secondary hover:text-secondary-foreground"
            >
              <Rotate3d className="size-4" />
            </Link>
          )}
        </div>

        <Typography
          as="span"
          variant="small"
          className="pointer-events-none absolute bottom-3 inset-s-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 font-heading text-[11px] font-medium text-white backdrop-blur-md"
        >
          <Images className="size-3.5" />
          {(current + 1).toLocaleString("fa-IR")} /{" "}
          {images.length.toLocaleString("fa-IR")}
        </Typography>
      </div>

      {/* Desktop: hero mosaic — one large frame plus a 2×2 thumbnail block */}
      <div className="relative hidden gap-2 overflow-hidden rounded-3xl md:grid md:grid-cols-3 lg:grid-cols-4">
        <button
          type="button"
          onClick={() => openAt(0)}
          className="group relative col-span-2 aspect-16/11 overflow-hidden rounded-2xl"
        >
          <Image
            src={images[0]}
            alt={title}
            fill
            sizes="(min-width: 1024px) 50vw, 66vw"
            priority
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <span className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-black/25" />

          <span className="pointer-events-none absolute inset-x-4 top-4 flex flex-wrap gap-1.5">
            {badges.map((badge) => (
              <Badge
                key={badge}
                className="border-white/25 bg-white/20 text-white backdrop-blur-md"
              >
                {badge}
              </Badge>
            ))}
          </span>

          <Typography
            as="span"
            variant="small"
            className="absolute bottom-4 inset-s-4 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/45 px-3 py-1.5 font-heading text-xs font-medium text-white backdrop-blur-md transition-colors group-hover:bg-black/60"
          >
            <Expand className="size-3.5" />
            مشاهده تمام‌صفحه
          </Typography>
        </button>

        <div className="col-span-1 grid grid-rows-2 gap-2 lg:col-span-2 lg:grid-cols-2">
          {images.slice(1, 5).map((image, offset) => {
            const photoIndex = offset + 1;
            const isLast = offset === 3;
            return (
              <button
                key={photoIndex}
                type="button"
                onClick={() => openAt(photoIndex)}
                className={cn(
                  "group relative overflow-hidden rounded-2xl",
                  // On md the thumb column only has room for two frames.
                  offset > 1 && "hidden lg:block"
                )}
              >
                <Image
                  src={image}
                  alt={`${title} — تصویر ${photoIndex + 1}`}
                  fill
                  sizes="25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                {isLast && (
                  <Typography
                    as="span"
                    variant="small"
                    className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55 font-heading text-xs font-semibold text-white backdrop-blur-[2px] transition-colors group-hover:bg-black/65"
                  >
                    <Images className="size-5" />
                    {images.length.toLocaleString("fa-IR")} تصویر
                  </Typography>
                )}
              </button>
            );
          })}
        </div>

        {hasTour && (
          <Link
            href={`/estate/${estateId}/tour`}
            className="absolute bottom-4 inset-e-4 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 font-heading text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-secondary hover:text-secondary-foreground"
          >
            <Rotate3d className="size-4" />
            تور مجازی ۳۶۰ درجه
          </Link>
        )}
      </div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={slides}
        index={index}
        plugins={[Zoom, Thumbnails, Counter]}
        counter={{ container: { style: { top: "unset", bottom: 0 } } }}
        thumbnails={{ position: "bottom", border: 0, gap: 8 }}
        zoom={{ maxZoomPixelRatio: 3 }}
        carousel={{ finite: false }}
        styles={{ container: { backgroundColor: "rgba(0, 0, 0, .92)" } }}
      />
    </>
  );
}
