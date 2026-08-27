"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import "leaflet/dist/leaflet.css";

import type { EstateMapMarker } from "@/app/properties/_mappers/estate-map.mapper";
import { cityCenters } from "@/data/search";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

/**
 * Price bubbles instead of Leaflet's default pin: the price is the thing a
 * house-hunter scans for, and it sidesteps the broken default-marker asset
 * paths that bundlers cause.
 */
function priceIcon(marker: EstateMapMarker, active: boolean) {
  const className = active
    ? "bg-secondary text-secondary-foreground border-secondary"
    : "bg-card text-foreground border-border hover:border-brand";

  return L.divIcon({
    className: "!bg-transparent !border-0",
    html: `<span class="inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 font-heading text-[11px] font-bold shadow-md transition-colors ${className}">${escapeHtml(marker.pinLabel)}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

/** Keeps the viewport in sync when the result set or the selection changes. */
function MapController({
  markers,
  selectedId,
  center,
}: {
  markers: EstateMapMarker[];
  selectedId: string | null;
  center: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    if (markers.length === 0) {
      map.setView(center, 12);
      return;
    }
    const bounds = L.latLngBounds(
      markers.map((marker) => [marker.lat, marker.lng] as [number, number])
    );
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
  }, [markers, map, center]);

  useEffect(() => {
    const selected = markers.find((marker) => marker.id === selectedId);
    if (selected) {
      map.panTo([selected.lat, selected.lng], { animate: true });
    }
  }, [selectedId, markers, map]);

  return null;
}

export function ListingsMap({
  markers,
  city,
  selectedId,
  onSelect,
}: {
  markers: EstateMapMarker[];
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
        markers.map((marker) => [
          marker.id,
          priceIcon(marker, marker.id === selectedId),
        ])
      ),
    [markers, selectedId]
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
        markers={markers}
        selectedId={selectedId}
        center={center}
      />

      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.lat, marker.lng]}
          icon={icons.get(marker.id)}
          eventHandlers={{ click: () => onSelect(marker.id) }}
          zIndexOffset={marker.id === selectedId ? 1000 : 0}
        >
          <Popup>
            <div dir="rtl" className="min-w-44 font-sans text-right">
              <Link href={marker.href} className="font-semibold text-brand">
                {marker.title}
              </Link>
              <div className="mt-1 text-xs text-muted-foreground">
                {marker.place} · {marker.area.toLocaleString("fa-IR")} متر
                {marker.roomLabel ? ` · ${marker.roomLabel} خواب` : ""}
              </div>
              <div className="mt-1 font-semibold">{marker.priceLabel}</div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
