"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  EyeOff,
  MapPin,
  Pencil,
  Phone,
  RotateCcw,
  Store,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { AdminGate } from "@/app/panel/_admin/_components/admin-gate";
import {
  deleteBranch,
  setBranchStatus,
} from "@/app/panel/branches/_api/branches.service";
import {
  branchKeys,
  branchesQueryOptions,
} from "@/app/panel/branches/_queries/branches.query";
import {
  defaultBranchFilters,
  type BranchFilters,
} from "@/app/panel/branches/_schemas/branches.schema";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/form";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "1", title: "تایید شده" },
  { value: "0", title: "تایید نشده" },
];

/** The offices, as the public branches page shows them — plus the unapproved. */
export function BranchesView() {
  const [filters, setFilters] = useState<BranchFilters>(defaultBranchFilters);
  const [page, setPage] = useState(1);
  const [confirming, setConfirming] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const list = useQuery(branchesQueryOptions(filters, page));

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: branchKeys.all });

  const status = useMutation({
    mutationFn: ({ id, value }: { id: number; value: number }) =>
      setBranchStatus(id, value),
    onSuccess: async () => {
      toast.success("وضعیت شعبه تغییر کرد.");
      await invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteBranch(id),
    onSuccess: async () => {
      toast.success("شعبه حذف شد.");
      await invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const setFilter = (key: keyof BranchFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const meta = list.data?.meta;
  const items = list.data?.items ?? [];
  const isFiltered = Object.values(filters).some((value) => value !== "");

  return (
    <AdminGate title="مدیریت شعب فقط برای مدیران است">
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 gap-3 rounded-xl border bg-card p-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Input
              value={filters.name}
              onChange={(event) => setFilter("name", event.target.value)}
              placeholder="جست‌وجوی نام شعبه"
            />
            <FilterSelect
              label="همه‌ی وضعیت‌ها"
              value={filters.status}
              onChange={(value) => setFilter("status", value)}
              options={STATUS_OPTIONS}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <Typography variant="small" className="flex items-center gap-1.5">
              <Store className="size-3.5 text-brand/70" />
              {meta ? `${meta.total.toLocaleString("fa-IR")} شعبه` : "در حال شمردن…"}
            </Typography>
            {isFiltered && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilters(defaultBranchFilters);
                  setPage(1);
                }}
              >
                <RotateCcw />
                پاک کردن فیلترها
              </Button>
            )}
          </div>
        </div>

        {list.isPending && <ListSkeleton count={3} />}

        {list.isError && (
          <EmptyState
            icon={Store}
            title="فهرست شعب باز نشد"
            description={getApiErrorMessage(list.error)}
          />
        )}

        {list.isSuccess && items.length === 0 && (
          <EmptyState
            icon={Store}
            title="شعبه‌ای با این فیلترها نیست"
            description="نام یا وضعیت را تغییر دهید."
          />
        )}

        {items.map((row) => {
          const approved = row.status === 1;
          const busy =
            (status.isPending && status.variables?.id === row.id) ||
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
                <Typography variant="h4" as="h3" className="sm:text-sm">
                  {row.name}
                </Typography>
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant="secondary"
                    className={cn(
                      approved
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {approved ? "تایید شده" : "تایید نشده"}
                  </Badge>
                  {row.city?.name && (
                    <Badge variant="secondary">{row.city.name}</Badge>
                  )}
                </div>
              </div>

              <Typography
                variant="small"
                className="flex flex-wrap items-center gap-x-3 gap-y-1"
              >
                {row.phone && (
                  <a
                    href={`tel:${row.phone}`}
                    className="flex items-center gap-1 hover:text-brand"
                  >
                    <Phone className="size-3.5 text-brand/70" />
                    {row.phone}
                  </a>
                )}
                {row.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5 text-brand/70" />
                    {row.address}
                  </span>
                )}
              </Typography>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2.5">
                <span className="flex flex-wrap items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    nativeButton={false}
                    render={<Link href={routes.panel.editBranch(row.id)} />}
                  >
                    <Pencil />
                    ویرایش
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      status.mutate({ id: row.id, value: approved ? 0 : 1 })
                    }
                  >
                    {approved ? <EyeOff /> : <Eye />}
                    {approved ? "لغو تایید" : "تایید"}
                  </Button>
                </span>

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
