"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeftRight,
  FileSignature,
  MapPin,
  Pencil,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { AdminGate } from "@/app/panel/_admin/_components/admin-gate";
import { deleteContract } from "@/app/panel/contracts/_api/contracts.service";
import {
  contractFiltersQueryOptions,
  contractKeys,
  contractsQueryOptions,
} from "@/app/panel/contracts/_queries/contracts.query";
import {
  defaultContractFilters,
  type ContractFilters,
} from "@/app/panel/contracts/_schemas/contracts.schema";
import { EmptyState } from "@/components/shared/empty-state";
import { filterChips, PanelFilterBar } from "@/components/shared/filter-bar";
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
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { toJalaliDisplay } from "@/lib/jalali-date";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const toman = (value?: number | null) =>
  value ? `${value.toLocaleString("fa-IR")} تومان` : null;

/** Every deal the offices have written, with the parties and the split. */
export function ContractsView() {
  const [filters, setFilters] = useState<ContractFilters>(defaultContractFilters);
  const [page, setPage] = useState(1);
  const [confirming, setConfirming] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const options = useQuery(contractFiltersQueryOptions());
  const list = useQuery(contractsQueryOptions(filters, page));

  const remove = useMutation({
    mutationFn: (id: number) => deleteContract(id),
    onSuccess: async () => {
      toast.success("قولنامه حذف شد.");
      await queryClient.invalidateQueries({ queryKey: contractKeys.all });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const setFilter = (key: keyof ContractFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const meta = list.data?.meta;
  const items = list.data?.items ?? [];

  const chips = filterChips(
    filters,
    defaultContractFilters,
    {
      contractid: { label: "شماره" },
      estate_name: { label: "فروشنده" },
      customer_name: { label: "خریدار" },
      type: { label: "معامله", options: options.data?.deal_types ?? [] },
      estate_type: { label: "نوع ملک", options: options.data?.estate_types ?? [] },
      expert: { label: "مشاور", options: options.data?.agents ?? [] },
      create_date_of: { label: "از", format: toJalaliDisplay },
      create_date_to: { label: "تا", format: toJalaliDisplay },
    },
    setFilter,
  );

  return (
    <AdminGate title="قولنامه‌ها فقط برای مدیران است">
      <div className="grid grid-cols-1 gap-4">
        <PanelFilterBar
          icon={FileSignature}
          count={meta?.total}
          unit="قولنامه"
          pending={!meta}
          chips={chips}
          onClear={() => {
            setFilters(defaultContractFilters);
            setPage(1);
          }}
        >
          <Input
            value={filters.contractid}
            onChange={(event) => setFilter("contractid", event.target.value)}
            placeholder="شماره قولنامه"
            aria-label="شماره قولنامه"
          />
          <Input
            value={filters.estate_name}
            onChange={(event) => setFilter("estate_name", event.target.value)}
            placeholder="نام فروشنده / موجر"
            aria-label="نام فروشنده یا موجر"
          />
          <Input
            value={filters.customer_name}
            onChange={(event) => setFilter("customer_name", event.target.value)}
            placeholder="نام خریدار / مستاجر"
            aria-label="نام خریدار یا مستاجر"
          />
          <FilterSelect
            label="همه‌ی نوع‌های معامله"
            value={filters.type}
            onChange={(value) => setFilter("type", value)}
            options={options.data?.deal_types ?? []}
          />
          <FilterSelect
            label="همه‌ی نوع‌های ملک"
            value={filters.estate_type}
            onChange={(value) => setFilter("estate_type", value)}
            options={options.data?.estate_types ?? []}
          />
          <FilterCombobox
            label="همه‌ی مشاوران"
            value={filters.expert}
            onChange={(value) => setFilter("expert", value)}
            options={options.data?.agents ?? []}
            emptyText="مشاوری با این نام نیست"
          />
          <JalaliDateInput
            value={filters.create_date_of}
            placeholder="از تاریخ"
            aria-label="از تاریخ"
            onChange={(value) => setFilter("create_date_of", value)}
          />
          <JalaliDateInput
            value={filters.create_date_to}
            placeholder="تا تاریخ"
            aria-label="تا تاریخ"
            onChange={(value) => setFilter("create_date_to", value)}
          />
        </PanelFilterBar>

        {list.isPending && <ListSkeleton count={5} />}

        {list.isError && (
          <EmptyState
            icon={FileSignature}
            title="فهرست قولنامه‌ها باز نشد"
            description={getApiErrorMessage(list.error)}
          />
        )}

        {list.isSuccess && items.length === 0 && (
          <EmptyState
            icon={FileSignature}
            title="قولنامه‌ای با این فیلترها نیست"
            description="شماره، نام طرفین یا بازه‌ی تاریخ را تغییر دهید."
          />
        )}

        {items.map((row) => {
          const busy = remove.isPending && remove.variables === row.id;
          const price =
            toman(row.amounts.price) ??
            [toman(row.amounts.mortgage), toman(row.amounts.rent)]
              .filter(Boolean)
              .join(" · ");

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
                  <Link
                    href={routes.panel.contract(row.id)}
                    className="hover:text-brand"
                  >
                    {row.contractid?.trim() ||
                      `قولنامه ${row.id.toLocaleString("fa-IR")}`}
                  </Link>
                </Typography>
                <Typography variant="small" className="tabular-nums">
                  {row.register_at_jalali}
                </Typography>
              </div>

              <Typography
                variant="small"
                className="flex flex-wrap items-center gap-x-3 gap-y-1"
              >
                <span className="flex items-center gap-1">
                  <UserRound className="size-3.5 text-brand/70" />
                  {row.seller?.name?.trim() || "—"}
                </span>
                <ArrowLeftRight className="size-3.5 text-muted-foreground" />
                <span className="flex items-center gap-1">
                  <UserRound className="size-3.5 text-brand/70" />
                  {row.buyer?.name?.trim() || "—"}
                </span>
              </Typography>

              {row.address && (
                <Typography variant="small" className="flex items-center gap-1">
                  <MapPin className="size-3.5 text-brand/70" />
                  {row.address}
                </Typography>
              )}

              <div className="flex flex-wrap items-center gap-1.5">
                {price && <Badge variant="secondary">{price}</Badge>}
                {row.experts.map((expert) => (
                  <Badge
                    key={expert.id}
                    variant="secondary"
                    className="bg-muted text-muted-foreground"
                  >
                    {expert.expert?.name ?? "مشاور"}
                    {expert.commission !== null &&
                      expert.commission !== undefined &&
                      ` · ${expert.commission.toLocaleString("fa-IR")}٪`}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  nativeButton={false}
                  render={<Link href={routes.panel.editContract(row.id)} />}
                >
                  <Pencil />
                  ویرایش
                </Button>

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
