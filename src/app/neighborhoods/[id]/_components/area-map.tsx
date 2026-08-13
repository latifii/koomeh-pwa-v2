"use client";

import L from "leaflet";
import { Circle, MapContainer, Marker, TileLayer } from "react-leaflet";

import "leaflet/dist/leaflet.css";

/**
 * A map-pin marker for the neighborhood centre. An area covers a wide zone, so
 * a soft radius reads more honestly than a single doorstep pin.
 */
const pinIcon = L.divIcon({
  className: "!bg-transparent !border-0",
  html: `<span class="flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[oklch(0.245_0.105_260.802)] text-white shadow-lg">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
  </span>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

export function AreaMap({ lat, lng }: { lat: number; lng: number }) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={14}
      scrollWheelZoom={false}
      className="isolate z-0 size-full [&_.leaflet-container]:font-sans"
      style={{ background: "var(--muted)" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Circle
        center={[lat, lng]}
        radius={700}
        pathOptions={{
          color: "oklch(0.245 0.105 260.802)",
          fillColor: "oklch(0.245 0.105 260.802)",
          fillOpacity: 0.1,
          weight: 1.5,
        }}
      />
      <Marker position={[lat, lng]} icon={pinIcon} />
    </MapContainer>
  );
}
