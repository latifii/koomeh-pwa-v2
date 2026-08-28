"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Scale, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { clearCompareList } from "@/app/_favorites/_api/favorites.service";
import { favoritesQueryKeys } from "@/app/_favorites/_constants/favorites-query-keys";
import { compareQueryOptions } from "@/app/_favorites/_queries/favorites.query";
import type {
  CompareGroup,
  CompareValue,
} from "@/app/_favorites/_types/favorites.types";
import { removeFromCompare } from "@/app/properties/_api/estate-actions.service";
import apartmentImage from "@/assets/images/card/apartman.webp";
import { ApiImage } from "@/components/shared/api-image";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * The comparison table, one per deal type — comparing a sale price against a
 * monthly rent would be meaningless, so the API groups them and so does this.
 * Both the rows and the "best value" marks come from the server.
 */
export function CompareView() {
  const queryClient = useQueryClient();
  const compare = useQuery(compareQueryOptions());

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: favoritesQueryKeys.compare() });

  const remove = useMutation({
    mutationFn: (id: string) => removeFromCompare(id),
    onSuccess: () => {
      void invalidate();
      toast.success("از فهرست مقایسه حذف شد");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const clear = useMutation({
    mutationFn: clearCompareList,
    onSuccess: (data) => {
      void invalidate();
      toast.success(
        `${data.result.removed.toLocaleString("fa-IR")} ملک از مقایسه حذف شد`,
      );
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  if (compare.isPending) return <Skeleton className="h-96 w-full rounded-2xl" />;

  if (compare.isError) {
    return (
      <EmptyState
        icon={Scale}
        title="فهرست مقایسه بارگذاری نشد"
        description={getApiErrorMessage(compare.error)}
      />
    );
  }

  if (compare.data.total === 0) {
    return (
      <EmptyState
        icon={Scale}
        title="فهرست مقایسه خالی است"
        description="از صفحه‌ی هر ملک دکمه‌ی «مقایسه» را بزنید تا اینجا کنار هم ببینیدشان."
        action={
          <Button nativeButton={false} render={<Link href={routes.properties()} />}>
            جستجوی ملک
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-between gap-3">
        <Typography variant="small">
          {compare.data.total.toLocaleString("fa-IR")} ملک در فهرست مقایسه
        </Typography>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive"
          onClick={() => clear.mutate()}
          disabled={clear.isPending}
        >
          <Trash2 data-icon="inline-start" />
          پاک کردن همه
        </Button>
      </div>

      {compare.data.groups.map((group) => (
        <CompareTable
          key={group.dealType}
          group={group}
          onRemove={(id) => remove.mutate(id)}
          removing={remove.isPending}
        />
      ))}
    </div>
  );
}

function CompareTable({
  group,
  onRemove,
  removing,
}: {
  group: CompareGroup;
  onRemove: (id: string) => void;
  removing: boolean;
}) {
  return (
    <section className="rounded-2xl border bg-card">
      <header className="border-b p-4">
        <Typography variant="h4" as="h2" className="flex items-center gap-2">
          <Scale className="size-4 text-brand" />
          {group.dealTypeLabel}
          <span className="text-xs font-normal text-muted-foreground">
            {group.items.length.toLocaleString("fa-IR")} ملک
          </span>
        </Typography>
      </header>

      {/* The table grows with the number of files, so it scrolls on its own. */}
      <div className="overflow-x-auto overflow-y-hidden">
        <table className="w-full min-w-2xl border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-36 border-b border-e p-3 text-start align-top" />
              {group.items.map((item) => (
                <th
                  key={item.id}
                  className="min-w-52 border-b p-3 text-start align-top font-normal"
                >
                  <div className="grid gap-2">
                    <div className="relative aspect-4/3 overflow-hidden rounded-xl bg-muted">
                      <ApiImage
                        src={item.coverImage ?? ""}
                        fallbackSrc={apartmentImage}
                        alt={item.title}
                        fill
                        sizes="200px"
                        className="object-cover"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label={`حذف ${item.title} از مقایسه`}
                        onClick={() => onRemove(item.id)}
                        disabled={removing}
                        className="absolute end-2 top-2 size-7 border-white/30 bg-black/40 text-white backdrop-blur-md hover:bg-black/60 hover:text-white"
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                    <Link
                      href={item.href}
                      className="line-clamp-2 font-medium hover:text-brand"
                    >
                      {item.title}
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {group.rows.map((row) => (
              <tr key={row.key} className="even:bg-muted/30">
                <th
                  scope="row"
                  className="border-e p-3 text-start align-middle font-medium text-muted-foreground"
                >
                  {row.label}
                </th>
                {group.items.map((item) => {
                  const isBest = item.best.includes(row.key);

                  return (
                    <td
                      key={item.id}
                      className={cn(
                        "p-3 align-middle",
                        row.type === "number" && "tabular-nums",
                        isBest && "font-semibold text-brand",
                      )}
                    >
                      <span className="flex items-start gap-1.5">
                        {isBest && <Check className="mt-1 size-3.5 shrink-0" />}
                        <CompareCell value={item.values[row.key]} />
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/**
 * A `list` row (amenities and the like) arrives as an array, so it reads as
 * chips instead of a comma-mashed string. Everything else the API preformats.
 */
function CompareCell({ value }: { value: CompareValue }) {
  if (value === null || value === "" || value === false) {
    return <span className="text-muted-foreground">—</span>;
  }

  if (value === true) return <Check className="size-4 text-brand" />;

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-muted-foreground">—</span>;
    }
    return (
      <span className="flex flex-wrap gap-1">
        {value.map((entry) => (
          <span
            key={entry}
            className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground"
          >
            {entry}
          </span>
        ))}
      </span>
    );
  }

  return <span>{value}</span>;
}
