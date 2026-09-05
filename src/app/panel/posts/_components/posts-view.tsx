"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  EyeOff,
  Newspaper,
  Pencil,
  RotateCcw,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { AdminGate } from "@/app/panel/_admin/_components/admin-gate";
import { deletePost, togglePost } from "@/app/panel/posts/_api/posts.service";
import { postKeys, postsQueryOptions } from "@/app/panel/posts/_queries/posts.query";
import {
  defaultPostFilters,
  type PostFilters,
} from "@/app/panel/posts/_schemas/posts.schema";
import articleImage from "@/assets/images/card/apartman.webp";
import { ApiImage } from "@/components/shared/api-image";
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

const ACTIVE_OPTIONS = [
  { value: "1", title: "منتشر شده" },
  { value: "0", title: "غیرفعال" },
];

const TYPE_OPTIONS = [
  { value: "post", title: "مطلب" },
  { value: "page", title: "برگه" },
];

/**
 * The magazine's own list, which is not the public one: an article that is
 * switched off or past its expiry still appears here, because this is where it
 * gets switched back on.
 */
export function PostsView() {
  const [filters, setFilters] = useState<PostFilters>(defaultPostFilters);
  const [page, setPage] = useState(1);
  const [confirming, setConfirming] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const list = useQuery(postsQueryOptions(filters, page));

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: postKeys.all });

  const toggle = useMutation({
    mutationFn: (id: number) => togglePost(id),
    onSuccess: async () => {
      toast.success("وضعیت انتشار تغییر کرد.");
      await invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: (id: number) => deletePost(id),
    onSuccess: async () => {
      toast.success("مطلب حذف شد.");
      await invalidate();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const setFilter = (key: keyof PostFilters, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  const meta = list.data?.meta;
  const items = list.data?.items ?? [];
  const isFiltered = Object.values(filters).some((value) => value !== "");

  return (
    <AdminGate title="مدیریت مطالب فقط برای مدیران است">
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 gap-3 rounded-xl border bg-card p-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              value={filters.title}
              onChange={(event) => setFilter("title", event.target.value)}
              placeholder="جست‌وجوی عنوان"
            />
            <FilterSelect
              label="همه‌ی دسته‌ها"
              value={filters.category_id}
              onChange={(value) => setFilter("category_id", value)}
              options={list.data?.categories ?? []}
            />
            <FilterSelect
              label="همه‌ی وضعیت‌ها"
              value={filters.active}
              onChange={(value) => setFilter("active", value)}
              options={ACTIVE_OPTIONS}
            />
            <FilterSelect
              label="همه‌ی نوع‌ها"
              value={filters.type}
              onChange={(value) => setFilter("type", value)}
              options={TYPE_OPTIONS}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <Typography variant="small" className="flex items-center gap-1.5">
              <Newspaper className="size-3.5 text-brand/70" />
              {meta ? `${meta.total.toLocaleString("fa-IR")} مطلب` : "در حال شمردن…"}
            </Typography>
            {isFiltered && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilters(defaultPostFilters);
                  setPage(1);
                }}
              >
                <RotateCcw />
                پاک کردن فیلترها
              </Button>
            )}
          </div>
        </div>

        {list.isPending && <ListSkeleton count={5} />}

        {list.isError && (
          <EmptyState
            icon={Newspaper}
            title="فهرست مطالب باز نشد"
            description={getApiErrorMessage(list.error)}
          />
        )}

        {list.isSuccess && items.length === 0 && (
          <EmptyState
            icon={Newspaper}
            title="مطلبی با این فیلترها نیست"
            description="عنوان یا دسته را تغییر دهید."
          />
        )}

        {items.map((row) => {
          const busy =
            (toggle.isPending && toggle.variables === row.id) ||
            (remove.isPending && remove.variables === row.id);

          return (
            <article
              key={row.id}
              className={cn(
                "flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row",
                busy && "opacity-60",
              )}
            >
              {row.image && (
                <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:w-32">
                  <ApiImage
                    src={row.image}
                    fallbackSrc={articleImage}
                    alt={row.title}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                </div>
              )}

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <Typography variant="h4" as="h3" className="min-w-0 sm:text-sm">
                    {row.title}
                  </Typography>
                  <Typography variant="small" className="tabular-nums">
                    {row.created_at_jalali}
                  </Typography>
                </div>

                {row.description && (
                  <Typography variant="small" className="line-clamp-2">
                    {row.description}
                  </Typography>
                )}

                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant="secondary"
                    className={cn(
                      row.active
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {row.active ? "منتشر شده" : "غیرفعال"}
                  </Badge>
                  {row.access_expert && (
                    <Badge variant="secondary" className="gap-1">
                      <ShieldCheck className="size-3" />
                      ویژه‌ی مشاوران
                    </Badge>
                  )}
                  {row.visit > 0 && (
                    <Typography as="span" variant="small">
                      {row.visit.toLocaleString("fa-IR")} بازدید
                    </Typography>
                  )}
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t pt-2.5">
                  <span className="flex flex-wrap items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      nativeButton={false}
                      render={<Link href={routes.panel.editPost(row.id)} />}
                    >
                      <Pencil />
                      ویرایش
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => toggle.mutate(row.id)}
                    >
                      {row.active ? <EyeOff /> : <Eye />}
                      {row.active ? "غیرفعال کن" : "منتشر کن"}
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
