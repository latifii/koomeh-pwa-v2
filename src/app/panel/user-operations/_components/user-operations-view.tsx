"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardPen,
  Plus,
  ShieldAlert,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { operationFiltersQueryOptions } from "@/app/panel/_operations/_queries/operations.query";
import { usePanelAccess } from "@/app/panel/_admin/_components/admin-gate";
import { deleteUserOperation } from "@/app/panel/user-operations/_api/user-operations.service";
import {
  USER_OPERATIONS_PER_PAGE,
  userOperationQueryKeys,
  userOperationsQueryOptions,
} from "@/app/panel/user-operations/_queries/user-operations.query";
import {
  defaultUserOperationFilters,
  USER_OPERATION_TYPE,
  type UserOperationFilters,
  type UserOperationRow,
} from "@/app/panel/user-operations/_schemas/user-operations.schema";
import { EmptyState } from "@/components/shared/empty-state";
import { filterChips, PanelFilterBar } from "@/components/shared/filter-bar";
import {
  FilterCombobox,
  FilterSelect,
  JalaliDateInput,
} from "@/components/shared/form";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { toJalaliDisplay } from "@/lib/jalali-date";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { UserOperationFormDialog } from "./user-operation-form";

/**
 * The agents' disciplinary log: who was late, who came without the dress code,
 * who the manager gave points to. Same filter bar as the other two performance
 * lists — they share the agent and branch dropdown — plus the entry form the
 * old page had above its table, here behind a button.
 */
