"use client";

import L from "leaflet";
import { Circle, MapContainer, Marker, TileLayer } from "react-leaflet";

import "leaflet/dist/leaflet.css";

/**
 * A house-shaped pin instead of Leaflet's default marker: the bundled default
 * icon resolves its PNGs relative to the CSS file and breaks under the Next
 * asset pipeline.
 */
const pinIcon = L.divIcon({
  className: "!bg-transparent !border-0",
  html: `<span class="flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[oklch(0.245_0.105_260.802)] text-white shadow-lg">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
  </span>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

/**
 * The exact address is not public, so the map shows an approximate radius
 * around the file rather than pretending to a doorstep-level pin.
 */
export function EstateMap({ lat, lng }: { lat: number; lng: number }) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
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
        radius={320}
        pathOptions={{
          color: "oklch(0.245 0.105 260.802)",
          fillColor: "oklch(0.245 0.105 260.802)",
          fillOpacity: 0.12,
          weight: 1.5,
        }}
      />
      <Marker position={[lat, lng]} icon={pinIcon} />
    </MapContainer>
  );
}
