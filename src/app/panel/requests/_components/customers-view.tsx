"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  ClipboardList,
  Clock,
  LoaderCircle,
  MapPin,
  Phone,
  RotateCcw,
  SlidersHorizontal,
  StickyNote,
} from "lucide-react";

import { useSessionStore } from "@/app/auth/_stores/auth.store";
import { usePanelAccess } from "@/app/panel/_admin/_components/admin-gate";

import {
  customerFiltersQueryOptions,
  customersInfiniteQueryOptions,
} from "@/app/panel/requests/_queries/customers.query";
import {
  countAdvancedCustomerFilters,
  CUSTOMER_PAGE_SIZES,
  CUSTOMER_SORT_OPTIONS,
  customerFilterParams,
} from "@/app/panel/requests/_lib/customer-filter-params";
import type { CustomerRow } from "@/app/panel/requests/_mappers/customers.mapper";
import {
  AGENT_ALL,
  AGENT_DEFAULT,
  AGENT_NONE,
  defaultCustomerFilters,
  type CustomerFilters,
} from "@/app/panel/requests/_types/customers.types";
import { EmptyState } from "@/components/shared/empty-state";
import { filterChips, PanelFilterBar } from "@/components/shared/filter-bar";
import { FilterCombobox, FilterSelect } from "@/components/shared/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toJalaliDisplay } from "@/lib/jalali-date";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { CustomerFiltersDrawer } from "./customer-filters-drawer";

/**
 * The customer list — the old /customer, filter for filter.
 *
 * The API does not scope this list by role: the same request answers an
 * agent and an administrator with the same rows. What made the two roles see
 * different lists on the old page was its «مشاور» dropdown, which opened on
 * «مشتری‌های خودم» for an agent and on «همه مشتری‌ها» for an administrator.
 * That rule lives in `resolveAgent`: the default filter is the viewer's own
 * customers unless they administer, and either can widen it from the same
 * dropdown the old page had — own, unassigned, everyone, or a colleague.
 */
