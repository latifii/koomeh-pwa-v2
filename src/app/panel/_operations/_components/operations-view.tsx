"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  RotateCcw,
  ShieldAlert,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { deleteOperation } from "@/app/panel/_operations/_api/operations.service";
import {
  OPERATIONS_PER_PAGE,
  operationFiltersQueryOptions,
  operationQueryKeys,
  operationsQueryOptions,
} from "@/app/panel/_operations/_queries/operations.query";
import {
  defaultOperationFilters,
  type OperationFilters,
  type OperationKind,
  type OperationRow,
} from "@/app/panel/_operations/_schemas/operations.schema";
import { useSessionStore } from "@/app/auth/_stores/auth.store";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/form";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { panelViewer } from "@/lib/auth/permissions";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * Both performance lists, which differ only in which endpoint they read and
 * which set of operation types they offer. Everything else — the agent and
 * branch filter, the Jalali range, the row, the delete — is the same, because
 * on the backend they are one table.
 */
export function OperationsView({ kind }: { kind: OperationKind }) {
  const user = useSessionStore((state) => state.session?.user);
  const viewer = useMemo(() => panelViewer(user), [user]);

  const [filters, setFilters] = useState<OperationFilters>(
    defaultOperationFilters,
  );
  const [page, setPage] = useState(1);
  const [confirming, setConfirming] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const options = useQuery(operationFiltersQueryOptions());
  const list = useQuery(operationsQueryOptions(kind, filters, page));

  const remove = useMutation({
    mutationFn: (id: number) => deleteOperation(id),
    onSuccess: async () => {
      toast.success("رکورد عملکرد حذف شد.");
      await queryClient.invalidateQueries({ queryKey: operationQueryKeys.all });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const setFilter = (key: keyof OperationFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  /**
   * One dropdown for both, because the API takes one field. A branch arrives
   * with a negative id for exactly this reason, so its value is passed through
   * unchanged; the prefix is only there so the two kinds are told apart.
   */
  const whoOptions = useMemo(() => {
    const branches = (options.data?.branches ?? []).map((branch) => ({
      value: branch.value,
      title: `شعبه‌ی ${branch.title}`,
    }));
    return [...branches, ...(options.data?.agents ?? [])];
  }, [options.data]);

  const typeOptions =
    (kind === "estate"
      ? options.data?.estate_operation_types
      : options.data?.customer_operation_types) ?? [];

  if (!viewer.isAdmin) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="این فهرست فقط برای مدیران است"
        description="عملکرد ثبت‌شده‌ی همه‌ی کارشناسان به دسترسی مدیر نیاز دارد."
      />
    );
  }

  const meta = list.data?.meta;
  const items = list.data?.items ?? [];
  const isFiltered = Object.values(filters).some((value) => value !== "");

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="grid grid-cols-1 gap-3 rounded-xl border bg-card p-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <FilterSelect
            label="همه‌ی کارشناسان"
            value={filters.user_id}
            onChange={(value) => setFilter("user_id", value)}
            options={whoOptions}
          />
          <FilterSelect
            label="همه‌ی نوع‌ها"
            value={filters.type}
            onChange={(value) => setFilter("type", value)}
            options={typeOptions}
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="ops-from">از تاریخ (شمسی)</Label>
            <Input
              id="ops-from"
              value={filters.datefrom}
              placeholder="۱۴۰۵/۰۶/۰۱"
              inputMode="numeric"
              onChange={(event) => setFilter("datefrom", event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ops-to">تا تاریخ (شمسی)</Label>
            <Input
              id="ops-to"
              value={filters.dateto}
              placeholder="۱۴۰۵/۰۶/۳۱"
              inputMode="numeric"
              onChange={(event) => setFilter("dateto", event.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Typography variant="small" className="flex items-center gap-1.5">
            <Activity className="size-3.5 text-brand/70" />
            {meta ? `${meta.total.toLocaleString("fa-IR")} رکورد` : "در حال شمردن…"}
            {list.data?.scope === "own" && " · فقط رکوردهای شما"}
          </Typography>

          {isFiltered && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilters(defaultOperationFilters);
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
          icon={ShieldAlert}
          title="فهرست عملکرد باز نشد"
          description={getApiErrorMessage(list.error)}
        />
      )}

      {list.isSuccess && items.length === 0 && (
        <EmptyState
          icon={Activity}
          title="رکوردی با این فیلترها نیست"
          description="بازه‌ی تاریخ یا کارشناس را تغییر دهید."
        />
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {items.map((row) => (
            <OperationCard
              key={row.id}
              row={row}
              busy={remove.isPending && remove.variables === row.id}
              confirming={confirming === row.id}
              onAskDelete={() => setConfirming(row.id)}
              onCancelDelete={() => setConfirming(null)}
              onDelete={() => {
                setConfirming(null);
                remove.mutate(row.id);
              }}
            />
          ))}
        </div>
      )}

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between gap-2 rounded-xl border bg-card p-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1 || list.isFetching}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            <ChevronRight />
            صفحه قبل
          </Button>
          <Typography variant="small" className="tabular-nums">
            صفحه {page.toLocaleString("fa-IR")} از{" "}
            {meta.last_page.toLocaleString("fa-IR")}
          </Typography>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= meta.last_page || list.isFetching}
            onClick={() => setPage((current) => current + 1)}
          >
            صفحه بعد
            <ChevronLeft />
          </Button>
        </div>
      )}

      {meta && meta.total > OPERATIONS_PER_PAGE && (
        <Typography variant="small">
          بازه‌ی تاریخ سریع‌ترین راه رسیدن به یک روز مشخص است.
        </Typography>
      )}
    </div>
  );
}

