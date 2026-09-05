"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Building2, FileClock, RotateCcw, UserRound } from "lucide-react";

import { AdminGate } from "@/app/panel/_admin/_components/admin-gate";
import { estateEditsQueryOptions } from "@/app/panel/_admin/_queries/admin-lists.query";
import {
  defaultEstateEditFilters,
  type EstateEditFilters,
} from "@/app/panel/_admin/_schemas/admin-lists.schema";
import { EmptyState } from "@/components/shared/empty-state";
import {
  FilterCombobox,
  FilterSelect,
  JalaliDateInput,
} from "@/components/shared/form";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { routes } from "@/lib/routes";

/**
 * Every column change ever made to a listing, newest first.
 *
 * Read-only by design: this is the log the update endpoint writes to, and the
 * point of a log is that nobody edits it. Three quarters of a million rows, so
 * the filters — one listing, one agent, one column, a date range — are how it
 * is used.
 */
export function EstateEditsView() {
  const [filters, setFilters] = useState<EstateEditFilters>(
    defaultEstateEditFilters,
  );
  const [page, setPage] = useState(1);
  const list = useQuery(estateEditsQueryOptions(filters, page));

  const setFilter = (key: keyof EstateEditFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const meta = list.data?.meta;
  const items = list.data?.items ?? [];
  const isFiltered = Object.values(filters).some((value) => value !== "");

  return (
    <AdminGate title="تاریخچه‌ی ویرایش‌ها فقط برای مدیران است">
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 gap-3 rounded-xl border bg-card p-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Input
              value={filters.estate_id}
              onChange={(event) => setFilter("estate_id", event.target.value)}
              placeholder="کد ملک"
              inputMode="numeric"
            />
            <FilterCombobox
              label="همه‌ی کارشناسان"
              value={filters.user_id}
              onChange={(value) => setFilter("user_id", value)}
              options={list.data?.agents ?? []}
              emptyText="کارشناسی با این نام نیست"
            />
            <FilterSelect
              label="همه‌ی فیلدها"
              value={filters.type}
              onChange={(value) => setFilter("type", value)}
              options={list.data?.fields ?? []}
            />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="edits-from">از تاریخ</Label>
              <JalaliDateInput
                id="edits-from"
                value={filters.datefrom}
                placeholder="از ابتدا"
                onChange={(value) => setFilter("datefrom", value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edits-to">تا تاریخ</Label>
              <JalaliDateInput
                id="edits-to"
                value={filters.dateto}
                placeholder="تا امروز"
                onChange={(value) => setFilter("dateto", value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <Typography variant="small" className="flex items-center gap-1.5">
              <FileClock className="size-3.5 text-brand/70" />
              {meta ? `${meta.total.toLocaleString("fa-IR")} تغییر` : "در حال شمردن…"}
            </Typography>
            {isFiltered && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilters(defaultEstateEditFilters);
                  setPage(1);
                }}
              >
                <RotateCcw />
                پاک کردن فیلترها
              </Button>
            )}
          </div>
        </div>

        {list.isPending && <ListSkeleton count={6} />}

        {list.isError && (
          <EmptyState
            icon={FileClock}
            title="تاریخچه باز نشد"
            description={getApiErrorMessage(list.error)}
          />
        )}

        {list.isSuccess && items.length === 0 && (
          <EmptyState
            icon={FileClock}
            title="تغییری با این فیلترها نیست"
            description="کد ملک، کارشناس یا بازه‌ی تاریخ را تغییر دهید."
          />
        )}

        {items.map((row) => (
          <article
            key={row.id}
            className="grid grid-cols-1 gap-2 rounded-xl border bg-card p-3.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="secondary">{row.field_label || row.type}</Badge>
                {row.user?.name && (
                  <Typography
                    as="span"
                    variant="small"
                    className="flex items-center gap-1"
                  >
                    <UserRound className="size-3.5 text-brand/70" />
                    {row.user.name}
                  </Typography>
                )}
              </div>
              <Typography variant="small" className="tabular-nums">
                {row.created_at_jalali}
              </Typography>
            </div>

            {/* Old value, arrow, new value — the whole point of the row. */}
            <div className="flex flex-wrap items-center gap-2">
              <Typography
                as="span"
                variant="small"
                className="rounded-md bg-muted px-2 py-1 text-muted-foreground line-through"
              >
                {row.from?.trim() || "—"}
              </Typography>
              <ArrowLeft className="size-3.5 shrink-0 text-muted-foreground" />
              <Typography
                as="span"
                variant="small"
                className="rounded-md bg-brand/10 px-2 py-1 font-medium text-brand"
              >
                {row.to?.trim() || "—"}
              </Typography>
            </div>

            <Typography variant="small" className="border-t pt-2.5">
              <Link
                href={routes.property(row.estate_id)}
                className="flex w-fit items-center gap-1 hover:text-brand"
              >
                <Building2 className="size-3.5 text-brand/70" />
                ملک {row.estate_id.toLocaleString("fa-IR")}
              </Link>
            </Typography>
          </article>
        ))}

        {meta && (
          <Pagination
            page={page}
            lastPage={meta.last_page}
            busy={list.isFetching}
            onChange={setPage}
          />
        )}
      </div>
    </AdminGate>
  );
}
