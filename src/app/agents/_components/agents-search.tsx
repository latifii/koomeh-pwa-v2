"use client";

import { useDeferredValue, useMemo, useState } from "react";
import {
  LoaderCircle,
  Search,
  SlidersHorizontal,
  TriangleAlert,
  Users,
} from "lucide-react";

import { useAgentFilters, useAgents } from "@/app/agents/_hooks/use-agents";
import type {
  AgentFiltersResponse,
  AgentsResponse,
} from "@/app/agents/_schemas/agents.schema";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";

import { AgentCard } from "./agent-card";
import {
  AgentsFiltersPanel,
  defaultAgentFilters,
  type AgentFiltersState,
} from "./agents-filters-panel";

const numberValue = (value: string) => (value ? Number(value) : undefined);
const optionLabel = (option: {
  value: string;
  title?: string;
  label?: string;
}) => option.title ?? option.label ?? option.value;

/**
 * The consultants index: a toolbar with the name search, the sort and — on
 * a phone — the button that opens the filters as a sheet; the same filters
 * as a sidebar from `lg` up; the consultants as a grid of cards.
 */
export function AgentsSearch({
  initialAgents,
  initialFilters,
}: {
  initialAgents: AgentsResponse;
  initialFilters: AgentFiltersResponse;
}) {
  const [filters, setFilters] =
    useState<AgentFiltersState>(defaultAgentFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const deferredName = useDeferredValue(filters.name);
  const filtersQuery = useAgentFilters(1, initialFilters);
  const options = filtersQuery.data?.result ?? initialFilters.result;

  const params = useMemo(
    () => ({
      name: deferredName,
      city_id: filters.nationwide ? undefined : 1,
      all: filters.nationwide || undefined,
      activity_type: numberValue(filters.activityType) as 1 | 2 | undefined,
      estate_types: filters.estateTypes,
      districts: filters.districts,
      branch_id: numberValue(filters.branchId),
      language: numberValue(filters.language),
      gender: filters.gender || undefined,
      experience: numberValue(filters.experience),
      has_estates: filters.hasEstates || undefined,
      sort: (numberValue(filters.sort) as 1 | 2 | 3 | 4 | undefined) ?? 1,
      per_page: 20,
    }),
    [deferredName, filters],
  );

  const isDefaultQuery =
    !deferredName &&
    !filters.activityType &&
    !filters.estateTypes.length &&
    !filters.districts.length &&
    !filters.branchId &&
    !filters.language &&
    !filters.gender &&
    !filters.experience &&
    !filters.hasEstates &&
    !filters.nationwide &&
    filters.sort === "1";
  const agentsQuery = useAgents(
    params,
    isDefaultQuery ? initialAgents : undefined,
  );
  const pages = agentsQuery.data?.pages ?? [];
  const agents = pages.flatMap((page) => page.items);
  const total = pages[0]?.total ?? 0;
  const sortOptions = options.sort_options.map((option) => ({
    value: option.value,
    title: optionLabel(option),
  }));
  const sortItems = Object.fromEntries(
    sortOptions.map((option) => [option.value, option.title]),
  );
  // Everything but the name and the sort: those two sit in the toolbar and
  // are visible; the badge counts what is hidden in the sheet.
  const activeCount =
    filters.estateTypes.length +
    filters.districts.length +
    [
      filters.activityType,
      filters.branchId,
      filters.language,
      filters.gender,
      filters.experience,
    ].filter(Boolean).length +
    Number(filters.hasEstates) +
    Number(filters.nationwide);

  const changeFilter = <K extends keyof AgentFiltersState>(
    key: K,
    value: AgentFiltersState[K],
  ) => setFilters((current) => ({ ...current, [key]: value }));

  const panel = (
    <AgentsFiltersPanel
      filters={filters}
      options={options}
      activeCount={activeCount}
      onChange={changeFilter}
      onReset={() => setFilters(defaultAgentFilters)}
    />
  );

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="hidden lg:sticky lg:top-20 lg:block">{panel}</aside>

      <Drawer open={filtersOpen} onOpenChange={setFiltersOpen} showSwipeHandle>
        <DrawerContent className="lg:hidden">
          <DrawerHeader>
            <DrawerTitle>فیلتر مشاورین</DrawerTitle>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
            {panel}
          </div>
        </DrawerContent>
      </Drawer>

      <section className="min-w-0">
        {/* The toolbar: search by name, sort, and on a phone the filters. */}
        <div className="mb-4 flex flex-col gap-2 rounded-2xl border bg-card p-2 sm:flex-row sm:items-center">
          <label className="relative flex flex-1 items-center">
            <Search className="pointer-events-none absolute inset-s-3 size-4 text-muted-foreground" />
            <Input
              type="search"
              value={filters.name}
              onChange={(event) => changeFilter("name", event.target.value)}
              placeholder="جست‌وجوی نام مشاور"
              aria-label="جست‌وجوی نام مشاور"
              className="border-0 bg-transparent ps-9 shadow-none focus-visible:ring-0"
            />
          </label>

          <div className="flex items-center gap-2 border-t pt-2 sm:border-s sm:border-t-0 sm:ps-2 sm:pt-0">
            <Typography
              as="span"
              variant="small"
              className="hidden shrink-0 items-center gap-1 md:flex"
            >
              <Users className="size-4 text-brand" />
              <strong className="text-foreground tabular-nums">
                {total.toLocaleString("fa-IR")}
              </strong>
              مشاور
            </Typography>

            <Select
              items={sortItems}
              value={filters.sort}
              onValueChange={(value) =>
                changeFilter(
                  "sort",
                  (value ?? "1") as AgentFiltersState["sort"],
                )
              }
            >
              <SelectTrigger
                aria-label="مرتب‌سازی مشاورین"
                size="sm"
                className="w-full min-w-36 sm:w-auto"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setFiltersOpen(true)}
              className="relative shrink-0 lg:hidden"
            >
              <SlidersHorizontal data-icon="inline-start" />
              فیلترها
              {activeCount > 0 && (
                <Badge className="ms-1 size-5 justify-center rounded-full p-0 text-[10px]">
                  {activeCount.toLocaleString("fa-IR")}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {agentsQuery.isLoading ? (
          <AgentsGridSkeleton />
        ) : agentsQuery.isError ? (
          <EmptyState
            icon={TriangleAlert}
            title="دریافت مشاورین با خطا مواجه شد"
            description="لطفاً چند لحظه دیگر دوباره تلاش کنید."
          />
        ) : agents.length ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
            {agentsQuery.hasNextPage && (
              <div className="mt-6 flex justify-center">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => agentsQuery.fetchNextPage()}
                  disabled={agentsQuery.isFetchingNextPage}
                >
                  {agentsQuery.isFetchingNextPage && (
                    <LoaderCircle className="animate-spin" />
                  )}
                  مشاورین بیشتر
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={Users}
            title="مشاوری با این مشخصات پیدا نشد"
            description="فیلترها را تغییر دهید یا همه فیلترها را پاک کنید."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters(defaultAgentFilters)}
              >
                حذف فیلترها
              </Button>
            }
          />
        )}
      </section>
    </div>
  );
}

function AgentsGridSkeleton() {
  return (
    <div aria-busy className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border bg-card">
          <Skeleton className="h-14 rounded-none" />
          <div className="-mt-10 flex flex-col items-center gap-3 px-4 pb-4">
            <Skeleton className="size-20 rounded-full ring-4 ring-card" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-5 w-1/3 rounded-full" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