export function CustomersView() {
  const user = useSessionStore((state) => state.session?.user);
  const access = usePanelAccess("member");
  const viewer = useMemo(
    () => ({ id: user?.id, isAdmin: access.viewer.isAdmin }),
    [user?.id, access.viewer.isAdmin],
  );

  // The dashboard's «عملکرد امروز» opens this page already on today's
  // follow-ups, as the old card did.
  const search = useSearchParams();
  const [filters, setFilters] = useState<CustomerFilters>(() => ({
    ...defaultCustomerFilters,
    today: search.get("today") === "1" ? "1" : "",
  }));
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedQuery(filters.query.trim()),
      350,
    );
    return () => window.clearTimeout(timeout);
  }, [filters.query]);

  const options = useQuery(customerFiltersQueryOptions());

  const params = useMemo(
    () => customerFilterParams(filters, debouncedQuery, viewer),
    [debouncedQuery, filters, viewer],
  );

  // Not until the session is read: the default scope depends on who asks.
  const list = useInfiniteQuery({
    ...customersInfiniteQueryOptions(params),
    enabled: !access.pending,
  });

  const rows = list.data?.pages.flatMap((page) => page.items) ?? [];
  const first = list.data?.pages[0];
  const summary = first?.summary;

  const set = (patch: Partial<CustomerFilters>) =>
    setFilters((current) => ({ ...current, ...patch }));

  const isFiltered = Object.entries(filters).some(
    ([key, value]) =>
      value !== defaultCustomerFilters[key as keyof CustomerFilters],
  );

  /**
   * The old dropdown, entry for entry: own customers first, then «بدون
   * مشاور», then every colleague. «همه مشتری‌ها» is the cleared state. The
   * default entry is labelled for what it resolves to, so an administrator
   * is not told they are looking at «مشتری‌های خودم» when they are not.
   */
  const agentOptions = useMemo(() => {
    const own = viewer.id
      ? [{ value: String(viewer.id), title: "مشتری‌های خودم" }]
      : [];
    const colleagues = (options.data?.agents ?? []).filter(
      (agent) => agent.value !== String(viewer.id),
    );
    return [
      ...own,
      { value: AGENT_NONE, title: "بدون مشاور" },
      { value: AGENT_ALL, title: "همه مشتری‌ها" },
      ...colleagues,
    ];
  }, [options.data, viewer.id]);

  const agentChipOptions = useMemo(
    () => [
      ...agentOptions,
      {
        value: AGENT_DEFAULT,
        title: viewer.isAdmin ? "همه مشتری‌ها" : "مشتری‌های خودم",
      },
    ],
    [agentOptions, viewer.isAdmin],
  );

  const advancedCount = countAdvancedCustomerFilters(
    filters,
    defaultCustomerFilters,
  );
  const money = (value: string) =>
    Number(value) ? `${Number(value).toLocaleString("fa-IR")} تومان` : value;
  const yes = () => "بله";
  const count = (unit: string) => (value: string) =>
    `${value.split(",").length.toLocaleString("fa-IR")} ${unit}`;
  const pick = (key: string) => ({
    label: key,
    options:
      options.data?.fields.find((entry) => entry.key === key)?.options ?? [],
  });

  const chips = filterChips(
    filters,
    // The scope chip is shown even at its default for an agent: «مشتری‌های
    // خودم» is a real narrowing of the list, and removing it is how the old
    // page's «همه مشتری‌ها» is reached.
    {
      ...defaultCustomerFilters,
      agent: viewer.isAdmin ? AGENT_DEFAULT : AGENT_ALL,
    },
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
      agent: { label: "مشاور", options: agentChipOptions },
      code: { label: "کد" },
      name: { label: "نام" },
      mobile: { label: "همراه" },
      districtIds: { label: "محله", format: count("محله") },
      areaMin: { label: "متراژ از" },
      areaMax: { label: "متراژ تا" },
      priceMin: { label: "بودجه از", format: money },
      priceMax: { label: "بودجه تا", format: money },
      mortgageMin: { label: "رهن از", format: money },
      mortgageMax: { label: "رهن تا", format: money },
      rentMin: { label: "اجاره از", format: money },
      rentMax: { label: "اجاره تا", format: money },
      label: { ...pick("label"), label: "برچسب" },
      financialLiquidity: {
        ...pick("financial_liquidity_type"),
        label: "نقدینگی",
      },
      purchaseReason: { ...pick("purchase_reason"), label: "دلیل خرید" },
      purchasePriority: { ...pick("purchase_priority"), label: "تعجیل" },
      acquaintance: { ...pick("acquaintance_type"), label: "آشنایی" },
      residenceType: { ...pick("residence_type"), label: "سکونت" },
      usageType: { ...pick("usage_type"), label: "کاربری" },
      geography: { ...pick("geography"), label: "جهت" },
      buildLicense: { ...pick("build_license"), label: "پروانه" },
      floorCount: { ...pick("floor_count"), label: "طبقه" },
      floorStart: { ...pick("floor_start"), label: "شروع طبقات" },
      maxRoomCount: { ...pick("max_room_count"), label: "حداکثر اتاق" },
      maxUnitInFloor: { label: "حداکثر واحد در طبقه" },
      maxBuildingAge: { label: "حداکثر سن بنا" },
      minFloorCount: { label: "حداقل طبقات" },
      minFloorArea: { label: "حداقل زیربنا" },
      minFrontArea: { label: "حداقل بر" },
      minDensity: { label: "حداقل تراکم" },
      minStreetWidth: { label: "حداقل عرض گذر" },
      conditions: { label: "شرایط", format: count("مورد") },
      facilities: { label: "امکانات", format: count("مورد") },
      createFrom: { label: "ثبت از", format: toJalaliDisplay },
      createTo: { label: "ثبت تا", format: toJalaliDisplay },
      today: { label: "مشتریان امروز", format: yes },
      favorite: { label: "نشان‌شده‌ها", format: yes },
    },
    (key, value) => set({ [key]: value }),
  );

  return (
    <div className="grid grid-cols-1 gap-4">
      {summary && (
        <div className="grid grid-cols-3 gap-3">
          <SummaryTile label="کل مشتریان" value={summary.total} />
          <SummaryTile label="جاری" value={summary.active} />
          <SummaryTile label="بدون مشاور" value={summary.unassigned} />
        </div>
      )}

      <PanelFilterBar
        icon={ClipboardList}
        count={list.isPending ? undefined : (first?.total ?? 0)}
        unit="مشتری"
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
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDrawerOpen(true)}
          >
            <SlidersHorizontal data-icon="inline-start" />
            فیلترهای بیشتر
            {advancedCount > 0 && (
              <Badge variant="outline" className="bg-background tabular-nums">
                {advancedCount.toLocaleString("fa-IR")}
              </Badge>
            )}
          </Button>
        }
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
        {/* The old dropdown. An agent opens on their own customers, an
            administrator on everyone's; both can pick anything below. */}
        <FilterCombobox
          label={viewer.isAdmin ? "همه مشتری‌ها" : "مشتری‌های خودم"}
          value={filters.agent === AGENT_DEFAULT ? "" : filters.agent}
          onChange={(value) => set({ agent: value || AGENT_DEFAULT })}
          options={agentOptions}
          emptyText="مشاوری با این نام نیست"
        />
        <FilterSelect
          label="مرتب‌سازی: برچسب"
          value={filters.order}
          onChange={(value) =>
            set({
              order: value,
              orderBy: value ? filters.orderBy || "asc" : "",
            })
          }
          options={[...CUSTOMER_SORT_OPTIONS]}
        />
        {filters.order && (
          <FilterSelect
            label="صعودی"
            value={filters.orderBy}
            onChange={(value) => set({ orderBy: value })}
            options={[
              { value: "asc", title: "صعودی" },
              { value: "desc", title: "نزولی" },
            ]}
          />
        )}
        <FilterSelect
          label="تعداد نمایش: ۲۰"
          value={filters.perPage}
          onChange={(value) => set({ perPage: value })}
          options={CUSTOMER_PAGE_SIZES.map((size) => ({
            value: size,
            title: `${Number(size).toLocaleString("fa-IR")} در صفحه`,
          }))}
        />
      </PanelFilterBar>

      <CustomerFiltersDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        filters={filters}
        options={options.data}
        onApply={setFilters}
      />

      {list.isError ? (
        <EmptyState
          icon={RotateCcw}
          title="فهرست مشتریان بارگذاری نشد"
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
          title="مشتری‌ای پیدا نشد"
          description={
            filters.agent === AGENT_DEFAULT && !viewer.isAdmin
              ? "این فهرست فقط مشتریان خودتان است؛ برای دیدن همه، فیلتر «مشاور» را بردارید."
              : "فیلترها را تغییر دهید یا مشتری تازه‌ای ثبت کنید."
          }
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
                  <LoaderCircle
                    data-icon="inline-start"
                    className="animate-spin"
                  />
                )}
                مشتریان بیشتر
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
          <Typography
            variant="small"
            className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1"
          >
            <span>کد {row.numericId.toLocaleString("fa-IR")}</span>
            {row.requestTypeLabel && <span>{row.requestTypeLabel}</span>}
            {row.estateTypeLabel && <span>{row.estateTypeLabel}</span>}
            {row.agentName && <span>مشاور: {row.agentName}</span>}
          </Typography>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {row.statusLabel && (
            <Badge variant="secondary">{row.statusLabel}</Badge>
          )}
          {row.isStale && (
            <Badge
              variant="secondary"
              className="gap-1 bg-secondary/20 text-secondary-foreground"
            >
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
        <Typography
          variant="small"
          className="flex flex-wrap items-center gap-x-3 gap-y-1"
        >
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
      <Typography
        as="span"
        variant="h4"
        className="block tabular-nums sm:text-base"
      >
        {value.toLocaleString("fa-IR")}
      </Typography>
      <Typography
        as="span"
        variant="small"
        className="block truncate text-[11px]"
      >
        {label}
      </Typography>
    </div>
  );
}
