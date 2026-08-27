"use client";

import { useCallback, useMemo, useState } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import Lightbox from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { Expand, ImageOff, Images, Rotate3d } from "lucide-react";

import apartmentImage from "@/assets/images/card/apartman.webp";
import businessImage from "@/assets/images/card/business.webp";
import plotImage from "@/assets/images/card/plot.webp";
import villaImage from "@/assets/images/card/villa.webp";
import type { EstatePhoto } from "@/app/properties/_types/estate-detail.types";
import { ApiImage } from "@/components/shared/api-image";
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

// The lightbox options below are hoisted so they keep a stable identity across
// renders — the viewer rebuilds its state when a tracked prop changes.

// A transparent border on every thumbnail leaves room for the active one's
// white ring, so the strip shows which photo is on screen without shifting.
const THUMBNAILS_OPTIONS = {
  position: "bottom",
  width: 96,
  height: 64,
  border: 2,
  borderColor: "transparent",
  borderRadius: 8,
  gap: 8,
  padding: 0,
  imageFit: "cover",
  showToggle: true,
} as const;

const ZOOM_OPTIONS = { maxZoomPixelRatio: 3, scrollToZoom: true } as const;

const CONTROLLER_OPTIONS = { closeOnBackdropClick: true } as const;

const LIGHTBOX_STYLES = {
  container: { backgroundColor: "rgba(0, 0, 0, .92)" },
} as const;

const LIGHTBOX_PLUGINS = [Zoom, Thumbnails, Counter];

// A strip and a "۱ / ۱" counter are noise on the many files that publish a
// single photo; those open as a plain zoomable viewer.
const SINGLE_PHOTO_PLUGINS = [Zoom];

