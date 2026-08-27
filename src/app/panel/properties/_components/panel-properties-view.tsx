"use client";

import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Building2, LoaderCircle, RotateCcw, Search } from "lucide-react";

import {
  actionCopy,
  useEstateStatus,
} from "@/app/panel/properties/_hooks/use-estate-status";
import {
  panelEstateFiltersQueryOptions,
  panelEstatesInfiniteQueryOptions,
} from "@/app/panel/properties/_queries/panel-estates.query";
import {
  defaultPanelEstateFilters,
  type PanelEstateFilters,
} from "@/app/panel/properties/_types/panel-estates.types";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";

import { PanelPropertyRow } from "./panel-property-row";

const ANY = "__any__";

/**
 * The panel's listing table. Which files come back depends on the caller's
 * role — the API answers with `scope.own_only` so the page can say whose files
 * these are without asking a second time.
 */
export function PanelPropertiesView() {
  const [filters, setFilters] = useState<PanelEstateFilters>(
    defaultPanelEstateFilters,
  );
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedQuery(filters.query.trim()),
      350,
    );
    return () => window.clearTimeout(timeout);
  }, [filters.query]);

  const options = useQuery(panelEstateFiltersQueryOptions());

  const params = useMemo(() => {
    // A numeric search is almost always a listing code, not a title.
    const asCode = /^\d{3,}$/.test(debouncedQuery)
      ? Number(debouncedQuery)
      : undefined;

    return {
      id: asCode,
      title: asCode ? undefined : debouncedQuery || undefined,
      confirmation: filters.confirmation || undefined,
      type: filters.dealType ? (Number(filters.dealType) as 1 | 2) : undefined,
      estateTypes: filters.estateType ? Number(filters.estateType) : undefined,
      visibility: filters.visibility
        ? (Number(filters.visibility) as 0 | 1)
        : undefined,
      user_id: filters.expert ? Number(filters.expert) : undefined,
      per_page: 12,
    };
  }, [debouncedQuery, filters]);

  const list = useInfiniteQuery(panelEstatesInfiniteQueryOptions(params));
  const status = useEstateStatus();

  const rows = list.data?.pages.flatMap((page) => page.items) ?? [];
  const total = list.data?.pages[0]?.total ?? 0;
  const scope = list.data?.pages[0]?.scope;
  const dialog = status.pending ? actionCopy[status.pending.action] : undefined;

  const set = (patch: Partial<PanelEstateFilters>) =>
    setFilters((current) => ({ ...current, ...patch }));

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 rounded-xl border bg-card p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.query}
            onChange={(event) => set({ query: event.target.value })}
            placeholder="جستجوی عنوان یا کد آگهی"
            aria-label="جستجوی عنوان یا کد آگهی"
            className="ps-9"
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
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
            <FilterSelect
              label="مشاور"
              value={filters.expert}
              onChange={(value) => set({ expert: value })}
              options={options.data?.experts ?? []}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Typography variant="small" className="flex items-center gap-1.5">
            <Building2 className="size-4 text-brand" />
            {list.isPending
              ? "در حال بارگذاری…"
              : `${total.toLocaleString("fa-IR")} آگهی`}
            {scope?.own_only === false && " (همه‌ی آگهی‌ها)"}
          </Typography>

          {filters !== defaultPanelEstateFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters(defaultPanelEstateFilters)}
            >
              <RotateCcw data-icon="inline-start" />
              پاک کردن فیلترها
            </Button>
          )}
        </div>
      </div>

      {list.isError ? (
        <EmptyState
          icon={RotateCcw}
          title="فهرست آگهی‌ها بارگذاری نشد"
          description={getApiErrorMessage(list.error)}
        />
      ) : list.isPending ? (
        <div className="grid gap-3">
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
          <div className="grid gap-3">
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

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; title: string }[];
}) {
  const items = useMemo(
    () => [
      { value: ANY, label },
      ...options.map((option) => ({ value: option.value, label: option.title })),
    ],
    [label, options],
  );

  return (
    <Select
      value={value || ANY}
      items={items}
      onValueChange={(next) => onChange(next === ANY ? "" : String(next ?? ""))}
    >
      <SelectTrigger aria-label={label} className="w-full">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
