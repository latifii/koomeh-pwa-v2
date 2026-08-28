"use client";

import type { ReactNode } from "react";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import type { Listing, SearchFilters } from "@/data/search";
import type { EstateFilters } from "@/app/_lookups/_schemas/lookups.schema";

import { ListingCard } from "./listing-card";
import { MapSearchBar } from "./map-search-bar";
import { MapToggleButton } from "./map-toggle-button";
import { EmptyState, ErrorState, ResultsSkeleton } from "./result-states";

/**
 * Three states, all reached by dragging the same handle:
 * `PEEK` — the map with just the result count docked at the bottom.
 * `SPLIT` — half map, half results.
 * `FULL` — the sheet owns the screen: search, filters and results scroll
 * together as one ordinary page, and the map is unmounted behind it.
 */
export const SHEET_PEEK = "4rem";
export const SHEET_SPLIT = 0.5;
export const SHEET_FULL = 1;

export type SheetSnap = string | number;

const snapPoints: SheetSnap[] = [SHEET_PEEK, SHEET_SPLIT, SHEET_FULL];

/** Site header above (`h-16`), fixed bottom navigation below — neither may be covered. */
const HEADER_HEIGHT = "4rem";
const NAV_HEIGHT = "4rem";
const SHEET_MAX_HEIGHT = "calc(100dvh - 8rem)";

export function MobileMapView({
  filters,
  onChange,
  activeCount,
  onOpenFilters,
  onReset,
  onRetry,
  status,
  results,
  total,
  hasMore,
  isLoadingMore,
  onLoadMore,
  snap,
  onSnapChange,
  map,
  lookups,
}: {
  filters: SearchFilters;
  onChange: (patch: Partial<SearchFilters>) => void;
  activeCount: number;
  onOpenFilters: () => void;
  onReset: () => void;
  onRetry: () => void;
  status: "loading" | "ready" | "error";
  results: Listing[];
  total: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  snap: SheetSnap;
  onSnapChange: (snap: SheetSnap) => void;
  map: ReactNode;
  lookups?: EstateFilters;
}) {
  const expanded = snap === SHEET_FULL;

  const searchBar = (
    <MapSearchBar
      filters={filters}
      onChange={onChange}
      activeCount={activeCount}
      onOpenFilters={onOpenFilters}
      onReset={onReset}
      lookups={lookups}
    />
  );

  const countLabel =
    status === "ready"
      ? `${total.toLocaleString("fa-IR")} آگهی در این محدوده`
      : "در حال جستجو…";

  return (
    // `data-viewport-shell` tells the layout this screen is the whole viewport:
    // no page scroll and no footer under it. See `globals.css`.
    <div
      data-viewport-shell
      style={{ height: `calc(100dvh - ${HEADER_HEIGHT})` }}
      className="relative w-full overflow-hidden lg:hidden"
    >
      {/* While the map is on screen the bar floats above it; once the sheet
          takes over, the bar moves inside and scrolls with the results. */}
      {!expanded && (
        <>
          <div className="absolute inset-x-0 top-0 z-20">{searchBar}</div>

          {status === "error" ? (
            <div className="flex size-full items-center justify-center p-6">
              <ErrorState onRetry={onRetry} />
            </div>
          ) : (
            map
          )}
        </>
      )}

      <Drawer
        open
        modal={false}
        disablePointerDismissal
        showSwipeHandle
        snapPoints={snapPoints}
        // Three close-together stops: without this a quick flick skipped the
        // middle one, so collapsing a full-screen list landed on the 4rem peek
        // instead of the half-and-half view the visitor was aiming for.
        snapToSequentialPoints
        snapPoint={snap}
        onSnapPointChange={(next) => onSnapChange(next ?? SHEET_PEEK)}
      >
        {/* `z-30` and the bottom margin keep the fixed navigation visible; the
            max height spans exactly from under the site header down to it.

            The padding matters as much as the height. A snapped drawer keeps
            its full height and is translated down by `--drawer-snap-point-offset`,
            so at PEEK and SPLIT the part of it below the fold is real, laid-out
            space: the results scroller ran off the bottom of the screen, its
            last cards unreachable, and at PEEK it was tall enough to swallow the
            upward drag that should have raised the sheet. Padding the popup by
            that same offset gives the flex column exactly the height the visitor
            can see. */}
        <DrawerContent
          viewportClassName="z-30"
          style={
            {
              marginBottom: NAV_HEIGHT,
              "--drawer-content-max-height": SHEET_MAX_HEIGHT,
            } as React.CSSProperties
          }
          className="rounded-b-none pb-[max(0px,var(--drawer-snap-point-offset,0px))] transition-[transform,height,opacity,filter,padding-bottom] [--drawer-inset:0px] lg:hidden"
        >
          {!expanded && (
            <DrawerHeader className="pb-2">
              <DrawerTitle>{countLabel}</DrawerTitle>
            </DrawerHeader>
          )}

          {/*
           * The scroller is a plain block. Making it the flex column instead
           * would let every card shrink to fit its fixed height, which is what
           * collapsed them into empty slivers.
           *
           * `overflow-x-hidden` is not decoration: `overflow-y: auto` computes
           * the other axis to `auto` too, so a card overhanging by a pixel gave
           * the sheet a stray sideways scroll — and told the drawer this was a
           * horizontally scrollable region, which made it hand diagonal drags
           * to the browser instead of the sheet.
           */}
          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
            {expanded && (
              <>
                {searchBar}
                <Typography as="h2" variant="h4" className="px-4 pt-3">
                  {countLabel}
                </Typography>
              </>
            )}

            <div className="flex min-w-0 flex-col gap-4 px-4 pt-3 pb-6">
              {status === "loading" && (
                <ResultsSkeleton count={3} className="sm:grid-cols-1" />
              )}
              {status === "error" && expanded && (
                <ErrorState onRetry={onRetry} />
              )}
              {status === "ready" && results.length === 0 && (
                <EmptyState onReset={onReset} />
              )}
              {status === "ready" &&
                results.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              {status === "ready" && hasMore && (
                <Button
                  variant="outline"
                  disabled={isLoadingMore}
                  onClick={onLoadMore}
                >
                  {isLoadingMore ? "در حال دریافت…" : "نمایش آگهی‌های بیشتر"}
                </Button>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* The only state without a map on screen is the only one that needs an
          explicit way back to it. */}
      {expanded && (
        <MapToggleButton
          active={false}
          onClick={() => onSnapChange(SHEET_SPLIT)}
        />
      )}
    </div>
  );
}