export function UserOperationsView() {
  const access = usePanelAccess("admin");

  const [filters, setFilters] = useState<UserOperationFilters>(
    defaultUserOperationFilters,
  );
  const [page, setPage] = useState(1);
  const [confirming, setConfirming] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  const queryClient = useQueryClient();
  const options = useQuery(operationFiltersQueryOptions(access.allowed));
  const list = useQuery(userOperationsQueryOptions(filters, page));

  const remove = useMutation({
    mutationFn: (id: number) => deleteUserOperation(id),
    onSuccess: async () => {
      toast.success("رکورد عملکرد حذف شد.");
      await queryClient.invalidateQueries({
        queryKey: userOperationQueryKeys.all,
      });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const setFilter = (key: keyof UserOperationFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  // One dropdown for both: a branch arrives with a negative id so its value
  // can go to the same `user_id` field untouched.
  const whoOptions = useMemo(() => {
    const branches = (options.data?.branches ?? []).map((branch) => ({
      value: branch.value,
      title: `شعبه‌ی ${branch.title}`,
    }));
    return [...branches, ...(options.data?.agents ?? [])];
  }, [options.data]);

  const typeOptions = options.data?.user_operation_types ?? [];

  // Nothing is refused until the session has actually been read; an unread
  // one looks exactly like a visitor with no roles.
  if (access.pending) return <ListSkeleton count={5} />;

  if (!access.allowed) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="این فهرست فقط برای مدیران است"
        description="عملکرد کارشناسان را مدیر ثبت می‌کند و می‌بیند."
      />
    );
  }

  const meta = list.data?.meta;
  const items = list.data?.items ?? [];
  const canDelete = list.data?.can_delete ?? false;

  const chips = filterChips(
    filters,
    defaultUserOperationFilters,
    {
      user_id: { label: "کارشناس", options: whoOptions },
      type: { label: "نوع", options: typeOptions },
      datefrom: { label: "از", format: toJalaliDisplay },
      dateto: { label: "تا", format: toJalaliDisplay },
    },
    setFilter,
  );

  return (
    <div className="grid grid-cols-1 gap-4">
      <PanelFilterBar
        icon={ClipboardPen}
        count={meta?.total}
        unit="رکورد"
        pending={!meta}
        chips={chips}
        onClear={() => {
          setFilters(defaultUserOperationFilters);
          setPage(1);
        }}
        actions={
          <Button
            type="button"
            variant="secondary"
            onClick={() => setAdding(true)}
            disabled={!options.data}
          >
            <Plus />
            ثبت عملکرد
          </Button>
        }
      >
        {/* Typing, not scrolling: this list is every agent and every branch. */}
        <FilterCombobox
          label="همه‌ی کارشناسان"
          value={filters.user_id}
          onChange={(value) => setFilter("user_id", value)}
          options={whoOptions}
          emptyText="کارشناسی با این نام نیست"
        />
        <FilterSelect
          label="همه‌ی نوع‌ها"
          value={filters.type}
          onChange={(value) => setFilter("type", value)}
          options={typeOptions}
        />
        <JalaliDateInput
          value={filters.datefrom}
          placeholder="از تاریخ"
          aria-label="از تاریخ"
          onChange={(value) => setFilter("datefrom", value)}
        />
        <JalaliDateInput
          value={filters.dateto}
          placeholder="تا تاریخ"
          aria-label="تا تاریخ"
          onChange={(value) => setFilter("dateto", value)}
        />
      </PanelFilterBar>

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
          icon={ClipboardPen}
          title="رکوردی با این فیلترها نیست"
          description="بازه‌ی تاریخ یا کارشناس را تغییر دهید، یا عملکرد تازه‌ای ثبت کنید."
        />
      )}

      {items.length > 0 && (
        <div className="grid grid-cols-1 gap-3">
          {items.map((row) => (
            <UserOperationCard
              key={row.id}
              row={row}
              canDelete={canDelete}
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

      {meta && meta.total > USER_OPERATIONS_PER_PAGE && (
        <Typography variant="small">
          بازه‌ی تاریخ سریع‌ترین راه رسیدن به یک روز مشخص است.
        </Typography>
      )}

      <UserOperationFormDialog
        open={adding}
        onOpenChange={setAdding}
        agents={options.data?.agents ?? []}
        types={typeOptions}
      />
    </div>
  );
}

/** «۱۵ دقیقه» for a delay, «+۳» for points — the raw comment means little on its own. */
function commentLabel(row: UserOperationRow): string | undefined {
  const comment = row.comment?.trim();
  if (!comment) return undefined;

  const numeric = Number(comment);
  if (String(row.type) === USER_OPERATION_TYPE.DELAY && Number.isFinite(numeric)) {
    return `${numeric.toLocaleString("fa-IR")} دقیقه تأخیر`;
  }
  if (String(row.type) === USER_OPERATION_TYPE.MANAGEMENT) {
    return undefined; // the score badge already says it
  }
  return comment;
}

function UserOperationCard({
  row,
  canDelete,
  busy,
  confirming,
  onAskDelete,
  onCancelDelete,
  onDelete,
}: {
  row: UserOperationRow;
  canDelete: boolean;
  busy: boolean;
  confirming: boolean;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
}) {
  const note = commentLabel(row);
  const score = row.score;
  const scoreLabel =
    score > 0
      ? `+${score.toLocaleString("fa-IR")}`
      : score.toLocaleString("fa-IR");

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
          {/* The sign is the whole message: a delay costs, a dress code earns. */}
          <Badge
            variant={score < 0 ? "destructive" : score > 0 ? "default" : "outline"}
            className="tabular-nums"
            aria-label={`امتیاز ${scoreLabel}`}
          >
            {scoreLabel}
          </Badge>
          {row.expert && (
            <Link
              href={routes.agent(row.expert.id)}
              className="flex items-center gap-1 text-sm hover:text-brand"
            >
              <UserRound className="size-3.5 text-brand/70" />
              {row.expert.name?.trim() ||
                `کارشناس ${row.expert.id.toLocaleString("fa-IR")}`}
            </Link>
          )}
        </div>

        <Typography variant="small" className="tabular-nums">
          {row.created_at_jalali}
        </Typography>
      </div>

      {note && (
        <Typography variant="small" className="text-foreground">
          {note}
        </Typography>
      )}

      {canDelete && (
        <div className="flex items-center justify-end gap-2 border-t pt-2.5">
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
      )}
    </article>
  );
}
