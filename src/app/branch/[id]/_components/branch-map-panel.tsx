"use client";

import dynamic from "next/dynamic";
import { Navigation } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

// Leaflet touches `window` at import time, so the map only loads in the browser.
const BranchMap = dynamic(
  () => import("./branch-map").then((mod) => mod.BranchMap),
  { ssr: false, loading: () => <Skeleton className="size-full" /> }
);

export function BranchMapPanel({
  lat,
  lng,
  name,
}: {
  lat: number;
  lng: number;
  name: string;
}) {
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div className="relative h-72 w-full overflow-hidden rounded-2xl border sm:h-80">
      <BranchMap lat={lat} lng={lng} />
      <Button
        size="sm"
        nativeButton={false}
        render={
          <a href={directionsUrl} target="_blank" rel="noopener noreferrer" />
        }
        className="absolute bottom-3 inset-s-3 z-[500]"
      >
        <Navigation data-icon="inline-start" />
        مسیریابی به {name}
      </Button>
    </div>
  );
}
