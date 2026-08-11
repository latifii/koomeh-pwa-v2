"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";

// Leaflet touches `window` at import time, so the map may only ever load in
// the browser.
const EstateMap = dynamic(
  () => import("./estate-map").then((mod) => mod.EstateMap),
  { ssr: false, loading: () => <Skeleton className="size-full" /> }
);

export function EstateMapPanel({ lat, lng }: { lat: number; lng: number }) {
  return (
    <div className="h-64 w-full overflow-hidden rounded-2xl border sm:h-80">
      <EstateMap lat={lat} lng={lng} />
    </div>
  );
}
