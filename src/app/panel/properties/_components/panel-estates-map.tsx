"use client";

import { useMemo } from "react";
import Link from "next/link";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import "leaflet/dist/leaflet.css";

import type { PanelEstateMapMarker } from "@/app/panel/properties/_schemas/panel-estates.schema";
import { Typography } from "@/components/ui/typography";
import { cityCenters } from "@/data/search";
import { routes } from "@/lib/routes";

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
 * The panel's own map pins.
 *
 * Deliberately not the public `ListingsMap`: that one renders a price bubble
 * built from separate price, area and type fields, and this endpoint returns a
 * single prepared `label` instead. Reusing it would mean inventing the fields
 * it wants, so this renders exactly what the API gives.
 */
function labelIcon(marker: PanelEstateMapMarker) {
  const text = marker.label || marker.title || String(marker.id);

  return L.divIcon({
    className: "!bg-transparent !border-0",
    html: `<span class="inline-flex whitespace-nowrap rounded-full border border-border bg-card px-2.5 py-1 font-heading text-[11px] font-bold text-foreground shadow-md">${escapeHtml(text)}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export function PanelEstatesMap({
  markers,
}: {
  markers: PanelEstateMapMarker[];
}) {
  const center = cityCenters["قم"];
  const icons = useMemo(
    () => new Map(markers.map((marker) => [marker.id, labelIcon(marker)])),
    [markers],
  );

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom
      className="h-[32rem] w-full rounded-2xl"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap"
      />
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.latitude, marker.longitude]}
          icon={icons.get(marker.id)}
        >
          <Popup>
            <Typography as="span" variant="small" className="font-medium">
              {marker.title || `فایل ${marker.id}`}
            </Typography>
            {marker.label && (
              <Typography variant="small" className="text-muted-foreground">
                {marker.label}
              </Typography>
            )}
            <Link
              href={routes.panel.property(marker.id)}
              className="mt-1 block text-brand"
            >
              مشاهده در پنل
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
