"use client";

import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { LoaderCircle, MapPinned, RotateCcw, Search } from "lucide-react";

import { neighborhoodsInfiniteQueryOptions } from "@/app/neighborhoods/_queries/neighborhoods.query";
import type { NeighborhoodListResponseLike } from "@/app/neighborhoods/_types/neighborhoods.types";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";

import { AreaCard } from "./area-card";

/**
 * The guide index. There are a couple of hundred entries, so the grid pages in
 * on demand and the search box narrows by name — the same shape the articles
 * list uses.
 */
export function AreaList({
  initialPage,
}: {
  initialPage: NeighborhoodListResponseLike;
}) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [withEstatesOnly, setWithEstatesOnly] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => window.clearTimeout(timeout);
  }, [query]);

  const params = useMemo(
    () => ({
      q: debouncedQuery || undefined,
      has_estates: withEstatesOnly || undefined,
      per_page: 21,
    }),
    [debouncedQuery, withEstatesOnly],
  );

  const isDefaultView = !debouncedQuery && !withEstatesOnly;

  const { data, error, isPending, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery(
      neighborhoodsInfiniteQueryOptions(
        params,
        isDefaultView ? initialPage : undefined,
      ),
    );

  const items = data?.pages.flatMap((page) => page.items) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جستجوی نام محله"
            aria-label="جستجوی نام محله"
            className="ps-9"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={withEstatesOnly ? "secondary" : "outline"}
            size="sm"
            onClick={() => setWithEstatesOnly((value) => !value)}
            aria-pressed={withEstatesOnly}
          >
            فقط محله‌های دارای فایل
          </Button>
          {!isPending && (
            <Typography as="span" variant="small" className="whitespace-nowrap">
              {total.toLocaleString("fa-IR")} محله
            </Typography>
          )}
        </div>
      </div>

      {error ? (
        <EmptyState
          icon={RotateCcw}
          title="محله‌ها بارگذاری نشد"
          description={getApiErrorMessage(error)}
        />
      ) : isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <Skeleton key={index} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={MapPinned}
          title="محله‌ای پیدا نشد"
          description="عبارت دیگری را جستجو کنید یا فیلتر را بردارید."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((area) => (
              <AreaCard key={area.id} area={area} />
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage && (
                  <LoaderCircle data-icon="inline-start" className="animate-spin" />
                )}
                محله‌های بیشتر
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
