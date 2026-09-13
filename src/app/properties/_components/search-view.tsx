"use client";

import {
  Fragment,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, RotateCcw, SlidersHorizontal, X } from "lucide-react";

import apartmentImage from "@/assets/images/card/apartman.webp";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { ApiImage } from "@/components/shared/api-image";
import { Container } from "@/components/layout/container";
import { PropertyCard } from "@/components/features/property/property-card";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import {
  type SearchFilters,
  countActiveFilters,
  defaultFilters,
} from "@/data/search";
import { useMediaQuery } from "@/lib/use-media-query";
import { routes } from "@/lib/routes";
import { useQueryClient } from "@tanstack/react-query";

import { useEstateFilters } from "@/app/_lookups/_hooks/use-lookups";
import { estateSearchQueryKeys } from "@/app/properties/_constants/estate-search-query-keys";
import { useEstateSearch } from "@/app/properties/_hooks/use-estate-search";
import {
  useEstateMapMarker,
  useEstateMapPoints,
} from "@/app/properties/_hooks/use-estate-map-points";
import { mapFiltersToSearchParams } from "@/app/properties/_mappers/estate-search.mapper";

import { ActiveFilters } from "./active-filters";
import { FiltersPanel } from "./filters-panel";
import { ListingRow } from "./listing-row";
import { MapPromo } from "./map-promo";
import { MapToggleButton } from "./map-toggle-button";
import {
  MobileMapView,
  SHEET_FULL,
  SHEET_SPLIT,
  type SheetSnap,
} from "./mobile-map-view";
import type { MapInset } from "./listings-map";
import { LoadMoreSentinel } from "./load-more-sentinel";
import { EmptyState, ErrorState, ResultsSkeleton } from "./result-states";
import { SearchToolbar } from "./search-toolbar";

// Leaflet touches `window` at import time, so it can only load in the browser.
const ListingsMap = dynamic(
  () => import("./listings-map").then((mod) => mod.ListingsMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex size-full items-center justify-center bg-muted">
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    ),
  },
);

type Status = "loading" | "ready" | "error";
type ViewMode = "grid" | "map";

/** The toolbar floating over the map's top edge, with its offset. */
const DESKTOP_MAP_INSET: MapInset = { top: 72 };
/** The search bar over the top and the results sheet at its half stop. */
const PHONE_MAP_INSET: MapInset = { top: 72, bottomFraction: SHEET_SPLIT };

