"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ChevronLeft, RotateCcw, SlidersHorizontal } from "lucide-react";

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
import { fetchListings } from "@/data/listings";
import {
  type Listing,
  type SearchFilters,
  countActiveFilters,
  defaultFilters,
  filterListings,
} from "@/data/search";
import { useMediaQuery } from "@/lib/use-media-query";
import { routes } from "@/lib/routes";

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

const PAGE_SIZE = 9;

type Status = "loading" | "ready" | "error";
type ViewMode = "grid" | "map";

export function SearchView({
  cityName,
  initialFilters,
  simulateError = false,
}: {
  cityName: string;
  initialFilters: SearchFilters;
  simulateError?: boolean;
}) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [listings, setListings] = useState<Listing[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [view, setView] = useState<ViewMode>("grid");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetSnap, setSheetSnap] = useState<SheetSnap>(SHEET_SPLIT);

  // Stands in for the search request; filtering itself happens on the client
  // against the mock inventory, so only the fetch is simulated here.
  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (!cancelled) setStatus("loading");
    });

    fetchListings({ shouldFail: simulateError })
      .then((data) => {
        if (cancelled) return;
        setListings(data);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [simulateError, reloadToken]);

  const results = useMemo(
    () => filterListings(listings, filters),
    [listings, filters],
  );

  const activeCount = countActiveFilters(filters);

  const updateFilters = useCallback((patch: Partial<SearchFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setVisibleCount(PAGE_SIZE);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters((current) => ({
      ...defaultFilters,
      // Deal type and city frame the search rather than narrow it, so
      // "clear filters" keeps the visitor where they are.
      deal: current.deal,
      city: current.city,
      sort: current.sort,
    }));
    setVisibleCount(PAGE_SIZE);
  }, []);

  const toggleView = useCallback(() => {
    setView((current) => (current === "map" ? "grid" : "map"));
    setSheetSnap(SHEET_SPLIT);
  }, []);

  const retry = useCallback(() => setReloadToken((token) => token + 1), []);

  const countLabel = `${results.length.toLocaleString("fa-IR")} آگهی در این محدوده`;

  const map = (
    <ListingsMap
      listings={results}
      city={filters.city}
      selectedId={selectedId}
      onSelect={setSelectedId}
    />
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
        <FiltersPanel filters={filters} onChange={updateFilters} />
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
          />
        </div>

        <DrawerFooter>
          <Button onClick={() => setFiltersOpen(false)}>
            نمایش {results.length.toLocaleString("fa-IR")} آگهی
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );

  // Phones get one experience only: the map with its results sheet, where the
  // swipe handle already covers everything a grid/map switch used to. Leaflet
  // misbehaves in a `display:none` box, so this is a mount decision, not a
  // `lg:hidden` one.
  const isDesktop = useMediaQuery("(min-width: 64rem)");

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
          snap={sheetSnap}
          onSnapChange={setSheetSnap}
          map={map}
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
          <nav aria-label="مسیر صفحه" className="mb-4">
            <ol className="flex items-center gap-1 text-xs text-muted-foreground">
              <li>
                <Link href="/" className="transition-colors hover:text-brand">
                  خانه
                </Link>
              </li>
              <ChevronLeft className="size-3.5" aria-hidden />
              <li>
                <Link
                  href={routes.properties()}
                  className="transition-colors hover:text-brand"
                >
                  جستجوی ملک
                </Link>
              </li>
              <ChevronLeft className="size-3.5" aria-hidden />
              <li aria-current="page" className="font-medium text-foreground">
                {cityName}
              </li>
            </ol>
          </nav>

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
            </div>

            <div className="relative mt-3 min-w-0 flex-1 overflow-hidden">
              <SearchToolbar
                filters={filters}
                onChange={updateFilters}
                activeCount={activeCount}
                onOpenFilters={() => setFiltersOpen(true)}
                className="absolute inset-x-3 top-3 z-30 bg-card/95 shadow-lg backdrop-blur-md"
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
                        {results.length.toLocaleString("fa-IR")}
                      </span>{" "}
                      آگهی در {filters.city}
                      {filters.district ? `، ${filters.district}` : ""}
                    </>
                  )}
                </Typography>

                <ActiveFilters
                  filters={filters}
                  onChange={updateFilters}
                  onReset={resetFilters}
                />

                {status === "loading" && <ResultsSkeleton />}

                {status === "error" && <ErrorState onRetry={retry} />}

                {status === "ready" && results.length === 0 && (
                  <EmptyState onReset={resetFilters} />
                )}

                {status === "ready" && results.length > 0 && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {results.slice(0, visibleCount).map((listing, index) => (
                        <Fragment key={listing.id}>
                          <PropertyCard estate={listing} />
                          {/* Slotted after the first full row, where interest is highest */}
                          {index === 2 && (
                            <MapPromo
                              count={results.length}
                              city={filters.city}
                              onOpen={toggleView}
                            />
                          )}
                        </Fragment>
                      ))}
                    </div>

                    {visibleCount < results.length && (
                      <Button
                        variant="outline"
                        className="mx-auto w-fit"
                        onClick={() =>
                          setVisibleCount((count) => count + PAGE_SIZE)
                        }
                      >
                        نمایش آگهی‌های بیشتر
                        <span className="text-muted-foreground">
                          (
                          {(results.length - visibleCount).toLocaleString(
                            "fa-IR",
                          )}
                          )
                        </span>
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
