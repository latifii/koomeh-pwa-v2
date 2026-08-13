"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/ui/skeleton";

// Leaflet touches `window` at import time, so the map only loads in the browser.
const AreaMap = dynamic(
  () => import("./area-map").then((mod) => mod.AreaMap),
  { ssr: false, loading: () => <Skeleton className="size-full" /> }
);

export function AreaMapPanel({ lat, lng }: { lat: number; lng: number }) {
  return (
    <div className="h-64 w-full overflow-hidden rounded-2xl border sm:h-72">
      <AreaMap lat={lat} lng={lng} />
    </div>
  );
}
