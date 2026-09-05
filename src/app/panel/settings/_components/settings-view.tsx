"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { Check, PlugZap, Save, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";

import {
  getSettings,
  saveSetting,
  testBaleConnection,
} from "@/app/panel/settings/_api/settings.service";
import type { SettingRow } from "@/app/panel/settings/_schemas/settings.schema";
import { AdminGate } from "@/app/panel/_admin/_components/admin-gate";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { cn } from "@/lib/utils";

const settingsKeys = { all: ["panel-settings"] as const };

function settingsQueryOptions() {
  return queryOptions({
    queryKey: settingsKeys.all,
    queryFn: async ({ signal }) => (await getSettings(undefined, signal)).result,
    staleTime: 60 * 1_000,
  });
}

/**
 * The settings table, one row at a time.
 *
 * Seventy-seven rows in three groups, each a name and a free-text value the
 * backend reads somewhere. There is no schema for what any of them mean, so the
 * page does not pretend there is: it shows the group, the name, whatever
 * comment the row carries, and an input. Saving is per row, because that is the
 * only unit the API offers and because saving all seventy-seven at once is a
 * way to break something quietly.
 */
export function SettingsView() {
  const [group, setGroup] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const list = useQuery(settingsQueryOptions());

  const bale = useMutation({
    mutationFn: () => testBaleConnection(),
    onSuccess: (response) => {
      const { ok, message } = response.result;
      if (ok) toast.success(message || "اتصال به بله برقرار است.");
      else toast.error(message || "اتصال به بله برقرار نشد.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const groups = list.data?.groups ?? [];
  const items = list.data?.items ?? [];
  const shown = group ? items.filter((row) => row.group === group) : items;

  return (
    <AdminGate title="تنظیمات فقط برای مدیران است">
      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-card p-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              type="button"
              variant={group === null ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setGroup(null)}
            >
              همه
            </Button>
            {groups.map((name) => (
              <Button
                key={name}
                type="button"
                variant={group === name ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setGroup(name)}
              >
                {name}
              </Button>
            ))}
          </div>

          {/* The one setting with a way to check itself. */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={bale.isPending}
            onClick={() => bale.mutate()}
          >
            {bale.isPending ? <Spinner /> : <PlugZap />}
            تست اتصال بله
          </Button>
        </div>

        {list.isPending && (
          <div className="grid grid-cols-1 gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-20 rounded-xl" />
            ))}
          </div>
        )}

        {list.isError && (
          <EmptyState
            icon={SettingsIcon}
            title="تنظیمات باز نشد"
            description={getApiErrorMessage(list.error)}
          />
        )}

        {list.isSuccess && shown.length === 0 && (
          <EmptyState
            icon={SettingsIcon}
            title="تنظیمی در این دسته نیست"
            description="دسته‌ی دیگری را انتخاب کنید."
          />
        )}

        {shown.length > 0 && (
          <>
            <Typography variant="small">
              {shown.length.toLocaleString("fa-IR")} تنظیم · هر ردیف جداگانه
              ذخیره می‌شود.
            </Typography>

            <div className="grid grid-cols-1 gap-3">
              {shown.map((row) => (
                <SettingCard
                  // Keyed by the stored value so that a row which comes back
                  // changed re-seeds its input, without an effect that writes
                  // state during render.
                  key={`${row.id}:${row.value ?? ""}`}
                  row={row}
                  onSaved={() =>
                    queryClient.invalidateQueries({ queryKey: settingsKeys.all })
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
    </AdminGate>
  );
}

function SettingCard({
  row,
  onSaved,
}: {
  row: SettingRow;
  onSaved: () => void;
}) {
  const [value, setValue] = useState(row.value ?? "");
  const [saved, setSaved] = useState(false);

  const save = useMutation({
    mutationFn: () => saveSetting(row.id, value),
    onSuccess: () => {
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2_000);
      onSaved();
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const dirty = value !== (row.value ?? "");

  return (
    <article className="grid grid-cols-1 gap-2 rounded-xl border bg-card p-3.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <Typography variant="h4" as="h3" className="sm:text-sm">
          {row.name}
        </Typography>
        <Typography variant="small" className="text-muted-foreground">
          {row.group}
          {row.count !== null && row.count !== undefined && (
            <> · عدد همراه: {row.count.toLocaleString("fa-IR")}</>
          )}
        </Typography>
      </div>

      {row.comment && <Typography variant="small">{row.comment}</Typography>}

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className={cn("min-w-0 flex-1 font-mono text-xs", dirty && "border-brand")}
          dir="ltr"
        />
        <Button
          type="button"
          variant={dirty ? "default" : "outline"}
          size="sm"
          disabled={!dirty || save.isPending}
          onClick={() => save.mutate()}
        >
          {save.isPending ? <Spinner /> : saved ? <Check /> : <Save />}
          {saved ? "ذخیره شد" : "ذخیره"}
        </Button>
      </div>
    </article>
  );
}
