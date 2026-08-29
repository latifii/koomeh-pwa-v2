"use client";

import {
  Fragment,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { RotateCcw, SlidersHorizontal } from "lucide-react";

import { Breadcrumb } from "@/components/layout/breadcrumb";
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
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import {
  type SearchFilters,
  countActiveFilters,
  defaultFilters,
} from "@/data/search";
import { useMediaQuery } from "@/lib/use-media-query";
import { routes } from "@/lib/routes";
import { useEstateFilters } from "@/app/_lookups/_hooks/use-lookups";
import { useEstateSearch } from "@/app/properties/_hooks/use-estate-search";
import { useEstateMap } from "@/app/properties/_hooks/use-estate-map";
import { mapFiltersToSearchParams } from "@/app/properties/_mappers/estate-search.mapper";

import { ActiveFilters } from "./active-filters";
import { FiltersPanel } from "./filters-panel";
import { ListingRow } from "./listing-row";
import { MapPromo } from "./map-promo";
import { MapToggleButton } from "./map-toggle-button";
import { MobileMapView, SHEET_SPLIT, type SheetSnap } from "./mobile-map-view";
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

/**
 * How many pins the map asks for. Every marker is a DOM node with a border, a
 * shadow and a rounded price label, so a phone pays to build and paint the
 * whole set while showing a fraction of it at a time — and the badge over the
 * map already tells the visitor when the set has been truncated.
 */
const MAP_MARKER_LIMIT = { desktop: 500, phone: 150 } as const;

export function SearchView({
  cityName,
  initialFilters,
}: {
  cityName: string;
  initialFilters: SearchFilters;
}) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [view, setView] = useState<ViewMode>("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetSnap, setSheetSnap] = useState<SheetSnap>(SHEET_SPLIT);
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
  const mapQuery = useEstateMap(
    {
      ...apiParams,
      limit: isDesktop ? MAP_MARKER_LIMIT.desktop : MAP_MARKER_LIMIT.phone,
    },
    { enabled: !isDesktop || view === "map" },
  );

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

  const countLabel = `${total.toLocaleString("fa-IR")} آگهی در این محدوده`;
  const markers = mapQuery.data?.markers ?? [];
  const map = mapQuery.isPending ? (
    <div className="flex size-full items-center justify-center bg-muted">
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  ) : mapQuery.isError ? (
    <div className="flex size-full items-center justify-center bg-muted p-6">
      <ErrorState onRetry={() => void mapQuery.refetch()} />
    </div>
  ) : mapQuery.data.total > 0 && markers.length === 0 ? (
      <div className="flex size-full items-center justify-center bg-muted p-6 text-center">
        <Typography variant="muted" className="max-w-sm">
          هیچ‌کدام از آگهی‌های این جست‌وجو مختصات قابل نمایش ندارند.
        </Typography>
      </div>
    ) : (
      <div className="relative size-full">
        <ListingsMap
          markers={markers}
          city={filters.city}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        {mapQuery.data.truncated && (
          <span className="absolute bottom-3 start-3 z-20 rounded-full border bg-card/95 px-3 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur">
            نمایش {mapQuery.data.count.toLocaleString("fa-IR")} نقطه از{" "}
            {mapQuery.data.total.toLocaleString("fa-IR")} آگهی
          </span>
        )}
      </div>
    );

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

            <div className="mt-3 flex w-96 shrink-0 flex-col gap-3 overflow-y-auto py-1">
              <Typography as="h2" variant="h4">
                {status === "ready" ? countLabel : "در حال جستجو…"}
              </Typography>

              {status === "ready" &&
                results.map((listing) => (
                  <ListingRow
                    key={listing.id}
                    listing={listing}
                    active={listing.id === selectedId}
                    onHover={setSelectedId}
                    onSelect={setSelectedId}
                  />
                ))}
              {status === "ready" && results.length === 0 && (
                <EmptyState onReset={resetFilters} />
              )}
              {status === "ready" && searchQuery.hasNextPage && (
                <Button
                  variant="outline"
                  disabled={searchQuery.isFetchingNextPage}
                  onClick={() => void searchQuery.fetchNextPage()}
                >
                  {searchQuery.isFetchingNextPage
                    ? "در حال دریافت…"
                    : "نمایش آگهی‌های بیشتر"}
                </Button>
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

                    {searchQuery.hasNextPage && (
                      <Button
                        variant="outline"
                        className="mx-auto w-fit"
                        disabled={searchQuery.isFetchingNextPage}
                        onClick={() => void searchQuery.fetchNextPage()}
                      >
                        {searchQuery.isFetchingNextPage
                          ? "در حال دریافت…"
                          : "نمایش آگهی‌های بیشتر"}
                      </Button>
                    )}
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
