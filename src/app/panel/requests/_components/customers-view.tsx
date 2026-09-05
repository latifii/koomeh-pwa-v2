"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  ClipboardList,
  Clock,
  LoaderCircle,
  MapPin,
  Phone,
  RotateCcw,
  StickyNote,
} from "lucide-react";

import {
  customerFiltersQueryOptions,
  customersInfiniteQueryOptions,
} from "@/app/panel/requests/_queries/customers.query";
import type { CustomerRow } from "@/app/panel/requests/_mappers/customers.mapper";
import {
  defaultCustomerFilters,
  type CustomerFilters,
} from "@/app/panel/requests/_types/customers.types";
import { EmptyState } from "@/components/shared/empty-state";
import { filterChips, PanelFilterBar } from "@/components/shared/filter-bar";
import { FilterCombobox, FilterSelect } from "@/components/shared/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * The demand list. Which records come back is the API's decision — an agent
 * sees their own, an administrator everyone's — and `scope.can_manage_any`
 * is what tells the page which it is.
 */
export function CustomersView() {
  const [filters, setFilters] = useState<CustomerFilters>(defaultCustomerFilters);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedQuery(filters.query.trim()),
      350,
    );
    return () => window.clearTimeout(timeout);
  }, [filters.query]);

  const options = useQuery(customerFiltersQueryOptions());

  const params = useMemo(() => {
    // Eleven digits is a phone number; anything else is a name.
    const asMobile = /^0?9\d{9}$/.test(debouncedQuery)
      ? debouncedQuery
      : undefined;

    return {
      mobile: asMobile,
      name: asMobile ? undefined : debouncedQuery || undefined,
      request_type: filters.requestType
        ? (Number(filters.requestType) as 1 | 2)
        : undefined,
      status: filters.status ? Number(filters.status) : undefined,
      estate_type: filters.estateType || undefined,
      user_id: filters.agent ? Number(filters.agent) : undefined,
      per_page: 12,
    };
  }, [debouncedQuery, filters]);

  const list = useInfiniteQuery(customersInfiniteQueryOptions(params));

  const rows = list.data?.pages.flatMap((page) => page.items) ?? [];
  const first = list.data?.pages[0];
  const summary = first?.summary;

  const set = (patch: Partial<CustomerFilters>) =>
    setFilters((current) => ({ ...current, ...patch }));

  const isFiltered = Object.entries(filters).some(
    ([key, value]) =>
      value !== defaultCustomerFilters[key as keyof CustomerFilters],
  );

  const chips = filterChips(
    filters,
    defaultCustomerFilters,
    {
      requestType: {
        label: "نوع تقاضا",
        options: options.data?.request_types ?? [],
      },
      status: { label: "وضعیت", options: options.data?.statuses ?? [] },
      estateType: {
        label: "نوع ملک",
        options: options.data?.estate_types ?? [],
      },
      agent: { label: "مشاور", options: options.data?.agents ?? [] },
    },
    (key, value) => set({ [key]: value }),
  );

  return (
    <div className="grid grid-cols-1 gap-4">
      {summary && (
        <div className="grid grid-cols-3 gap-3">
          <SummaryTile label="کل تقاضاها" value={summary.total} />
          <SummaryTile label="جاری" value={summary.active} />
          <SummaryTile label="بدون مشاور" value={summary.unassigned} />
        </div>
      )}

      <PanelFilterBar
        icon={ClipboardList}
        count={list.isPending ? undefined : (first?.total ?? 0)}
        unit="تقاضا"
        pending={list.isPending}
        columns={4}
        search={{
          value: filters.query,
          onChange: (value) => set({ query: value }),
          placeholder: "جستجوی نام یا شماره موبایل",
        }}
        chips={chips}
        isFiltered={isFiltered}
        onClear={() => setFilters(defaultCustomerFilters)}
      >
        <FilterSelect
          label="نوع تقاضا"
          value={filters.requestType}
          onChange={(value) => set({ requestType: value })}
          options={options.data?.request_types ?? []}
        />
        <FilterSelect
          label="وضعیت"
          value={filters.status}
          onChange={(value) => set({ status: value })}
          options={options.data?.statuses ?? []}
        />
        <FilterSelect
          label="نوع ملک"
          value={filters.estateType}
          onChange={(value) => set({ estateType: value })}
          options={options.data?.estate_types ?? []}
        />
        {(options.data?.agents.length ?? 0) > 0 && (
          <FilterCombobox
            label="مشاور"
            value={filters.agent}
            onChange={(value) => set({ agent: value })}
            options={options.data?.agents ?? []}
            emptyText="مشاوری با این نام نیست"
          />
        )}
      </PanelFilterBar>

      {list.isError ? (
        <EmptyState
          icon={RotateCcw}
          title="فهرست تقاضاها بارگذاری نشد"
          description={getApiErrorMessage(list.error)}
        />
      ) : list.isPending ? (
        <div className="grid grid-cols-1 gap-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="تقاضایی پیدا نشد"
          description="فیلترها را تغییر دهید یا تقاضای تازه‌ای ثبت کنید."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3">
            {rows.map((row) => (
              <CustomerCard key={row.id} row={row} />
            ))}
          </div>

          {list.hasNextPage && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => list.fetchNextPage()}
                disabled={list.isFetchingNextPage}
              >
                {list.isFetchingNextPage && (
                  <LoaderCircle data-icon="inline-start" className="animate-spin" />
                )}
                تقاضاهای بیشتر
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CustomerCard({ row }: { row: CustomerRow }) {
  return (
    <article
      className={cn(
        "rounded-xl border bg-card p-3.5",
        row.isStale && "border-secondary/50",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <Link href={routes.panel.request(row.id)}>
            <Typography variant="h4" as="h3" className="truncate sm:text-sm">
              {row.name}
            </Typography>
          </Link>
          <Typography variant="small" className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>کد {row.numericId.toLocaleString("fa-IR")}</span>
            {row.requestTypeLabel && <span>{row.requestTypeLabel}</span>}
            {row.estateTypeLabel && <span>{row.estateTypeLabel}</span>}
            {row.agentName && <span>مشاور: {row.agentName}</span>}
          </Typography>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {row.statusLabel && <Badge variant="secondary">{row.statusLabel}</Badge>}
          {row.isStale && (
            <Badge variant="secondary" className="gap-1 bg-secondary/20 text-secondary-foreground">
              <Clock className="size-3" />
              نیازمند پیگیری
            </Badge>
          )}
        </div>
      </div>

      {(row.budgetLabel || row.areaLabel) && (
        <Typography variant="small" className="mt-2 text-foreground">
          {[row.budgetLabel, row.areaLabel].filter(Boolean).join(" · ")}
        </Typography>
      )}

      {row.districts.length > 0 && (
        <Typography variant="small" className="mt-1.5 flex items-center gap-1">
          <MapPin className="size-3.5 shrink-0 text-brand/70" />
          <span className="truncate">{row.districts.join("، ")}</span>
        </Typography>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-2.5">
        <Typography variant="small" className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {row.noteCount > 0 && (
            <span className="flex items-center gap-1">
              <StickyNote className="size-3.5 text-brand/70" />
              {row.noteCount.toLocaleString("fa-IR")} یادداشت
            </span>
          )}
          {row.sentEstates > 0 && (
            <span>{row.sentEstates.toLocaleString("fa-IR")} فایل ارسالی</span>
          )}
        </Typography>

        {/* Shown only where the API grants it. */}
        {row.canViewMobile && row.mobile && (
          <Typography
            as="a"
            variant="small"
            href={`tel:${row.mobile}`}
            className="flex items-center gap-1 font-medium text-foreground hover:text-brand"
          >
            <Phone className="size-3.5 text-brand/70" />
            {row.mobile}
          </Typography>
        )}
      </div>
    </article>
  );
}

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <Typography as="span" variant="h4" className="block tabular-nums sm:text-base">
        {value.toLocaleString("fa-IR")}
      </Typography>
      <Typography as="span" variant="small" className="block truncate text-[11px]">
        {label}
      </Typography>
    </div>
  );
}
