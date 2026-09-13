"use client";

import { memo, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import L from "leaflet";
import Supercluster from "supercluster";
import { ArrowLeft, BedDouble, MapPin, PenLine, Ruler, X } from "lucide-react";
import {
  MapContainer,
  Marker,
  Polygon,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import { useEstateMapMarker } from "@/app/properties/_hooks/use-estate-map-points";
import type { EstateMapPoint } from "@/app/properties/_mappers/estate-map.mapper";
import type { AreaVertex } from "@/app/properties/_lib/map-area";
import apartmentImage from "@/assets/images/card/apartman.webp";
import { ApiImage } from "@/components/shared/api-image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { cityCenters } from "@/data/search";

/*
 * The map used to draw a price bubble for every file, and over a city with
 * five thousand of them that was a sheet of bubbles with no map under it.
 * Now the points are clustered in the browser (supercluster, a few
 * milliseconds for the whole set): at city zoom a district is one red
 * circle with its count, a click flies into it and the circle breaks into
 * smaller ones, and from `CLUSTER_MAX_ZOOM + 1` up the individual pins
 * appear. Pinching does the same thing the clicks do, because the layer is
 * recomputed from the viewport on every move.
 */

/**
 * Cluster radius in screen pixels. Measured on the live set: at city zoom
 * this gives a few dozen circles, the biggest in the hundreds; 64 gave
 * half as many again and 100 merged districts that read as separate.
 */
const CLUSTER_RADIUS = 80;
/** Clusters exist up to this zoom; one level further in, pins. */
const CLUSTER_MAX_ZOOM = 15;
/** How far a cluster click may zoom in one go. */
const CLICK_MAX_ZOOM = 17;
/** Where a row clicked in the list lands: close enough that its pin shows. */
const FOCUS_ZOOM = 16;
const TILE_MAX_ZOOM = 19;
const NO_INSET: MapInset = {};

type PointProperties = { id: string; pinLabel: string };
type PointFeature = Supercluster.PointFeature<PointProperties>;
type ClusterFeature = Supercluster.ClusterFeature<Supercluster.AnyProps>;
type ClusterOrPoint = ClusterFeature | PointFeature;

/** supercluster marks its clusters with `cluster: true`; everything else is a point. */
function isCluster(feature: ClusterOrPoint): feature is ClusterFeature {
  return (feature.properties as { cluster?: boolean }).cluster === true;
}

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
function priceIcon(pinLabel: string, active: boolean) {
  // The brand's secondary for every pin; the selected one flips to the
  // primary so it stands out from its neighbours instead of blending in.
  const className = active
    ? "bg-primary text-primary-foreground border-primary"
    : "bg-secondary text-secondary-foreground border-secondary hover:border-primary";

  return L.divIcon({
    className: "!bg-transparent !border-0",
    html: `<span class="inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 font-heading text-[11px] font-bold shadow-md transition-colors ${className}">${escapeHtml(pinLabel)}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

/**
 * A circle in the brand colour with the count in it, larger for larger
 * clusters — the size is the second thing the eye reads after the number,
 * so 600 files are a visibly bigger circle than 6.
 */
function clusterIcon(count: number) {
  const size = count >= 1000 ? 60 : count >= 100 ? 52 : count >= 10 ? 44 : 36;
  const text = count >= 100 ? "text-sm" : "text-[13px]";

  return L.divIcon({
    className: "!bg-transparent !border-0",
    // Theme tokens only: the built-in palette is switched off in this
    // project, so a `bg-red-600` here would render as nothing at all.
    html: `<span class="flex size-full cursor-pointer items-center justify-center rounded-full bg-secondary font-heading ${text} font-bold text-secondary-foreground shadow-lg ring-6 ring-secondary/30 transition-transform hover:scale-105">${count.toLocaleString("fa-IR")}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/**
 * The box the map opens on: where the bulk of the points are, not where all
 * of them are. The 3rd to 97th percentile of latitudes and longitudes
 * covers the city and its suburbs; the handful of files geotagged in a
 * village forty kilometres out — or in another province — are still drawn,
 * but they no longer zoom the opening view out to a region map on which
 * the city is a smudge.
 */
const TRIM = 0.03;

function bulkBounds(points: EstateMapPoint[]): L.LatLngBounds | null {
  if (points.length === 0) return null;
  const lats = points.map((point) => point.lat).sort((a, b) => a - b);
  const lngs = points.map((point) => point.lng).sort((a, b) => a - b);
  const low = Math.floor((points.length - 1) * TRIM);
  const high = Math.ceil((points.length - 1) * (1 - TRIM));
  return L.latLngBounds([lats[low], lngs[low]], [lats[high], lngs[high]]);
}

/**
 * What covers the map's edges: a toolbar over the top, and on a phone the
 * results sheet over the bottom half. The opening view is fitted into what
 * is left, or the city would open half-hidden under the sheet.
 */
export type MapInset = {
  /** Pixels covered along the top. */
  top?: number;
  /** Share of the map's height covered along the bottom, 0–1. */
  bottomFraction?: number;
};

const FIT_MARGIN = 24;

/** Fits the city's points when they arrive; flies to a row picked in the list. */
function ViewportController({
  points,
  center,
  focus,
  inset,
}: {
  points: EstateMapPoint[];
  center: [number, number];
  focus: { id: string; n: number } | null;
  inset: MapInset;
}) {
  const map = useMap();

  useEffect(() => {
    const bounds = bulkBounds(points);
    if (!bounds || !bounds.isValid()) {
      map.setView(center, 12);
      return;
    }
    const covered = Math.round(map.getSize().y * (inset.bottomFraction ?? 0));
    map.fitBounds(bounds, {
      paddingTopLeft: [FIT_MARGIN, (inset.top ?? 0) + FIT_MARGIN],
      paddingBottomRight: [FIT_MARGIN, covered + FIT_MARGIN],
      maxZoom: 15,
    });
  }, [points, map, center, inset]);

  useEffect(() => {
    if (!focus) return;
    const point = points.find((item) => item.id === focus.id);
    if (!point) return;
    map.flyTo([point.lat, point.lng], Math.max(map.getZoom(), FOCUS_ZOOM), {
      duration: 0.7,
    });
    // Only a new pick moves the map; the point list changing must not.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, map]);

  return null;
}

/**
 * The clusters and pins for the current viewport, recomputed on every move.
 *
 * The bounding box is padded by a fifth of the view so circles near the
 * edge are already there when they slide in, and the zoom is floored
 * because supercluster's index is built per integer zoom.
 */
function ClusterLayer({
  index,
  selectedId,
  onSelect,
  onInViewChange,
}: {
  index: Supercluster<PointProperties>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onInViewChange: (count: number) => void;
}) {
  const map = useMap();
  const [viewport, setViewport] = useState(() => readViewport(map));

  useMapEvents({
    moveend: () => setViewport(readViewport(map)),
    zoomend: () => setViewport(readViewport(map)),
  });

  const features = useMemo(
    () => index.getClusters(viewport.bbox, viewport.zoom) as ClusterOrPoint[],
    [index, viewport],
  );

  // What is on screen, for the pill: the exact viewport rather than the
  // padded one the layer draws for.
  useEffect(() => {
    const onScreen = index.getClusters(
      viewport.exactBbox,
      viewport.zoom,
    ) as ClusterOrPoint[];
    onInViewChange(
      onScreen.reduce(
        (sum, feature) =>
          sum + (isCluster(feature) ? feature.properties.point_count : 1),
        0,
      ),
    );
  }, [index, viewport, onInViewChange]);

  return (
    <>
      {features.map((feature) => {
        const [lng, lat] = feature.geometry.coordinates;

        if (isCluster(feature)) {
          const clusterId = feature.properties.cluster_id;
          const count = feature.properties.point_count;
          return (
            <ClusterMarker
              key={`cluster-${clusterId}`}
              lat={lat}
              lng={lng}
              count={count}
              onClick={() => {
                const target = Math.min(
                  index.getClusterExpansionZoom(clusterId),
                  CLICK_MAX_ZOOM,
                );
                map.flyTo([lat, lng], target, { duration: 0.7 });
              }}
            />
          );
        }

        const { id, pinLabel } = feature.properties;
        return (
          <PointMarker
            key={id}
            id={id}
            lat={lat}
            lng={lng}
            pinLabel={pinLabel}
            active={id === selectedId}
            onSelect={onSelect}
          />
        );
      })}
    </>
  );
}

function readViewport(map: L.Map) {
  const exact = map.getBounds();
  const padded = exact.pad(0.2);
  const toBbox = (bounds: L.LatLngBounds): [number, number, number, number] => [
    bounds.getWest(),
    bounds.getSouth(),
    bounds.getEast(),
    bounds.getNorth(),
  ];
  return {
    zoom: Math.floor(map.getZoom()),
    bbox: toBbox(padded),
    exactBbox: toBbox(exact),
  };
}

const ClusterMarker = memo(function ClusterMarker({
  lat,
  lng,
  count,
  onClick,
}: {
  lat: number;
  lng: number;
  count: number;
  onClick: () => void;
}) {
  const icon = useMemo(() => clusterIcon(count), [count]);
  return (
    <Marker
      position={[lat, lng]}
      icon={icon}
      eventHandlers={{ click: onClick }}
      keyboard={false}
      alt={`${count.toLocaleString("fa-IR")} آگهی در این محدوده`}
    />
  );
});

/**
 * One pin.
 *
 * Memoised because Leaflet redraws a marker whose icon identity changes:
 * only the two pins whose `active` actually flipped do any work when the
 * selection moves. The popup is a small card fetched when it opens — the
 * point set carries only what the pin needs.
 */
const PointMarker = memo(function PointMarker({
  id,
  lat,
  lng,
  pinLabel,
  active,
  onSelect,
}: {
  id: string;
  lat: number;
  lng: number;
  pinLabel: string;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const icon = useMemo(() => priceIcon(pinLabel, active), [pinLabel, active]);

  return (
    <Marker
      position={[lat, lng]}
      icon={icon}
      eventHandlers={{ click: () => onSelect(id) }}
      zIndexOffset={active ? 1000 : 0}
    >
      <Popup className="listing-popup" closeButton={false} offset={[0, -6]}>
        <MarkerPopupCard id={id} />
      </Popup>
    </Marker>
  );
});

/** Fetched when the popup opens; react-leaflet mounts popup children then. */
function MarkerPopupCard({ id }: { id: string }) {
  const marker = useEstateMapMarker(id);

  if (marker.isPending) {
    return (
      <div dir="rtl" className="w-60 overflow-hidden rounded-2xl bg-card">
        <Skeleton className="aspect-[16/10] w-full rounded-none" />
        <div className="flex flex-col gap-2 p-3">
          <Skeleton className="h-3.5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3.5 w-1/3" />
        </div>
      </div>
    );
  }

  if (marker.isError || !marker.data) {
    return (
      <div
        dir="rtl"
        className="w-60 p-3 font-sans text-xs text-muted-foreground"
      >
        جزئیات این آگهی در دسترس نیست.
      </div>
    );
  }

  const item = marker.data;
  return (
    <Link
      href={item.href}
      dir="rtl"
      className="block w-60 overflow-hidden rounded-2xl bg-card font-sans text-foreground no-underline hover:no-underline"
    >
      <span className="relative block aspect-[16/10] w-full overflow-hidden bg-muted">
        {item.coverImage ? (
          // With a bundled fallback: some older files' photos are gone from
          // both media hosts, and a broken-image glyph is no first impression.
          <ApiImage
            src={item.coverImage}
            fallbackSrc={apartmentImage}
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
          {item.dealType === "rent" ? "رهن و اجاره" : "فروش"} ·{" "}
          {item.estateTypeLabel}
        </span>
      </span>

      <span className="flex flex-col gap-1.5 p-3">
        <span className="line-clamp-1 font-heading text-[13px] font-semibold">
          {item.title}
        </span>
        <span className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
          <MapPin className="size-3 shrink-0 text-brand/70" />
          {item.place}
        </span>
        <span className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Ruler className="size-3 text-brand/70" />
            {item.area.toLocaleString("fa-IR")} متر
          </span>
          {item.roomLabel && (
            <span className="flex items-center gap-1">
              <BedDouble className="size-3 text-brand/70" />
              {item.roomLabel} خواب
            </span>
          )}
        </span>
        <span className="mt-1 flex items-center justify-between gap-2">
          <span className="font-heading text-xs font-bold text-brand">
            {item.priceLabel}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
            جزئیات
            <ArrowLeft className="size-3" />
          </span>
        </span>
      </span>
    </Link>
  );
}

/**
 * Freehand drawing: while it is on, the map stops panning and the pointer
 * draws instead — press, drag around the neighbourhood, release. The trail
 * is simplified in screen space (Douglas–Peucker, a 4px tolerance) so a
 * shaky hand does not become two hundred vertices in the query string, and
 * closed into a polygon on release. Fewer than three vertices is a tap, not
 * a shape, and is ignored.
 */
const SIMPLIFY_TOLERANCE_PX = 4;
const MIN_STEP_PX = 3;

function DrawLayer({
  active,
  onDrawn,
}: {
  active: boolean;
  onDrawn: (ring: AreaVertex[]) => void;
}) {
  const map = useMap();
  const [draft, setDraft] = useState<L.LatLng[]>([]);

  useEffect(() => {
    if (!active) return;

    const container = map.getContainer();
    const handlers = [
      map.dragging,
      map.touchZoom,
      map.doubleClickZoom,
      map.scrollWheelZoom,
      map.boxZoom,
      map.keyboard,
    ];
    const wasEnabled = handlers.map((handler) => handler.enabled());
    handlers.forEach((handler) => handler.disable());
    map.closePopup();
    const previousCursor = container.style.cursor;
    const previousTouchAction = container.style.touchAction;
    container.style.cursor = "crosshair";
    container.style.touchAction = "none";

    let drawing = false;
    let trail: L.LatLng[] = [];
    let lastPoint: L.Point | null = null;

    const down = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      event.preventDefault();
      drawing = true;
      trail = [map.mouseEventToLatLng(event)];
      lastPoint = map.mouseEventToContainerPoint(event);
      container.setPointerCapture(event.pointerId);
      setDraft(trail.slice());
    };
    const move = (event: PointerEvent) => {
      if (!drawing) return;
      event.preventDefault();
      const point = map.mouseEventToContainerPoint(event);
      if (lastPoint && point.distanceTo(lastPoint) < MIN_STEP_PX) return;
      lastPoint = point;
      trail.push(map.mouseEventToLatLng(event));
      setDraft(trail.slice());
    };
    const up = (event: PointerEvent) => {
      if (!drawing) return;
      drawing = false;
      if (container.hasPointerCapture(event.pointerId)) {
        container.releasePointerCapture(event.pointerId);
      }
      const simplified = L.LineUtil.simplify(
        trail.map((latlng) => map.latLngToContainerPoint(latlng)),
        SIMPLIFY_TOLERANCE_PX,
      ).map((point) => map.containerPointToLatLng(point));
      setDraft([]);
      if (simplified.length >= 3) {
        onDrawn(simplified.map((latlng) => [latlng.lat, latlng.lng]));
      }
    };

    container.addEventListener("pointerdown", down);
    container.addEventListener("pointermove", move);
    container.addEventListener("pointerup", up);
    container.addEventListener("pointercancel", up);

    return () => {
      container.removeEventListener("pointerdown", down);
      container.removeEventListener("pointermove", move);
      container.removeEventListener("pointerup", up);
      container.removeEventListener("pointercancel", up);
      handlers.forEach((handler, index) => {
        if (wasEnabled[index]) handler.enable();
      });
      container.style.cursor = previousCursor;
      container.style.touchAction = previousTouchAction;
      setDraft([]);
    };
  }, [active, map, onDrawn]);

  if (draft.length < 2) return null;
  return (
    <Polyline
      positions={draft}
      pathOptions={{
        className: "stroke-primary",
        weight: 3,
        dashArray: "6 6",
        fill: false,
      }}
      interactive={false}
    />
  );
}

/**
 * Memoised: the search view rebuilds this element on every keystroke in the
 * filter bar, and re-rendering it walks the whole point set.
 */
export const ListingsMap = memo(function ListingsMap({
  points,
  city,
  selectedId,
  onSelect,
  focus = null,
  inset = NO_INSET,
  area,
  onAreaChange,
  onInViewChange,
}: {
  points: EstateMapPoint[];
  city: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** A row clicked in the list — the map flies to its pin. */
  focus?: { id: string; n: number } | null;
  inset?: MapInset;
  /** The area drawn with «ترسیم محدوده», or none. */
  area: AreaVertex[] | null;
  onAreaChange: (area: AreaVertex[] | null) => void;
  /**
   * How many files the viewport holds, live — the clusters' counts added
   * up. The layouts show it beside the result count, where the visitor is
   * already looking, rather than as a badge over the map.
   */
  onInViewChange: (count: number) => void;
}) {
  const center = cityCenters[city] ?? cityCenters["قم"];
  const [drawing, setDrawing] = useState(false);
  const controlsTop = (inset.top ?? 0) + 12;

  const index = useMemo(() => {
    const supercluster = new Supercluster<PointProperties>({
      radius: CLUSTER_RADIUS,
      maxZoom: CLUSTER_MAX_ZOOM,
      minPoints: 2,
    });
    supercluster.load(
      points.map((point): PointFeature => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [point.lng, point.lat] },
        properties: { id: point.id, pinLabel: point.pinLabel },
      })),
    );
    return supercluster;
  }, [points]);

  // `isolate` traps Leaflet's internal z-indexes (its panes and controls climb
  // as high as 1000) inside their own stacking context, so drawers, modals and
  // cards elsewhere on the page still layer above the map.
  return (
    <div className="relative size-full">
      <MapContainer
        center={center}
        zoom={12}
        maxZoom={TILE_MAX_ZOOM}
        scrollWheelZoom
        className="isolate z-0 size-full [&_.leaflet-container]:font-sans"
        style={{ background: "var(--muted)" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={TILE_MAX_ZOOM}
        />

        <ViewportController
          points={points}
          center={center}
          focus={focus}
          inset={inset}
        />

        <ClusterLayer
          index={index}
          selectedId={selectedId}
          onSelect={onSelect}
          onInViewChange={onInViewChange}
        />

        {area && (
          <Polygon
            positions={area}
            pathOptions={{
              className: "stroke-primary fill-primary",
              weight: 2,
              fillOpacity: 0.08,
            }}
            interactive={false}
          />
        )}

        <DrawLayer
          active={drawing}
          onDrawn={(ring) => {
            setDrawing(false);
            onAreaChange(ring);
          }}
        />
      </MapContainer>

      {/* «ترسیم محدوده»: draw, and while drawing the one line of guidance
          the tool needs; with an area on, the way to drop it. Placed on the
          start side, clear of Leaflet's zoom control on the other. */}
      <div
        className="absolute start-3 z-20 flex flex-col items-end gap-2"
        style={{ top: controlsTop }}
      >
        {drawing ? (
          <div className="flex max-w-xs items-center gap-2 rounded-xl border border-primary/30 bg-card/95 p-2 ps-3 shadow-lg backdrop-blur">
            <PenLine className="size-4 shrink-0 text-primary" />
            <Typography variant="small" className="text-foreground">
              دور محدوده‌ای می‌خواهید آگهی‌های املاک را در آن ببینید، خط بکشید
            </Typography>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setDrawing(false)}
            >
              انصراف
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {area && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onAreaChange(null)}
                className="bg-card/95 shadow-md backdrop-blur"
              >
                <X data-icon="inline-start" />
                حذف محدوده
              </Button>
            )}
            <Button
              type="button"
              variant={area ? "outline" : "default"}
              size="sm"
              onClick={() => setDrawing(true)}
              className={
                area ? "bg-card/95 shadow-md backdrop-blur" : "shadow-md"
              }
            >
              <PenLine data-icon="inline-start" />
              {area ? "ترسیم دوباره" : "ترسیم محدوده"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
});
