"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Flag,
  Monitor,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  deleteReport,
  setReportStatus,
} from "@/app/panel/_admin/_api/admin-lists.service";
import { AdminGate } from "@/app/panel/_admin/_components/admin-gate";
import {
  adminListKeys,
  estateReportsQueryOptions,
} from "@/app/panel/_admin/_queries/admin-lists.query";
import {
  defaultEstateReportFilters,
  type EstateReportFilters,
} from "@/app/panel/_admin/_schemas/admin-lists.schema";
import { EmptyState } from "@/components/shared/empty-state";
import { filterChips, PanelFilterBar } from "@/components/shared/filter-bar";
import { FilterSelect } from "@/components/shared/form";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** What each status should look like once somebody has ruled on it. */
const statusTone: Record<string, string> = {
  pending: "bg-secondary/25 text-secondary-foreground",
  verified: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  rejected: "bg-muted text-muted-foreground",
};

/**
 * Problems visitors have reported against listings.
 *
 * A queue rather than a log: each row is waiting for somebody to accept or
 * dismiss it, so the decision is on the row and the default view is everything,
 * newest first.
 */
export function EstateReportsView() {
  const [filters, setFilters] = useState<EstateReportFilters>(
    defaultEstateReportFilters,
  );
  const [page, setPage] = useState(1);
  const [confirming, setConfirming] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const list = useQuery(estateReportsQueryOptions(filters, page));

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: adminListKeys.all });

  const decide = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      setReportStatus(id, status),
    onSuccess: async () => {
      toast.success("وضعیت گزارش ثبت شد.");
      await invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteReport(id),
    onSuccess: async () => {
      toast.success("گزارش حذف شد.");
      await invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const setFilter = (key: keyof EstateReportFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const meta = list.data?.meta;
  const items = list.data?.items ?? [];
  const statuses = list.data?.statuses ?? [];

  const chips = filterChips(
    filters,
    defaultEstateReportFilters,
    {
      estate_id: { label: "کد ملک" },
      status: { label: "وضعیت", options: statuses },
    },
    setFilter,
  );

  return (
    <AdminGate title="گزارش‌های مشکل فقط برای مدیران است">
      <div className="grid grid-cols-1 gap-4">
        <PanelFilterBar
          icon={Flag}
          count={meta?.total}
          unit="گزارش"
          pending={!meta}
          columns={2}
          chips={chips}
          onClear={() => {
            setFilters(defaultEstateReportFilters);
            setPage(1);
          }}
        >
          <Input
            value={filters.estate_id}
            onChange={(event) => setFilter("estate_id", event.target.value)}
            placeholder="کد ملک"
            aria-label="کد ملک"
            inputMode="numeric"
          />
          <FilterSelect
            label="همه‌ی وضعیت‌ها"
            value={filters.status}
            onChange={(value) => setFilter("status", value)}
            options={statuses}
          />
        </PanelFilterBar>

        {list.isPending && <ListSkeleton count={5} />}

        {list.isError && (
          <EmptyState
            icon={Flag}
            title="گزارش‌ها باز نشدند"
            description={getApiErrorMessage(list.error)}
          />
        )}

        {list.isSuccess && items.length === 0 && (
          <EmptyState
            icon={Flag}
            title="گزارشی با این فیلترها نیست"
            description="وضعیت یا کد ملک را تغییر دهید."
          />
        )}

        {items.map((row) => {
          const busy =
            (decide.isPending && decide.variables?.id === row.id) ||
            (remove.isPending && remove.variables === row.id);

          return (
            <article
              key={row.id}
              className={cn(
                "grid grid-cols-1 gap-2 rounded-xl border bg-card p-3.5",
                busy && "opacity-60",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant="secondary"
                    className={statusTone[row.status] ?? undefined}
                  >
                    {row.status_label || row.status}
                  </Badge>
                  {row.reason_group !== null && row.reason_group !== undefined && (
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                      دلیل {String(row.reason_group)}
                    </Badge>
                  )}
                </div>
                <Typography variant="small" className="tabular-nums">
                  {row.created_at_jalali}
                </Typography>
              </div>

              {row.description && (
                <Typography variant="small" className="text-foreground">
                  {row.description}
                </Typography>
              )}

              <Typography
                variant="small"
                className="flex flex-wrap items-center gap-x-3 gap-y-1"
              >
                {row.reporter?.mobile && (
                  <span className="tabular-nums">
                    {row.reporter.name?.trim() || "گزارش‌دهنده"}:{" "}
                    {row.reporter.mobile}
                  </span>
                )}
                {row.device && (
                  <span className="flex items-center gap-1">
                    <Monitor className="size-3.5 text-brand/70" />
                    {row.device}
                  </span>
                )}
              </Typography>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2.5">
                {row.estate ? (
                  <Typography variant="small">
                    <Link
                      href={routes.property(row.estate.id)}
                      className="flex items-center gap-1 hover:text-brand"
                    >
                      <Building2 className="size-3.5 text-brand/70" />
                      {row.estate.title?.trim() ||
                        `ملک ${row.estate.id.toLocaleString("fa-IR")}`}
                    </Link>
                  </Typography>
                ) : (
                  <span />
                )}

                {confirming === row.id ? (
                  <span className="flex items-center gap-1.5">
                    <Typography as="span" variant="small" className="text-destructive">
                      حذف قطعی؟
                    </Typography>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setConfirming(null);
                        remove.mutate(row.id);
                      }}
                    >
                      حذف
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirming(null)}
                    >
                      انصراف
                    </Button>
                  </span>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`عملیات گزارش ${row.id}`}
                        />
                      }
                    >
                      <MoreVertical className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuLabel>تغییر وضعیت</DropdownMenuLabel>
                      {statuses.map((entry) => (
                        <DropdownMenuItem
                          key={entry.value}
                          disabled={entry.value === row.status}
                          onClick={() =>
                            decide.mutate({ id: row.id, status: entry.value })
                          }
                        >
                          {entry.title}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setConfirming(row.id)}
                      >
                        <Trash2 className="size-4" />
                        حذف گزارش
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </article>
          );
        })}

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
