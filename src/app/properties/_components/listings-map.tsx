"use client";

import { memo, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import L from "leaflet";
import { ArrowLeft, BedDouble, MapPin, Ruler } from "lucide-react";
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

/**
 * How far from the city centre a pin can be and still count as "in the
 * city" when the viewport is fitted: about half a degree, which covers Qom
 * and its outskirts. A file geotagged in another province — a wrong click on
 * the entry form — is still drawn, but it no longer zooms the map out to
 * show it, and the visitor lands on the city they searched.
 */
const CITY_REACH = { lat: 0.5, lng: 0.6 };

function nearCity(marker: EstateMapMarker, center: [number, number]) {
  return (
    Math.abs(marker.lat - center[0]) <= CITY_REACH.lat &&
    Math.abs(marker.lng - center[1]) <= CITY_REACH.lng
  );
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
    const inCity = markers.filter((marker) => nearCity(marker, center));
    if (inCity.length === 0) {
      map.setView(center, 12);
      return;
    }
    const bounds = L.latLngBounds(
      inCity.map((marker) => [marker.lat, marker.lng] as [number, number]),
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

/**
 * One pin.
 *
 * Split out and memoised because Leaflet redraws a marker whose icon identity
 * changes: building the icon map for the whole set in one `useMemo` keyed on
 * `selectedId` handed every marker a fresh `divIcon` each time the selection
 * moved, so tapping one pin re-rendered all of them. Here only the two markers
 * whose `active` actually flipped do any work.
 *
 * The popup is a small card — photo, title, place, size, price — rather than
 * three lines of text: it is the listing's first impression, and the photo
 * is most of what decides whether anyone clicks through.
 */
const ListingMarker = memo(function ListingMarker({
  marker,
  active,
  onSelect,
}: {
  marker: EstateMapMarker;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const icon = useMemo(() => priceIcon(marker, active), [marker, active]);

  return (
    <Marker
      position={[marker.lat, marker.lng]}
      icon={icon}
      eventHandlers={{ click: () => onSelect(marker.id) }}
      zIndexOffset={active ? 1000 : 0}
    >
      <Popup className="listing-popup" closeButton={false} offset={[0, -6]}>
        <Link
          href={marker.href}
          dir="rtl"
          className="block w-60 overflow-hidden rounded-2xl bg-card font-sans text-foreground no-underline hover:no-underline"
        >
          <span className="relative block aspect-[16/10] w-full overflow-hidden bg-muted">
            {marker.coverImage ? (
              <Image
                src={marker.coverImage}
                alt=""
                fill
                sizes="240px"
                className="object-cover"
              />
            ) : (
              <span className="flex size-full items-center justify-center text-muted-foreground">
                <MapPin className="size-6" />
              </span>
            )}
            <span className="absolute top-2 inset-s-2 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
              {marker.dealType === "rent" ? "رهن و اجاره" : "فروش"} ·{" "}
              {marker.estateTypeLabel}
            </span>
          </span>

          <span className="flex flex-col gap-1.5 p-3">
            <span className="line-clamp-1 font-heading text-[13px] font-semibold">
              {marker.title}
            </span>
            <span className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
              <MapPin className="size-3 shrink-0 text-brand/70" />
              {marker.place}
            </span>
            <span className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Ruler className="size-3 text-brand/70" />
                {marker.area.toLocaleString("fa-IR")} متر
              </span>
              {marker.roomLabel && (
                <span className="flex items-center gap-1">
                  <BedDouble className="size-3 text-brand/70" />
                  {marker.roomLabel} خواب
                </span>
              )}
            </span>
            <span className="mt-1 flex items-center justify-between gap-2">
              <span className="font-heading text-xs font-bold text-brand">
                {marker.priceLabel}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                جزئیات
                <ArrowLeft className="size-3" />
              </span>
            </span>
          </span>
        </Link>
      </Popup>
    </Marker>
  );
});

/**
 * Memoised: the search view rebuilds this element on every keystroke in the
 * filter bar, and re-rendering it walks the whole marker set.
 */
export const ListingsMap = memo(function ListingsMap({
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
        <ListingMarker
          key={marker.id}
          marker={marker}
          active={marker.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </MapContainer>
  );
});
