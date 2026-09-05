"use client";

import { useState } from "react";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building,
  Check,
  Eye,
  EyeOff,
  Map as MapIcon,
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
  Signpost,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { AdminGate } from "@/app/panel/_admin/_components/admin-gate";
import {
  createCity,
  createProvince,
  deleteCity,
  deleteDistrict,
  deleteProvince,
  deleteStreet,
  getCities,
  getDistricts,
  getProvinces,
  getStreets,
  toggleCity,
  toggleProvince,
  updateCity,
  updateDistrict,
  updateProvince,
  updateStreet,
} from "@/app/panel/locations/_api/locations.service";
import type { LocationLevel } from "@/app/panel/locations/_schemas/locations.schema";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterSelect } from "@/components/shared/form";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { cn } from "@/lib/utils";

const PER_PAGE = 20;

const locationKeys = {
  all: ["panel-locations"] as const,
  provinces: () => [...locationKeys.all, "provinces"] as const,
  level: (level: LocationLevel, filters: unknown, page: number) =>
    [...locationKeys.all, level, filters, page] as const,
};

const LEVELS: { value: LocationLevel; title: string; icon: typeof MapIcon }[] = [
  { value: "provinces", title: "استان‌ها", icon: MapIcon },
  { value: "cities", title: "شهرها", icon: Building },
  { value: "districts", title: "محله‌ها", icon: MapPin },
  { value: "streets", title: "زیرمحلات", icon: Signpost },
];

/**
 * Provinces, cities, neighbourhoods and sub-neighbourhoods.
 *
 * Four pages on the old site and four endpoints here, but one screen: they are
 * the same table of names at four depths, and each one's filter is the level
 * above it. Provinces come back whole — there are thirty-one — so only the
 * other three are paged.
 */
export function LocationsView() {
  const [level, setLevel] = useState<LocationLevel>("provinces");

  return (
    <AdminGate title="مناطق فقط برای مدیران است">
      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl border bg-card p-3">
          {LEVELS.map((entry) => (
            <Button
              key={entry.value}
              type="button"
              variant={level === entry.value ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setLevel(entry.value)}
            >
              <entry.icon />
              {entry.title}
            </Button>
          ))}
        </div>

        {level === "provinces" ? (
          <ProvincesPanel />
        ) : (
          // Keyed by the level so switching tabs starts clean: the province
          // chosen while looking at cities is not a filter that should follow
          // you into the neighbourhoods.
          <PlacesPanel key={level} level={level} />
        )}
      </div>
    </AdminGate>
  );
}

/* --------------------------------------------------------------- provinces */

