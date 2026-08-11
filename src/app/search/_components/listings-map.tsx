"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

import "leaflet/dist/leaflet.css";

import { type Listing, cityCenters, formatToman } from "@/data/search";

/**
 * Price bubbles instead of Leaflet's default pin: the price is the thing a
 * house-hunter scans for, and it sidesteps the broken default-marker asset
 * paths that bundlers cause.
 */
function priceIcon(listing: Listing, active: boolean) {
  const className = active
    ? "bg-secondary text-secondary-foreground border-secondary"
    : "bg-card text-foreground border-border hover:border-brand";

  return L.divIcon({
    className: "!bg-transparent !border-0",
    html: `<span class="inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 font-heading text-[11px] font-bold shadow-md transition-colors ${className}">${formatToman(
      listing.priceValue
    )}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

/** Keeps the viewport in sync when the result set or the selection changes. */
function MapController({
  listings,
  selectedId,
  center,
}: {
  listings: Listing[];
  selectedId: string | null;
  center: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    if (listings.length === 0) {
      map.setView(center, 12);
      return;
    }
    const bounds = L.latLngBounds(
      listings.map((listing) => [listing.lat, listing.lng] as [number, number])
    );
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
  }, [listings, map, center]);

  useEffect(() => {
    const selected = listings.find((listing) => listing.id === selectedId);
    if (selected) {
      map.panTo([selected.lat, selected.lng], { animate: true });
    }
  }, [selectedId, listings, map]);

  return null;
}

export function ListingsMap({
  listings,
  city,
  selectedId,
  onSelect,
}: {
  listings: Listing[];
  city: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const center = cityCenters[city] ?? cityCenters["قم"];
  // Leaflet redraws every marker whose icon identity changes, so only rebuild
  // the two that actually change when the selection moves.
  const icons = useMemo(
    () =>
      new Map(
        listings.map((listing) => [
          listing.id,
          priceIcon(listing, listing.id === selectedId),
        ])
      ),
    [listings, selectedId]
  );

  // `isolate` traps Leaflet's internal z-indexes (its panes and controls climb
  // as high as 1000) inside their own stacking context, so drawers, modals and
  // cards elsewhere on the page still layer above the map.
  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom
      className="isolate z-0 size-full [&_.leaflet-container]:font-sans"
      style={{ background: "var(--muted)" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController
        listings={listings}
        selectedId={selectedId}
        center={center}
      />

      {listings.map((listing) => (
        <Marker
          key={listing.id}
          position={[listing.lat, listing.lng]}
          icon={icons.get(listing.id)}
          eventHandlers={{ click: () => onSelect(listing.id) }}
          zIndexOffset={listing.id === selectedId ? 1000 : 0}
        />
      ))}
    </MapContainer>
  );
}
