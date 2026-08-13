"use client";

import Image from "next/image";
import { ArrowLeft, Map, MapPin } from "lucide-react";

import mapImage from "@/assets/images/others/maps1.webp";

/**
 * The toolbar toggle alone is easy to miss, so the map gets a proper invitation
 * inside the results — an actual preview of what switching would show.
 */
export function MapPromo({
  count,
  city,
  onOpen,
}: {
  count: number;
  city: string;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative flex min-h-36 w-full items-center overflow-hidden rounded-2xl border text-start sm:col-span-2 xl:col-span-3"
    >
      <Image
        src={mapImage}
        alt=""
        fill
        sizes="100vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-linear-to-l from-primary-deep/40 via-primary-deep/85 to-primary-deep" />

      <div className="relative flex w-full flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 text-white">
          <span className="flex items-center gap-1.5 font-heading text-base font-bold">
            <Map className="size-4 text-secondary" />
            این {count.toLocaleString("fa-IR")} آگهی را روی نقشه ببینید
          </span>
          <span className="text-xs text-white/70">
            موقعیت دقیق هر ملک در {city}، فاصله تا محله‌های اطراف و مقایسه قیمت
            در یک نگاه.
          </span>
        </div>

        <span className="flex w-fit shrink-0 items-center gap-1.5 rounded-lg bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground transition-transform group-hover:scale-105">
          <MapPin className="size-4" />
          نمایش روی نقشه
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
        </span>
      </div>
    </button>
  );
}