export function SearchView({
  cityName,
  initialFilters,
  initialView = "grid",
}: {
  cityName: string;
  initialFilters: SearchFilters;
  /** The list unless the link asked for the map (`?view=map`). */
  initialView?: ViewMode;
}) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [view, setView] = useState<ViewMode>(initialView);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  /**
   * The last pin *clicked on the map*, as opposed to a row hovered in the
   * list: only that scrolls the middle column, and when the pinned file is
   * not among the loaded rows it is shown at the top instead. A counter, so
   * clicking the same pin twice scrolls twice.
   */
  const [mapPick, setMapPick] = useState<{ id: string; n: number } | null>(
    null,
  );
  const resultsColumn = useRef<HTMLDivElement>(null);
  const pickFromMap = useCallback((id: string) => {
    setSelectedId(id);
    setMapPick((current) => ({ id, n: (current?.n ?? 0) + 1 }));
  }, []);
  /** Files inside the map's viewport right now — the clusters added up. */
  const [inView, setInView] = useState<number | null>(null);
  /** A row clicked in the middle column: the map flies to that pin. */
  const [mapFocus, setMapFocus] = useState<{ id: string; n: number } | null>(
    null,
  );
  const focusOnMap = useCallback((id: string) => {
    setSelectedId(id);
    setMapFocus((current) => ({ id, n: (current?.n ?? 0) + 1 }));
  }, []);
  // On a phone the results sheet opens full — the list is the page, and the
  // map is a swipe down away — unless the map is what was asked for.
  const [sheetSnap, setSheetSnap] = useState<SheetSnap>(
    initialView === "map" ? SHEET_SPLIT : SHEET_FULL,
  );
  const isDesktop = useMediaQuery("(min-width: 64rem)");
  const pathname = usePathname();
  const requestedCityId = Number(filters.cityId) || undefined;
  const lookupsQuery = useEstateFilters(requestedCityId);
  const lookups = lookupsQuery.data?.result;
  const deferredFilters = useDeferredValue(filters);
  const apiParams = useMemo(
    () => mapFiltersToSearchParams(deferredFilters, lookups),
    [deferredFilters, lookups],
  );
  const searchQuery = useEstateSearch({ ...apiParams, per_page: 12 });
  // Every point of the result set, compact; the map clusters them itself.
  const mapQuery = useEstateMapPoints(apiParams, {
    enabled: !isDesktop || view === "map",
  });
  // A server without the compact format sent full markers: their details
  // are seeded into the per-marker cache so popups open without a request.
  const queryClient = useQueryClient();
  const legacyMarkers = mapQuery.data?.legacyMarkers;
  useEffect(() => {
    for (const marker of legacyMarkers ?? []) {
      queryClient.setQueryData(
        estateSearchQueryKeys.mapMarker(marker.id),
        marker,
      );
    }
  }, [legacyMarkers, queryClient]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ownedKeys = [
      "deal",
      "propertyTypes",
      "district",
      "districtTitle",
      "code",
      "amenities",
      "minPrice",
      "maxPrice",
      "minRent",
      "maxRent",
      "type",
      "id",
      "estateTypes",
      "city_id",
      "districts",
      "areas",
      "q",
      "room_count",
      "minArea",
      "maxArea",
      "price",
      "mortgage",
      "rahn",
      "rent",
      "built_year",
      "has_photo",
      "has_video",
      "vr",
      "has_agent",
      "sort",
      "page",
    ];
    ownedKeys.forEach((key) => params.delete(key));

    const set = (key: string, value: string | undefined) => {
      if (value) params.set(key, value);
    };
    const range = (min: string, max: string) =>
      min || max ? `${min},${max}` : undefined;

    params.set("type", deferredFilters.deal === "rent" ? "2" : "1");
    set("id", deferredFilters.code.trim());
    set("estateTypes", deferredFilters.types.join(","));
    set("city_id", deferredFilters.cityId);
    set("districts", deferredFilters.districtIds.join(","));
    set("areas", deferredFilters.areas.join(","));
    set("q", deferredFilters.query.trim());
    set("room_count", deferredFilters.minRooms);
    set("minArea", deferredFilters.minArea);
    set("maxArea", deferredFilters.maxArea);
    set(
      deferredFilters.deal === "rent" ? "mortgage" : "price",
      range(deferredFilters.minPrice, deferredFilters.maxPrice),
    );
    if (deferredFilters.deal === "rent") {
      set("rent", range(deferredFilters.minRent, deferredFilters.maxRent));
    }
    set("built_year", deferredFilters.buildingAge);
    if (deferredFilters.hasPhotos) params.set("has_photo", "1");
    if (deferredFilters.hasVideo) params.set("has_video", "1");
    if (deferredFilters.hasVirtualTour) params.set("vr", "1");
    if (deferredFilters.hasAgent) params.set("has_agent", "1");
    if (deferredFilters.sort !== defaultFilters.sort) {
      params.set("sort", deferredFilters.sort);
    }

    const search = params.toString();
    const nextUrl = search ? `${pathname}?${search}` : pathname;
    if (`${window.location.pathname}${window.location.search}` !== nextUrl) {
      // Deliberately not `router.replace`. This route reads `searchParams`, so
      // that asked the server for a fresh RSC payload and re-rendered the whole
      // page on every filter change — on every keystroke in the search field —
      // for a URL nobody navigated to. `replaceState` is the shallow update
      // Next supports for exactly this; the results come from React Query.
      window.history.replaceState(null, "", nextUrl);
    }
  }, [deferredFilters, pathname]);
  const results = useMemo(
    () => searchQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [searchQuery.data],
  );
  const total = searchQuery.data?.pages[0]?.total ?? 0;
  const selectedDistrictNames = filters.districtIds
    .map(
      (districtId) =>
        lookups?.districts.items.find((item) => item.value === districtId)
          ?.title,
    )
    .filter(Boolean)
    .join("، ");
  const status: Status = searchQuery.isPending
    ? "loading"
    : searchQuery.isError
      ? "error"
      : "ready";

  const activeCount = countActiveFilters(filters);

  const updateFilters = useCallback((patch: Partial<SearchFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters((current) => ({
      ...defaultFilters,
      // Deal type and city frame the search rather than narrow it, so
      // "clear filters" keeps the visitor where they are.
      deal: current.deal,
      city: current.city,
      cityId: current.cityId,
      sort: current.sort,
    }));
  }, []);

  const toggleView = useCallback(() => {
    setView((current) => (current === "map" ? "grid" : "map"));
    setSheetSnap(SHEET_SPLIT);
  }, []);

  const retry = useCallback(() => void searchQuery.refetch(), [searchQuery]);

  useEffect(() => {
    if (!mapPick) return;
    const row = resultsColumn.current?.querySelector<HTMLElement>(
      `[data-listing-id="${CSS.escape(mapPick.id)}"]`,
    );
    row?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [mapPick]);

  const countLabel = `${total.toLocaleString("fa-IR")} آگهی`;
  const points = mapQuery.data?.points ?? [];
  const pickedId =
    mapPick && !results.some((listing) => listing.id === mapPick.id)
      ? mapPick.id
      : null;
  const map = mapQuery.isPending ? (
    <div className="flex size-full items-center justify-center bg-muted">
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  ) : mapQuery.isError ? (
    <div className="flex size-full items-center justify-center bg-muted p-6">
      <ErrorState onRetry={() => void mapQuery.refetch()} />
    </div>
  ) : mapQuery.data.total > 0 && points.length === 0 ? (
      <div className="flex size-full items-center justify-center bg-muted p-6 text-center">
        <Typography variant="muted" className="max-w-sm">
          هیچ‌کدام از آگهی‌های این جست‌وجو مختصات قابل نمایش ندارند.
        </Typography>
      </div>
    ) : (
      <ListingsMap
        points={points}
        city={filters.city}
        selectedId={selectedId}
        onSelect={pickFromMap}
        focus={mapFocus}
        inset={isDesktop ? DESKTOP_MAP_INSET : PHONE_MAP_INSET}
        onInViewChange={setInView}
      />
    );
  // Read as «۴۹۶ آگهی در این محدوده‌ی نقشه»; climbs and falls with the zoom.
  const inViewLabel =
    inView !== null && mapQuery.isSuccess
      ? `${inView.toLocaleString("fa-IR")} آگهی در محدوده‌ی نقشه`
      : null;

  const filtersSidebar = (
    <div className="rounded-2xl border bg-card">
      <div className="flex items-center justify-between gap-2 border-b p-4">
        <Typography as="h2" variant="h4" className="flex items-center gap-1.5">
          <SlidersHorizontal className="size-4 text-brand" />
          فیلترها
        </Typography>
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="xs"
            onClick={resetFilters}
            className="text-muted-foreground hover:text-destructive"
          >
            <RotateCcw />
            پاک کردن
          </Button>
        )}
      </div>
      <div className="overflow-y-auto p-4">
        <FiltersPanel
          filters={filters}
          onChange={updateFilters}
          lookups={lookups}
          lookupsLoading={lookupsQuery.isPending}
        />
      </div>
    </div>
  );

  const drawer = (
    <Drawer
      open={filtersOpen}
      onOpenChange={setFiltersOpen}
      showSwipeHandle
      // A single full-height snap point: filtering is a focused task, so the
      // sheet takes the whole screen and swipes straight back down to close.
      snapPoints={[1]}
    >
      <DrawerContent className="lg:hidden">
        <DrawerHeader className="flex-row items-center justify-between">
          <DrawerTitle>فیلترها</DrawerTitle>
          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="xs"
              onClick={resetFilters}
              className="text-muted-foreground hover:text-destructive"
            >
              <RotateCcw />
              پاک کردن همه
            </Button>
          )}
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <FiltersPanel
            filters={filters}
            onChange={updateFilters}
            showDealType
            lookups={lookups}
            lookupsLoading={lookupsQuery.isPending}
          />
        </div>

        <DrawerFooter>
          <Button onClick={() => setFiltersOpen(false)}>
            نمایش {total.toLocaleString("fa-IR")} آگهی
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );

  // Phones get one experience only: the map with its results sheet, where the
  // swipe handle already covers everything a grid/map switch used to. Leaflet
  // misbehaves in a `display:none` box, so this is a mount decision, not a
  // `lg:hidden` one.
  if (!isDesktop) {
    return (
      <>
        <MobileMapView
          filters={filters}
          inViewLabel={inViewLabel}
          onChange={updateFilters}
          activeCount={activeCount}
          onOpenFilters={() => setFiltersOpen(true)}
          onReset={resetFilters}
          onRetry={retry}
          status={status}
          results={results}
          total={total}
          hasMore={Boolean(searchQuery.hasNextPage)}
          isLoadingMore={searchQuery.isFetchingNextPage}
          onLoadMore={() => void searchQuery.fetchNextPage()}
          snap={sheetSnap}
          onSnapChange={setSheetSnap}
          map={map}
          lookups={lookups}
        />
        {drawer}
      </>
    );
  }

  return (
    <div className="py-section-sm">
      {/* The page header only makes sense in grid mode — map mode gives that
          vertical space to the map instead. */}
      {view === "grid" && (
        <Container className="mb-5">
          {/* No Container of its own: it already sits inside one here. */}
          <Breadcrumb
            inContainer={false}
            className="mb-4"
            items={[
              { label: "خانه", href: routes.home },
              { label: "جستجوی ملک", href: routes.properties() },
              { label: cityName },
            ]}
          />

          <div className="flex flex-col gap-1">
            <Typography as="h1" variant="h2">
              جستجوی ملک در {cityName}
            </Typography>
            <Typography variant="muted">
              فایل‌های بررسی‌شده خرید و اجاره را با فیلترهای دقیق پیدا کنید.
            </Typography>
          </div>
        </Container>
      )}

      {view === "map" ? (
        /*
         * Full-bleed: filters | results | map, each scrolling independently.
         * The map has no border/radius and no end-side gutter, so it runs flush
         * to the edge of the viewport.
         */
        <div className="flex h-[calc(100dvh-7rem)] w-full gap-3 border-t border-border ps-3">
            <aside className="w-72 shrink-0 overflow-y-auto">
              {filtersSidebar}
            </aside>

            <div
              ref={resultsColumn}
              className="mt-3 flex w-96 shrink-0 flex-col gap-3 overflow-y-auto py-1"
            >
              <div className="flex flex-col gap-0.5">
                <Typography as="h2" variant="h4">
                  {status === "ready" ? countLabel : "در حال جستجو…"}
                </Typography>
                {inViewLabel && (
                  <Typography variant="small" aria-live="polite">
                    {inViewLabel}
                  </Typography>
                )}
              </div>

              {/* A pin whose file is not among the loaded rows — the map holds
                  every point, the list a page at a time — is shown here, so
                  the click always lands on something. */}
              {pickedId && (
                <PickedMarkerCard
                  id={pickedId}
                  onDismiss={() => setMapPick(null)}
                />
              )}

              {status === "ready" &&
                results.map((listing) => (
                  <ListingRow
                    key={listing.id}
                    listing={listing}
                    active={listing.id === selectedId}
                    onHover={setSelectedId}
                    onSelect={focusOnMap}
                  />
                ))}
              {status === "ready" && results.length === 0 && (
                <EmptyState onReset={resetFilters} />
              )}
              {status === "ready" && (
                <LoadMoreSentinel
                  hasMore={Boolean(searchQuery.hasNextPage)}
                  loading={searchQuery.isFetchingNextPage}
                  onLoadMore={() => void searchQuery.fetchNextPage()}
                  skeleton={<ListingRowSkeleton count={3} />}
                />
              )}
            </div>

            <div className="relative mt-3 min-w-0 flex-1 overflow-hidden">
              <SearchToolbar
                filters={filters}
                onChange={updateFilters}
                activeCount={activeCount}
                onOpenFilters={() => setFiltersOpen(true)}
                className="absolute inset-x-3 top-3 z-30 bg-card/95 shadow-lg backdrop-blur-md"
                lookups={lookups}
              />

              {status === "error" ? (
                <div className="flex size-full items-center justify-center p-6">
                  <ErrorState onRetry={retry} />
                </div>
              ) : (
                map
              )}
            </div>
        </div>
      ) : (
        <Container>
          <div className="flex flex-col gap-4">
            <SearchToolbar
              filters={filters}
              onChange={updateFilters}
              activeCount={activeCount}
              onOpenFilters={() => setFiltersOpen(true)}
              lookups={lookups}
            />

            <div className="grid gap-6 lg:grid-cols-[19rem_1fr] lg:items-start">
              <aside className="hidden lg:sticky lg:top-24 lg:block">
                {filtersSidebar}
              </aside>

              <div className="flex min-w-0 flex-col gap-4">
                <Typography variant="muted" className="text-[13px]">
                  {status === "loading" ? (
                    "در حال جستجو…"
                  ) : status === "error" ? (
                    "نتیجه‌ای در دسترس نیست"
                  ) : (
                    <>
                      <span className="font-bold text-foreground">
                        {total.toLocaleString("fa-IR")}
                      </span>{" "}
                      آگهی در {filters.city}
                      {selectedDistrictNames ? `، ${selectedDistrictNames}` : ""}
                    </>
                  )}
                </Typography>

                <ActiveFilters
                  filters={filters}
                  onChange={updateFilters}
                  onReset={resetFilters}
                  lookups={lookups}
                />

                {status === "loading" && <ResultsSkeleton />}

                {status === "error" && <ErrorState onRetry={retry} />}

                {status === "ready" && results.length === 0 && (
                  <EmptyState onReset={resetFilters} />
                )}

                {status === "ready" && results.length > 0 && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {results.map((listing, index) => (
                        <Fragment key={listing.id}>
                          <PropertyCard estate={listing} />
                          {/* Slotted after the first full row, where interest is highest */}
                          {index === 2 && (
                            <MapPromo
                              count={total}
                              city={filters.city}
                              onOpen={toggleView}
                            />
                          )}
                        </Fragment>
                      ))}
                    </div>

                    <LoadMoreSentinel
                      hasMore={Boolean(searchQuery.hasNextPage)}
                      loading={searchQuery.isFetchingNextPage}
                      onLoadMore={() => void searchQuery.fetchNextPage()}
                      skeleton={<ResultsSkeleton count={3} />}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </Container>
      )}

      <MapToggleButton active={view === "map"} onClick={toggleView} />
    </div>
  );
}

