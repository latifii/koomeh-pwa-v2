"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Check,
  ClipboardList,
  Eye,
  EyeOff,
  MousePointerClick,
  Network,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  decideRelation,
  deleteRelation,
  setRelationPriority,
} from "@/app/panel/_admin/_api/admin-lists.service";
import { AdminGate } from "@/app/panel/_admin/_components/admin-gate";
import {
  adminListKeys,
  relationsQueryOptions,
} from "@/app/panel/_admin/_queries/admin-lists.query";
import {
  defaultRelationFilters,
  type RelationFilters,
} from "@/app/panel/_admin/_schemas/admin-lists.schema";
import { EmptyState } from "@/components/shared/empty-state";
import { filterChips, PanelFilterBar } from "@/components/shared/filter-bar";
import { FilterCombobox, FilterSelect } from "@/components/shared/form";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/** Smaller sorts higher, and the backend names the tiers. */
const PRIORITIES = [
  { value: 0, title: "برنزی" },
  { value: 1, title: "نقره‌ای" },
  { value: 2, title: "طلایی" },
];

/**
 * Listings suggested to a demand, waiting to be accepted or turned down.
 *
 * Two million rows, so nothing useful happens here without a filter — a
 * listing, a demand, or one agent's queue. Which buttons a row offers is the
 * API's decision: only the demand's own agent or an administrator may rule on
 * one, and only an administrator may delete.
 */
export function RelationsView() {
  const [filters, setFilters] = useState<RelationFilters>(defaultRelationFilters);
  const [page, setPage] = useState(1);
  const [confirming, setConfirming] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const list = useQuery(relationsQueryOptions(filters, page));

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: adminListKeys.all });

  const decide = useMutation({
    mutationFn: ({ id, action }: { id: number; action: "confirm" | "reject" }) =>
      decideRelation(id, action),
    onSuccess: async (_data, variables) => {
      toast.success(
        variables.action === "confirm" ? "فایل تایید شد." : "فایل رد شد.",
      );
      await invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const prioritise = useMutation({
    mutationFn: ({ id, priority }: { id: number; priority: number }) =>
      setRelationPriority(id, priority),
    onSuccess: async () => {
      toast.success("اولویت تغییر کرد.");
      await invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteRelation(id),
    onSuccess: async () => {
      toast.success("فایل پیشنهادی حذف شد.");
      await invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const setFilter = (key: keyof RelationFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const meta = list.data?.meta;
  const items = list.data?.items ?? [];

  const chips = filterChips(
    filters,
    defaultRelationFilters,
    {
      estate_id: { label: "کد ملک" },
      customer_id: { label: "کد تقاضا" },
      customer_expert_id: {
        label: "مشاور",
        options: list.data?.agents ?? [],
      },
      status: { label: "وضعیت", options: list.data?.statuses ?? [] },
    },
    setFilter,
  );

  return (
    <AdminGate title="مشتریان و املاک متناسب فقط برای مدیران است">
      <div className="grid grid-cols-1 gap-4">
        <PanelFilterBar
          icon={Network}
          count={meta?.total}
          unit="پیشنهاد"
          pending={!meta}
          columns={4}
          chips={chips}
          onClear={() => {
            setFilters(defaultRelationFilters);
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
          <Input
            value={filters.customer_id}
            onChange={(event) => setFilter("customer_id", event.target.value)}
            placeholder="کد تقاضا"
            aria-label="کد تقاضا"
            inputMode="numeric"
          />
          <FilterCombobox
            label="همه‌ی مشاوران"
            value={filters.customer_expert_id}
            onChange={(value) => setFilter("customer_expert_id", value)}
            options={list.data?.agents ?? []}
            emptyText="مشاوری با این نام نیست"
          />
          <FilterSelect
            label="همه‌ی وضعیت‌ها"
            value={filters.status}
            onChange={(value) => setFilter("status", value)}
            options={list.data?.statuses ?? []}
          />
        </PanelFilterBar>

        {list.isPending && <ListSkeleton count={5} />}

        {list.isError && (
          <EmptyState
            icon={Network}
            title="فهرست باز نشد"
            description={getApiErrorMessage(list.error)}
          />
        )}

        {list.isSuccess && items.length === 0 && (
          <EmptyState
            icon={Network}
            title="پیشنهادی با این فیلترها نیست"
            description="کد ملک، کد تقاضا یا مشاور را تغییر دهید."
          />
        )}

        {items.map((row) => {
          const busy =
            (decide.isPending && decide.variables?.id === row.id) ||
            (prioritise.isPending && prioritise.variables?.id === row.id) ||
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
                  <Badge variant="secondary">{row.status_label}</Badge>
                  {row.priority_label && (
                    <Badge variant="secondary" className="bg-muted text-muted-foreground">
                      {row.priority_label}
                    </Badge>
                  )}
                  <Typography
                    as="span"
                    variant="small"
                    className="flex items-center gap-1"
                  >
                    {row.seen_estate ? (
                      <Eye className="size-3.5 text-brand/70" />
                    ) : (
                      <EyeOff className="size-3.5" />
                    )}
                    {row.seen_estate ? "دیده شده" : "دیده نشده"}
                  </Typography>
                  {row.click_count > 0 && (
                    <Typography
                      as="span"
                      variant="small"
                      className="flex items-center gap-1"
                    >
                      <MousePointerClick className="size-3.5 text-brand/70" />
                      {row.click_count.toLocaleString("fa-IR")}
                    </Typography>
                  )}
                </div>
                <Typography variant="small" className="tabular-nums">
                  {row.created_at_jalali}
                </Typography>
              </div>

              <Typography
                variant="small"
                className="flex flex-wrap items-center gap-x-3 gap-y-1"
              >
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
                {row.customer_expert?.name && (
                  <span>مشاور تقاضا: {row.customer_expert.name}</span>
                )}
              </Typography>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2.5">
                <span className="flex flex-wrap items-center gap-1.5">
                  {/* Only where the API says this caller may rule on it. */}
                  {row.permissions.can_decide && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          decide.mutate({ id: row.id, action: "confirm" })
                        }
                      >
                        <Check />
                        تایید
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          decide.mutate({ id: row.id, action: "reject" })
                        }
                      >
                        <X />
                        رد
                      </Button>
                    </>
                  )}

                  {PRIORITIES.map((tier) => (
                    <Button
                      key={tier.value}
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={row.priority === tier.value}
                      onClick={() =>
                        prioritise.mutate({ id: row.id, priority: tier.value })
                      }
                    >
                      {tier.title}
                    </Button>
                  ))}
                </span>

                {row.permissions.can_delete &&
                  (confirming === row.id ? (
                    <span className="flex items-center gap-1.5">
                      <Typography
                        as="span"
                        variant="small"
                        className="text-destructive"
                      >
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => setConfirming(row.id)}
                    >
                      <Trash2 />
                      حذف
                    </Button>
                  ))}
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
