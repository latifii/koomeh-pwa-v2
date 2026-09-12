"use client";

import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  LoaderCircle,
  Map,
  Rows3,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";

import {
  actionCopy,
  useEstateStatus,
} from "@/app/panel/properties/_hooks/use-estate-status";
import {
  panelEstateFiltersQueryOptions,
  panelEstateMapQueryOptions,
  panelEstatesInfiniteQueryOptions,
} from "@/app/panel/properties/_queries/panel-estates.query";
import {
  countAdvancedFilters,
  estateFilterParams,
  PANEL_ESTATE_PAGE_SIZES,
  PANEL_ESTATE_SORT_OPTIONS,
} from "@/app/panel/properties/_lib/estate-filter-params";
import {
  defaultPanelEstateFilters,
  type PanelEstateFilters,
} from "@/app/panel/properties/_types/panel-estates.types";
import { EmptyState } from "@/components/shared/empty-state";
import { filterChips, PanelFilterBar } from "@/components/shared/filter-bar";
import { FilterCombobox, FilterSelect } from "@/components/shared/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { toJalaliDisplay } from "@/lib/jalali-date";

import { EstateFiltersDrawer } from "./estate-filters-drawer";
import { PanelPropertyRow } from "./panel-property-row";

/**
 * The panel's listing table. Which files come back depends on the caller's
 * role — the API answers with `scope.own_only` so the page can say whose files
 * these are without asking a second time.
 */
const PanelEstatesMap = dynamic(
  () => import("./panel-estates-map").then((mod) => mod.PanelEstatesMap),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[32rem] rounded-2xl" />,
  },
);

/**
 * A link may arrive with a filter already chosen — the dashboard's «املاک
 * منقضی» card opens this page with `?isexpire=1`, as the old one did.
 */
function initialFilters(search: URLSearchParams): PanelEstateFilters {
  return {
    ...defaultPanelEstateFilters,
    isExpire: search.get("isexpire") === "1" ? "1" : "",
    confirmation: search.get("confirmation") ?? "",
    expert: search.get("user_id") ?? "",
  };
}