function OperationCard({
  row,
  busy,
  confirming,
  onAskDelete,
  onCancelDelete,
  onDelete,
}: {
  row: OperationRow;
  busy: boolean;
  confirming: boolean;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
}) {
  return (
    <article
      className={cn(
        "grid grid-cols-1 gap-2 rounded-xl border bg-card p-3.5",
        busy && "opacity-60",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {row.type_label && <Badge variant="secondary">{row.type_label}</Badge>}
          {row.expert?.name && (
            <Typography
              as="span"
              variant="small"
              className="flex items-center gap-1"
            >
              <UserRound className="size-3.5 text-brand/70" />
              {row.expert.name}
            </Typography>
          )}
        </div>

        <Typography variant="small" className="tabular-nums">
          {row.created_at_jalali}
        </Typography>
      </div>

      {row.comment && (
        <Typography variant="small" className="text-foreground">
          {row.comment}
        </Typography>
      )}

      {/* Agents can leave a voice note instead of typing one. */}
      {row.audio_url && (
        <audio controls preload="none" src={row.audio_url} className="w-full">
          <track kind="captions" />
        </audio>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2.5">
        <Typography
          variant="small"
          className="flex flex-wrap items-center gap-x-3 gap-y-1"
        >
          {/* Links are built from the id: the `url` the API returns is the old
              site's path, not this one's. */}
          {row.estate && (
            <Link
              href={routes.property(row.estate.id)}
              className="flex items-center gap-1 hover:text-brand"
            >
              <Building2 className="size-3.5 text-brand/70" />
              {row.estate.title?.trim() ||
                `ملک ${row.estate.id.toLocaleString("fa-IR")}`}
            </Link>
          )}
          {row.customer && (
            <Link
              href={routes.panel.request(row.customer.id)}
              className="flex items-center gap-1 hover:text-brand"
            >
              <ClipboardList className="size-3.5 text-brand/70" />
              {row.customer.name?.trim() ||
                `تقاضا ${row.customer.id.toLocaleString("fa-IR")}`}
            </Link>
          )}
        </Typography>

        {confirming ? (
          <span className="flex items-center gap-1.5">
            <Typography as="span" variant="small" className="text-destructive">
              حذف قطعی؟
            </Typography>
            <Button type="button" variant="destructive" size="sm" onClick={onDelete}>
              حذف
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onCancelDelete}>
              انصراف
            </Button>
          </span>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={onAskDelete}
          >
            <Trash2 />
            حذف
          </Button>
        )}
      </div>
    </article>
  );
}