/** The map's pick, as a row, when the list has not loaded that file yet. */
function PickedMarkerCard({
  id,
  onDismiss,
}: {
  id: string;
  onDismiss: () => void;
}) {
  const query = useEstateMapMarker(id);
  const marker = query.data;

  if (!marker) {
    return (
      <div
        aria-busy={query.isPending}
        className="rounded-2xl border border-brand bg-card p-2.5 ring-1 ring-brand/30"
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <Typography variant="small" className="flex items-center gap-1.5">
            <MapPin className="size-3.5 text-brand" />
            انتخاب‌شده روی نقشه
          </Typography>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="بستن"
            onClick={onDismiss}
          >
            <X className="size-4" />
          </Button>
        </div>
        {query.isError ? (
          <Typography variant="small">جزئیات این آگهی در دسترس نیست.</Typography>
        ) : (
          <div className="flex gap-3">
            <Skeleton className="size-24 shrink-0 rounded-xl" />
            <div className="flex min-w-0 flex-1 flex-col gap-2 py-1">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="mt-auto h-3.5 w-1/3" />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-brand bg-card p-2.5 ring-1 ring-brand/30">
      <div className="mb-2 flex items-center justify-between gap-2">
        <Typography variant="small" className="flex items-center gap-1.5">
          <MapPin className="size-3.5 text-brand" />
          انتخاب‌شده روی نقشه
        </Typography>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="بستن"
          onClick={onDismiss}
        >
          <X className="size-4" />
        </Button>
      </div>
      <Link href={marker.href} className="flex gap-3">
        <span className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted">
          {marker.coverImage ? (
            <ApiImage
              src={marker.coverImage}
              fallbackSrc={apartmentImage}
              alt=""
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <Image
              src={apartmentImage}
              alt=""
              fill
              sizes="96px"
              className="object-cover"
            />
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="line-clamp-1 font-heading text-[13px] font-semibold">
            {marker.title}
          </span>
          <span className="truncate text-[11px] text-muted-foreground">
            {marker.place}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {marker.area.toLocaleString("fa-IR")} متر
            {marker.roomLabel ? ` · ${marker.roomLabel} خواب` : ""}
          </span>
          <span className="mt-auto font-heading text-xs font-bold text-brand dark:text-white">
            {marker.priceLabel}
          </span>
        </span>
      </Link>
    </div>
  );
}

/** The map column's row, as a placeholder, while the next page arrives. */
function ListingRowSkeleton({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          aria-hidden
          className="flex gap-3 rounded-2xl border bg-card p-2.5"
        >
          <Skeleton className="size-24 shrink-0 rounded-xl" />
          <div className="flex min-w-0 flex-1 flex-col gap-2 py-1">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-2/5" />
            <Skeleton className="mt-auto h-3.5 w-1/3" />
          </div>
        </div>
      ))}
    </>
  );
}