function ProvincesPanel() {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState("");
  const [editing, setEditing] = useState<{ id: number; name: string } | null>(null);
  const [confirming, setConfirming] = useState<number | null>(null);

  const list = useQuery(
    queryOptions({
      queryKey: locationKeys.provinces(),
      queryFn: async ({ signal }) => (await getProvinces(signal)).result,
      staleTime: 5 * 60 * 1_000,
    }),
  );

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: locationKeys.all });

  const fail = (error: unknown) => toast.error(getApiErrorMessage(error));

  const add = useMutation({
    mutationFn: (name: string) => createProvince(name),
    onSuccess: async () => {
      setAdding("");
      toast.success("استان ثبت شد.");
      await invalidate();
    },
    onError: fail,
  });

  const rename = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      updateProvince(id, name),
    onSuccess: async () => {
      setEditing(null);
      toast.success("نام استان تغییر کرد.");
      await invalidate();
    },
    onError: fail,
  });

  const toggle = useMutation({
    mutationFn: (id: number) => toggleProvince(id),
    onSuccess: async () => {
      toast.success("وضعیت استان تغییر کرد.");
      await invalidate();
    },
    onError: fail,
  });

  const remove = useMutation({
    mutationFn: (id: number) => deleteProvince(id),
    onSuccess: async () => {
      toast.success("استان و شهرهایش حذف شدند.");
      await invalidate();
    },
    onError: fail,
  });

  const items = list.data?.items ?? [];

  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="flex flex-wrap items-end gap-2 rounded-xl border bg-card p-3">
        <Input
          value={adding}
          onChange={(event) => setAdding(event.target.value)}
          placeholder="نام استان تازه"
          className="min-w-0 flex-1"
        />
        <Button
          type="button"
          size="sm"
          disabled={!adding.trim() || add.isPending}
          onClick={() => add.mutate(adding.trim())}
        >
          <Plus />
          افزودن
        </Button>
      </div>

      {list.isPending && <ListSkeleton count={5} />}

      {list.isError && (
        <EmptyState
          icon={MapIcon}
          title="استان‌ها باز نشدند"
          description={getApiErrorMessage(list.error)}
        />
      )}

      <Typography variant="small">
        {items.length.toLocaleString("fa-IR")} استان · حذف استان شهرهایش را هم
        می‌برد.
      </Typography>

      {items.map((row) => (
        <article
          key={row.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card p-3"
        >
          {editing?.id === row.id ? (
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Input
                value={editing.name}
                onChange={(event) =>
                  setEditing({ id: row.id, name: event.target.value })
                }
                className="min-w-0 flex-1"
              />
              <Button
                type="button"
                size="sm"
                disabled={!editing.name.trim()}
                onClick={() =>
                  rename.mutate({ id: row.id, name: editing.name.trim() })
                }
              >
                <Check />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditing(null)}
              >
                <X />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <Typography variant="h4" as="h3" className="sm:text-sm">
                  {row.name}
                </Typography>
                <Badge variant="secondary" className="bg-muted text-muted-foreground">
                  {row.city_count.toLocaleString("fa-IR")} شهر
                </Badge>
                <Badge
                  variant="secondary"
                  className={cn(
                    row.active
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {row.active ? "فعال" : "غیرفعال"}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing({ id: row.id, name: row.name })}
                >
                  <Pencil />
                  نام
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => toggle.mutate(row.id)}
                >
                  {row.active ? <EyeOff /> : <Eye />}
                  {row.active ? "غیرفعال" : "فعال"}
                </Button>

                {confirming === row.id ? (
                  <>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setConfirming(null);
                        remove.mutate(row.id);
                      }}
                    >
                      حذف با شهرها
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirming(null)}
                    >
                      انصراف
                    </Button>
                  </>
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
            </>
          )}
        </article>
      ))}
    </div>
  );
}

/* -------------------------------------------- cities, districts and streets */

type PlaceRow = {
  id: number;
  name: string;
  active: boolean;
  above?: string | null;
  note?: string | null;
};

