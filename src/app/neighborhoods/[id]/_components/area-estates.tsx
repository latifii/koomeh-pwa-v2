"use client";

import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Building2, LoaderCircle, RotateCcw } from "lucide-react";

import { neighborhoodEstatesInfiniteQueryOptions } from "@/app/neighborhoods/_queries/neighborhoods.query";
import type { NeighborhoodCounts } from "@/app/neighborhoods/_types/neighborhoods.types";
import { PropertyCard } from "@/components/features/property/property-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getApiErrorMessage } from "@/lib/api/api-error";

type TabValue = "all" | "sale" | "rent";

const dealTypeByTab: Record<TabValue, 1 | 2 | undefined> = {
  all: undefined,
  sale: 1,
  rent: 2,
};

/**
 * The area's active files, split by the same tabs the API counts: everything,
 * for sale, and to rent. Tabs whose count is zero are still shown so the
 * visitor can see there is nothing rather than wonder where the tab went.
 */
export function AreaEstates({
  postId,
  counts,
}: {
  postId: string;
  counts: NeighborhoodCounts;
}) {
  const [tab, setTab] = useState<TabValue>("all");

  const { data, error, isPending, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteQuery(
      neighborhoodEstatesInfiniteQueryOptions(postId, dealTypeByTab[tab]),
    );

  const items = data?.pages.flatMap((page) => page.items) ?? [];

  const tabs: { value: TabValue; label: string; count: number }[] = [
    { value: "all", label: "همه", count: counts.all },
    { value: "sale", label: "خرید و فروش", count: counts.sale },
    { value: "rent", label: "رهن و اجاره", count: counts.rent },
  ];

  return (
    <div className="grid gap-4">
      <Tabs value={tab} onValueChange={(value) => setTab(value as TabValue)}>
        <TabsList>
          {tabs.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
              <span className="ms-1.5 text-xs text-muted-foreground">
                {item.count.toLocaleString("fa-IR")}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {error ? (
        <EmptyState
          icon={RotateCcw}
          title="فایل‌ها بارگذاری نشد"
          description={getApiErrorMessage(error)}
        />
      ) : isPending ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="فایلی در این محدوده ثبت نشده است"
          description="می‌توانید تب دیگری را ببینید یا از جستجوی ملک استفاده کنید."
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((estate) => (
              <PropertyCard key={estate.id} estate={estate} />
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage && (
                  <LoaderCircle data-icon="inline-start" className="animate-spin" />
                )}
                فایل‌های بیشتر
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