export function PanelPropertiesView() {
  const search = useSearchParams();
  const [filters, setFilters] = useState<PanelEstateFilters>(() =>
    initialFilters(search),
  );
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedQuery(filters.query.trim()),
      350,
    );
    return () => window.clearTimeout(timeout);
  }, [filters.query]);

  const options = useQuery(panelEstateFiltersQueryOptions());

  const params = useMemo(
    () => estateFilterParams(filters, debouncedQuery),
    [debouncedQuery, filters],
  );

  const [view, setView] = useState<"list" | "map">("list");
  const list = useInfiniteQuery(panelEstatesInfiniteQueryOptions(params));
  const mapQuery = useQuery(panelEstateMapQueryOptions(params, view === "map"));
  const status = useEstateStatus();

  const rows = list.data?.pages.flatMap((page) => page.items) ?? [];
  const total = list.data?.pages[0]?.total ?? 0;
  const scope = list.data?.pages[0]?.scope ?? options.data?.scope;
  const isStaff = scope ? scope.role !== "user" : false;
  const advancedCount = countAdvancedFilters(filters, defaultPanelEstateFilters);
  const dialog = status.pending ? actionCopy[status.pending.action] : undefined;

  const set = (patch: Partial<PanelEstateFilters>) =>
    setFilters((current) => ({ ...current, ...patch }));

  const isFiltered = Object.entries(filters).some(
    ([key, value]) =>
      value !== defaultPanelEstateFilters[key as keyof PanelEstateFilters],
  );

  const money = (value: string) =>
    Number(value) ? `${Number(value).toLocaleString("fa-IR")} تومان` : value;
  const yes = () => "بله";
  const count = (unit: string) => (value: string) =>
    `${value.split(",").length.toLocaleString("fa-IR")} ${unit}`;

  const chips = filterChips(
    filters,
    defaultPanelEstateFilters,
    {
      confirmation: { label: "وضعیت", options: options.data?.confirmation_statuses ?? [] },
      dealType: { label: "معامله", options: options.data?.deal_types ?? [] },
      estateType: { label: "نوع", options: options.data?.estate_types ?? [] },
      expert: { label: "مشاور", options: options.data?.experts ?? [] },
      expertType: { label: "نوع مشاور", options: options.data?.expert_types ?? [] },
      visibility: { label: "نمایش", options: [{ value: "1", title: "قابل نمایش" }, { value: "0", title: "مخفی" }] },
      divar: { label: "منبع", options: [{ value: "1", title: "دیوار" }, { value: "2", title: "غیر دیوار" }] },
      ownerName: { label: "مالک" },
      ownerPhone: { label: "موبایل مالک" },
      buildingName: { label: "مجتمع" },
      cityId: { label: "شهر" },
      areaId: { label: "منطقه" },
      districtIds: { label: "محله", format: count("محله") },
      priceMin: { label: "مبلغ از", format: money },
      priceMax: { label: "مبلغ تا", format: money },
      pricePerMeterMin: { label: "متری از", format: money },
      pricePerMeterMax: { label: "متری تا", format: money },
      mortgageMin: { label: "رهن از", format: money },
      mortgageMax: { label: "رهن تا", format: money },
      rentMin: { label: "اجاره از", format: money },
      rentMax: { label: "اجاره تا", format: money },
      areaMin: { label: "مساحت از" },
      areaMax: { label: "مساحت تا" },
      builtAreaMin: { label: "زیربنا از" },
      builtAreaMax: { label: "زیربنا تا" },
      streetWidth: { label: "عرض گذر" },
      buildDensity: { label: "تراکم" },
      builtYearMin: { label: "سن بنا از" },
      builtYearMax: { label: "سن بنا تا" },
      roomCount: { label: "اتاق" },
      floorCount: { label: "طبقات بیش از" },
      floorMin: { label: "طبقه از" },
      floorMax: { label: "طبقه تا" },
      unitInFloor: { label: "واحد در طبقه" },
      unitInComplex: { label: "واحد در مجتمع" },
      floorStart: { label: "شروع طبقات" },
      usageType: { label: "کاربری" },
      documentType: { label: "سند" },
      buildLicense: { label: "پروانه" },
      positionType: { label: "موقعیت" },
      geography: { label: "جهت" },
      facilities: { label: "امکانات", format: count("مورد") },
      conditions: { label: "شرایط", format: count("مورد") },
      createFrom: { label: "ثبت از", format: toJalaliDisplay },
      createTo: { label: "ثبت تا", format: toJalaliDisplay },
      showFrom: { label: "انتشار از", format: toJalaliDisplay },
      showTo: { label: "انتشار تا", format: toJalaliDisplay },
      deliveryFrom: { label: "تحویل از", format: toJalaliDisplay },
      deliveryTo: { label: "تحویل تا", format: toJalaliDisplay },
      photo: { label: "عکس‌دار", format: yes },
      video: { label: "فیلم‌دار", format: yes },
      vr: { label: "تور مجازی", format: yes },
      urgent: { label: "ویژه", format: yes },
      keynot: { label: "کلید نخورده", format: yes },
      oneBuilding: { label: "فروش یک‌جا", format: yes },
      separateVilla: { label: "ویلای مجزا", format: yes },
      exchange: { label: "معاوضه", format: yes },
      existingDocument: { label: "سند موجود", format: yes },
      favorite: { label: "نشان‌شده‌ها", format: yes },
      myExpert: { label: "حوزه‌ی کاری من", format: yes },
      isExpire: { label: "منقضی", format: yes },
    },
    (key, value) => set({ [key]: value }),
  );

  return (
    <div className="grid grid-cols-1 gap-4">
      <PanelFilterBar
        icon={Building2}
        count={list.isPending ? undefined : total}
        unit="آگهی"
        pending={list.isPending}
        note={scope?.own_only === false ? "همه‌ی آگهی‌ها" : undefined}
        columns={4}
        search={{
          value: filters.query,
          onChange: (value) => set({ query: value }),
          placeholder: "جستجوی عنوان یا کد آگهی",
        }}
        chips={chips}
        isFiltered={isFiltered}
        onClear={() => setFilters(defaultPanelEstateFilters)}
        actions={
          <span className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setDrawerOpen(true)}>
              <SlidersHorizontal data-icon="inline-start" />
              فیلترهای بیشتر
              {advancedCount > 0 && (
                <Badge variant="outline" className="bg-background tabular-nums">
                  {advancedCount.toLocaleString("fa-IR")}
                </Badge>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView(view === "list" ? "map" : "list")}
            >
              {view === "list" ? (
                <Map data-icon="inline-start" />
              ) : (
                <Rows3 data-icon="inline-start" />
              )}
              {view === "list" ? "نقشه" : "فهرست"}
            </Button>
          </span>
        }
      >
        <FilterSelect
          label="وضعیت"
          value={filters.confirmation}
          onChange={(value) => set({ confirmation: value })}
          options={options.data?.confirmation_statuses ?? []}
        />
        <FilterSelect
          label="نوع معامله"
          value={filters.dealType}
          onChange={(value) => set({ dealType: value })}
          options={options.data?.deal_types ?? []}
        />
        <FilterSelect
          label="نوع ملک"
          value={filters.estateType}
          onChange={(value) => set({ estateType: value })}
          options={options.data?.estate_types ?? []}
        />
        {/* The API only fills the expert list for staff. */}
        {(options.data?.experts.length ?? 0) > 0 && (
          <FilterCombobox
            label="مشاور"
            value={filters.expert}
            onChange={(value) => set({ expert: value })}
            options={options.data?.experts ?? []}
            emptyText="مشاوری با این نام نیست"
          />
        )}
        {/* Sorting is the API's to allow — only staff had it on the old page. */}
        {scope?.can_sort && (
          <FilterSelect
            label="مرتب‌سازی: تاریخ انتشار"
            value={filters.order}
            onChange={(value) =>
              set({ order: value, orderBy: value ? filters.orderBy || "desc" : "" })
            }
            options={[...PANEL_ESTATE_SORT_OPTIONS]}
          />
        )}
        {scope?.can_sort && filters.order && (
          <FilterSelect
            label="نزولی"
            value={filters.orderBy}
            onChange={(value) => set({ orderBy: value })}
            options={[
              { value: "desc", title: "نزولی" },
              { value: "asc", title: "صعودی" },
            ]}
          />
        )}
        <FilterSelect
          label="تعداد نمایش: ۱۲"
          value={filters.perPage}
          onChange={(value) => set({ perPage: value })}
          options={PANEL_ESTATE_PAGE_SIZES.map((size) => ({
            value: size,
            title: `${Number(size).toLocaleString("fa-IR")} در صفحه`,
          }))}
        />
      </PanelFilterBar>

      <EstateFiltersDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        filters={filters}
        options={options.data}
        canFilterDates={scope?.can_filter_dates ?? false}
        isStaff={isStaff}
        onApply={setFilters}
      />

      {view === "map" ? (
        <div className="space-y-2">
          {mapQuery.isError && (
            <EmptyState
              icon={Map}
              title="نقشه بارگذاری نشد"
              description={getApiErrorMessage(mapQuery.error)}
            />
          )}

          {mapQuery.isPending && <Skeleton className="h-[32rem] rounded-2xl" />}

          {mapQuery.isSuccess && (
            <>
              <PanelEstatesMap markers={mapQuery.data.items} />
              {/* The two counts differ on purpose: the API drops any listing
                  without coordinates, and saying so beats letting the numbers
                  quietly disagree. */}
              <Typography variant="small" className="text-muted-foreground">
                {`${mapQuery.data.items.length.toLocaleString("fa-IR")} از ${total.toLocaleString("fa-IR")} آگهی مختصات دارند.`}
              </Typography>
            </>
          )}
        </div>
      ) : list.isError ? (
        <EmptyState
          icon={RotateCcw}
          title="فهرست آگهی‌ها بارگذاری نشد"
          description={getApiErrorMessage(list.error)}
        />
      ) : list.isPending ? (
        <div className="grid grid-cols-1 gap-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="آگهی‌ای پیدا نشد"
          description="فیلترها را تغییر دهید یا اولین ملک خود را ثبت کنید."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3">
            {rows.map((row) => (
              <PanelPropertyRow key={row.id} row={row} onAction={status.ask} />
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
                آگهی‌های بیشتر
              </Button>
            </div>
          )}
        </>
      )}

      {/* Nothing above calls the API directly — every action lands here first. */}
      <Dialog
        open={Boolean(status.pending)}
        onOpenChange={(open) => !open && status.cancel()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{dialog?.title}</DialogTitle>
            <DialogDescription>{dialog?.body}</DialogDescription>
          </DialogHeader>

          {status.pending && (
            <Typography
              variant="small"
              className="rounded-lg border bg-muted/40 p-3 font-medium text-foreground"
            >
              {status.pending.title}
            </Typography>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={status.cancel}>
              انصراف
            </Button>
            <Button
              variant={dialog?.danger ? "destructive" : "default"}
              onClick={status.confirm}
              disabled={status.isRunning}
            >
              {status.isRunning && <Spinner data-icon="inline-start" />}
              {dialog?.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