function PlacesPanel({ level }: { level: Exclude<LocationLevel, "provinces"> }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [province, setProvince] = useState("");
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState("");
  const [editing, setEditing] = useState<{ id: number; name: string } | null>(null);
  const [confirming, setConfirming] = useState<number | null>(null);

  const provinces = useQuery(
    queryOptions({
      queryKey: locationKeys.provinces(),
      queryFn: async ({ signal }) => (await getProvinces(signal)).result,
      staleTime: 5 * 60 * 1_000,
    }),
  );

  const filters = { name: search, province_id: province };

  const list = useQuery(
    queryOptions({
      queryKey: locationKeys.level(level, filters, page),
      queryFn: async ({ signal }) => {
        if (level === "cities") {
          const { result } = await getCities(filters, page, PER_PAGE, signal);
          return {
            meta: result.meta,
            rows: result.items.map<PlaceRow>((row) => ({
              id: row.id,
              name: row.name,
              active: row.active,
              above: row.province?.name,
              note: row.name_en,
            })),
          };
        }

        if (level === "districts") {
          const { result } = await getDistricts(filters, page, PER_PAGE, signal);
          return {
            meta: result.meta,
            rows: result.items.map<PlaceRow>((row) => ({
              id: row.id,
              name: row.name,
              active: row.active,
              above: row.city?.name,
              // A neighbourhood with no outline never shows up in the map
              // filter, which is worth seeing at a glance.
              note: row.has_boundary === false ? "بدون مرز روی نقشه" : null,
            })),
          };
        }

        const { result } = await getStreets(filters, page, PER_PAGE, signal);
        return {
          meta: result.meta,
          rows: result.items.map<PlaceRow>((row) => ({
            id: row.id,
            name: row.name,
            active: row.active,
            above: row.district?.name ?? row.city?.name,
          })),
        };
      },
      placeholderData: (previous) => previous,
      staleTime: 60 * 1_000,
    }),
  );

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: locationKeys.all });
  const fail = (error: unknown) => toast.error(getApiErrorMessage(error));

  // Only cities can be added from here. A neighbourhood needs a city and a
  // sub-neighbourhood needs both, and guessing either from the province filter
  // would file them in the wrong place — so those two are add-free until they
  // have a form that asks properly.
  const add = useMutation({
    mutationFn: (name: string) =>
      createCity({ name, province_id: Number(province) }),
    onSuccess: async () => {
      setAdding("");
      toast.success("ثبت شد.");
      await invalidate();
    },
    onError: fail,
  });

  const rename = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => {
      if (level === "cities") return updateCity(id, { name });
      if (level === "districts") return updateDistrict(id, { name });
      return updateStreet(id, { name });
    },
    onSuccess: async () => {
      setEditing(null);
      toast.success("نام تغییر کرد.");
      await invalidate();
    },
    onError: fail,
  });

  const toggle = useMutation({
    mutationFn: (id: number) => toggleCity(id),
    onSuccess: async () => {
      toast.success("وضعیت تغییر کرد.");
      await invalidate();
    },
    onError: fail,
  });

  const remove = useMutation({
    mutationFn: (id: number) => {
      if (level === "cities") return deleteCity(id);
      if (level === "districts") return deleteDistrict(id);
      return deleteStreet(id);
    },
    onSuccess: async () => {
      toast.success("حذف شد.");
      await invalidate();
    },
    onError: fail,
  });

  const rows = list.data?.rows ?? [];
  const meta = list.data?.meta;

  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="grid grid-cols-1 gap-3 rounded-xl border bg-card p-3">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="جست‌وجوی نام"
          />
          {level === "cities" && (
            <FilterSelect
              label="همه‌ی استان‌ها"
              value={province}
              onChange={(value) => {
                setProvince(value);
                setPage(1);
              }}
              options={(provinces.data?.items ?? []).map((row) => ({
                value: String(row.id),
                title: row.name,
              }))}
            />
          )}
        </div>

        {level === "cities" && (
          <div className="flex flex-wrap items-end gap-2">
            <Input
              value={adding}
              onChange={(event) => setAdding(event.target.value)}
              placeholder="نام شهر تازه"
              className="min-w-0 flex-1"
            />
            <Button
              type="button"
              size="sm"
              disabled={!adding.trim() || !province || add.isPending}
              onClick={() => add.mutate(adding.trim())}
            >
              <Plus />
              افزودن
            </Button>
            {!province && (
              <Typography variant="small">
                برای افزودن شهر، اول استان را انتخاب کنید.
              </Typography>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Typography variant="small">
            {meta ? `${meta.total.toLocaleString("fa-IR")} مورد` : "در حال شمردن…"}
          </Typography>
          {(search || province) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setProvince("");
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
          icon={MapPin}
          title="فهرست باز نشد"
          description={getApiErrorMessage(list.error)}
        />
      )}

      {list.isSuccess && rows.length === 0 && (
        <EmptyState
          icon={MapPin}
          title="موردی با این فیلترها نیست"
          description="نام یا استان را تغییر دهید."
        />
      )}

      {rows.map((row) => (
        <article
          key={row.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card p-3"
        >
          {editing?.id === row.id ? (
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Input
                value={editing.name}
                onChange={(event) =>
                  setEditing({ id: row.id, name: event.target.value })
                }
                className="min-w-0 flex-1"
              />
              <Button
                type="button"
                size="sm"
                disabled={!editing.name.trim()}
                onClick={() =>
                  rename.mutate({ id: row.id, name: editing.name.trim() })
                }
              >
                <Check />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditing(null)}
              >
                <X />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <Typography variant="h4" as="h3" className="sm:text-sm">
                  {row.name}
                </Typography>
                {row.above && <Badge variant="secondary">{row.above}</Badge>}
                {row.note && (
                  <Badge variant="secondary" className="bg-muted text-muted-foreground">
                    {row.note}
                  </Badge>
                )}
                <Badge
                  variant="secondary"
                  className={cn(
                    row.active
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {row.active ? "فعال" : "غیرفعال"}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing({ id: row.id, name: row.name })}
                >
                  <Pencil />
                  نام
                </Button>

                {/* Only cities have a toggle of their own; the deeper levels
                    carry `active` but the API offers no switch for it. */}
                {level === "cities" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => toggle.mutate(row.id)}
                  >
                    {row.active ? <EyeOff /> : <Eye />}
                    {row.active ? "غیرفعال" : "فعال"}
                  </Button>
                )}

                {confirming === row.id ? (
                  <>
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
                  </>
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
            </>
          )}
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
  );
}