export function EstateGallery({
  photos,
  propertyType,
  title,
  badges,
  tourHref,
}: {
  photos: EstatePhoto[];
  propertyType: PropertyType;
  title: string;
  badges: string[];
  tourHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [current, setCurrent] = useState(0);

  const fallback = coverByType[propertyType];
  const count = photos.length;

  const openAt = (photoIndex: number) => {
    setIndex(photoIndex);
    setOpen(true);
  };

  // The lightbox rebuilds its state whenever `slides` changes identity, which
  // would snap the viewer back to the photo it was opened on. Memoising keeps
  // browsing — swipe, arrows, thumbnails — stable across parent re-renders.
  const slides = useMemo(
    () =>
      photos.map((photo, photoIndex) => ({
        src: photo.large ?? photo.url,
        alt: `${title} — تصویر ${photoIndex + 1}`,
      })),
    [photos, title],
  );

  // Keep `index` on the slide the viewer is actually looking at, so a re-render
  // never rewinds it.
  const onView = useCallback(
    ({ index: viewIndex }: { index: number }) => setIndex(viewIndex),
    [],
  );

  const carousel = useMemo(
    () => ({ finite: count <= 1, preload: 2 }),
    [count],
  );

  const plugins = count > 1 ? LIGHTBOX_PLUGINS : SINGLE_PHOTO_PLUGINS;

  // The mobile rail is a scroll-snap strip; derive the counter from scroll
  // position instead of wiring a carousel library for a handful of photos.
  // It sits under the lightbox overlay, so it stays quiet while that is open.
  const onRailScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (open) return;
    const rail = event.currentTarget;
    const photoIndex = Math.round(
      Math.abs(rail.scrollLeft) / Math.max(rail.clientWidth, 1),
    );
    setCurrent(Math.min(photoIndex, count - 1));
  };

  const overlay = (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 bg-linear-to-b from-black/45 to-transparent p-3">
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
      {tourHref && (
        <Link
          href={tourHref}
          aria-label="ورود به تور مجازی ۳۶۰ درجه"
          className="pointer-events-auto flex size-8 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur-md transition-colors hover:bg-secondary hover:text-secondary-foreground md:hidden"
        >
          <Rotate3d className="size-4" />
        </Link>
      )}
    </div>
  );

  // Files without a single published photo still need a frame for the badges.
  if (count === 0) {
    return (
      <div className="relative aspect-4/3 w-full overflow-hidden md:aspect-21/9 md:rounded-3xl">
        <Image
          src={fallback}
          alt={title}
          fill
          sizes="100vw"
          priority
          className="object-cover opacity-60"
        />
        {overlay}
        <Typography
          as="span"
          variant="small"
          className="absolute bottom-3 inset-s-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 font-medium text-white backdrop-blur-md"
        >
          <ImageOff className="size-3.5" />
          تصویری برای این ملک ثبت نشده است
        </Typography>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: full-bleed swipeable rail */}
      <div className="relative md:hidden">
        <div
          onScroll={onRailScroll}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {photos.map((photo, photoIndex) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => openAt(photoIndex)}
              aria-label={`تصویر ${photoIndex + 1} از ${count}`}
              className="relative aspect-4/3 w-full shrink-0 snap-center"
            >
              <ApiImage
                src={photo.url}
                fallbackSrc={fallback}
                alt={`${title} — تصویر ${photoIndex + 1}`}
                fill
                sizes="100vw"
                priority={photoIndex === 0}
                className="object-cover"
              />
            </button>
          ))}
        </div>

        {overlay}

        {count > 1 && (
          <Typography
            as="span"
            variant="small"
            className="pointer-events-none absolute bottom-3 inset-s-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 font-heading text-[11px] font-medium text-white backdrop-blur-md"
          >
            <Images className="size-3.5" />
            {(current + 1).toLocaleString("fa-IR")} /{" "}
            {count.toLocaleString("fa-IR")}
          </Typography>
        )}
      </div>

      {/* Desktop: hero mosaic — one large frame plus a thumbnail block */}
      <div
        className={cn(
          "relative hidden gap-2 overflow-hidden rounded-3xl md:grid",
          count > 1 ? "md:grid-cols-3 lg:grid-cols-4" : "md:grid-cols-1",
        )}
      >
        <button
          type="button"
          onClick={() => openAt(0)}
          aria-label={`تصویر ۱ از ${count} — نمایش تمام‌صفحه`}
          className={cn(
            "group relative aspect-16/11 overflow-hidden rounded-2xl",
            count > 1 ? "col-span-2" : "col-span-1",
          )}
        >
          <ApiImage
            src={photos[0].large ?? photos[0].url}
            fallbackSrc={fallback}
            alt={title}
            fill
            sizes={count > 1 ? "(min-width: 1024px) 50vw, 66vw" : "100vw"}
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

        {count > 1 && (
          <div className="col-span-1 grid grid-rows-2 gap-2 lg:col-span-2 lg:grid-cols-2">
            {photos.slice(1, 5).map((photo, offset) => {
              const photoIndex = offset + 1;
              const remaining = count - 5;
              const showRemaining = offset === 3 && remaining > 0;

              return (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => openAt(photoIndex)}
                  aria-label={`تصویر ${photoIndex + 1} از ${count}`}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl",
                    // On md the thumb column only has room for two frames.
                    offset > 1 && "hidden lg:block",
                  )}
                >
                  <ApiImage
                    src={photo.thumbnail ?? photo.url}
                    fallbackSrc={fallback}
                    alt={`${title} — تصویر ${photoIndex + 1}`}
                    fill
                    sizes="25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {showRemaining && (
                    <Typography
                      as="span"
                      variant="small"
                      className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/55 font-heading text-xs font-semibold text-white backdrop-blur-[2px] transition-colors group-hover:bg-black/65"
                    >
                      <Images className="size-5" />
                      {count.toLocaleString("fa-IR")} تصویر
                    </Typography>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {tourHref && (
          <Link
            href={tourHref}
            className="absolute bottom-4 inset-e-4 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 font-heading text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-secondary hover:text-secondary-foreground"
          >
            <Rotate3d className="size-4" />
            تور مجازی ۳۶۰ درجه
          </Link>
        )}
      </div>

      {/* Counter keeps its default top placement — the bottom belongs to the
          thumbnail strip the viewer taps to jump between photos. */}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={slides}
        index={index}
        on={{ view: onView }}
        plugins={plugins}
        thumbnails={THUMBNAILS_OPTIONS}
        zoom={ZOOM_OPTIONS}
        carousel={carousel}
        controller={CONTROLLER_OPTIONS}
        styles={LIGHTBOX_STYLES}
      />
    </>
  );
}
