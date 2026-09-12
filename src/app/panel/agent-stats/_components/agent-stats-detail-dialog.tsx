"use client";

import { useQuery } from "@tanstack/react-query";
import { Sparkles, Target, TrendingUp } from "lucide-react";

import type { AgentStatsRange } from "@/app/panel/agent-stats/_api/agent-stats.service";
import { agentStatsDetailQueryOptions } from "@/app/panel/agent-stats/_queries/agent-stats.query";
import type { AgentStatsDetail } from "@/app/panel/agent-stats/_schemas/agent-stats.schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { cn } from "@/lib/utils";

/** A null coefficient means "not set for this branch", which reads as zero. */
function score(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString("fa-IR", { maximumFractionDigits: 1 });
}

/**
 * `count × zarib = points` — showing all three makes the score auditable
 * instead of a number the agent has to take on faith. The columns were bare
 * before: three numbers in a row with no heading, so `× ۲` was a guess.
 */
export function ScoreGroup({
  title,
  icon: Icon,
  tone,
  group,
}: {
  title: string;
  icon: typeof Target;
  tone: string;
  group: AgentStatsDetail["effort"];
}) {
  const sections = group.sections
    .map((section) => ({
      ...section,
      // Rows the agent never triggered would be a wall of zeros.
      rows: section.rows.filter((row) => (row.count ?? 0) !== 0),
    }))
    .filter((section) => section.rows.length > 0);

  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <header className="flex items-center justify-between gap-2 border-b px-3 py-2.5">
        <Typography
          as="h3"
          variant="small"
          className="flex items-center gap-1.5 font-medium text-foreground"
        >
          <Icon className={cn("size-4", tone)} />
          {title}
        </Typography>
        <Badge variant="secondary" className="tabular-nums">
          {score(group.total)}
        </Badge>
      </header>

      {sections.length === 0 ? (
        <Typography
          variant="small"
          className="px-3 py-6 text-center text-muted-foreground"
        >
          در این بازه چیزی ثبت نشده است.
        </Typography>
      ) : (
        <div className="divide-y">
          {sections.map((section) => (
            <div key={section.title} className="p-3">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <Typography as="span" variant="small" className="font-medium text-foreground">
                  {section.title}
                </Typography>
                <Typography as="span" variant="small" className="tabular-nums">
                  {score(section.subtotal)}
                </Typography>
              </div>

              <div className="overflow-x-auto overflow-y-hidden">
                <table className="w-full min-w-80 text-sm [font-variant-numeric:tabular-nums]">
                  <thead>
                    <tr className="text-xs text-muted-foreground">
                      <th className="pb-1 text-start font-normal">فعالیت</th>
                      <th className="pb-1 text-start font-normal">تعداد</th>
                      <th className="pb-1 text-start font-normal">ضریب</th>
                      <th className="pb-1 text-end font-normal">امتیاز</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((row) => {
                      // Lateness, absence and the like come back negative; the
                      // sign is the whole point of those rows.
                      const negative = (row.points ?? 0) < 0;

                      return (
                        <tr
                          key={row.name}
                          className="border-t first:border-t-0"
                          title={row.desc ?? undefined}
                        >
                          <td className="py-1.5 pe-2">{row.title}</td>
                          <td className="py-1.5 pe-2 text-muted-foreground">
                            {`${(row.count ?? 0).toLocaleString("fa-IR")} ${row.unit ?? ""}`.trim()}
                          </td>
                          <td className="py-1.5 pe-2 text-muted-foreground">
                            {score(row.zarib)}
                          </td>
                          <td
                            className={cn(
                              "py-1.5 text-end font-medium",
                              negative && "text-destructive",
                            )}
                          >
                            {score(row.points)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function Tile({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number | null | undefined;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3 text-center",
        accent && "border-brand/40 bg-brand/5",
      )}
    >
      <Typography variant="small">{label}</Typography>
      <Typography
        variant="h4"
        className={cn("tabular-nums", accent && "text-brand")}
      >
        {score(value)}
      </Typography>
    </div>
  );
}

/**
 * One agent's score, broken down.
 *
 * The dialog is a fixed height on purpose. It used to size itself to whatever
 * was inside it, and a centred box whose content goes from a 288px skeleton to
 * a two-table breakdown does not grow — it leaps, twice, because the opening
 * animation has not finished when the data lands. Now the box is the same size
 * before and after and only the inside changes, so the load is a fade.
 */
export function AgentStatsDetailDialog({
  agentId,
  range,
  onClose,
}: {
  agentId: number | null;
  range: AgentStatsRange;
  onClose: () => void;
}) {
  const detail = useQuery(agentStatsDetailQueryOptions(agentId, range));

  const expert = detail.data?.expert;
  const totals = detail.data?.totals;

  return (
    <Dialog open={agentId !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="grid h-[min(85dvh,46rem)] grid-rows-[auto_1fr] gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="flex-row items-center gap-3 border-b p-4 pe-12">
          <Avatar className="size-10 shrink-0 border">
            {expert?.pic && <AvatarImage src={expert.pic} alt="" />}
            <AvatarFallback>
              {(expert?.name ?? "؟").trim().charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate">
              {expert?.name ? `ریز امتیاز ${expert.name}` : "ریز امتیاز"}
            </DialogTitle>
            <Typography variant="small" className="truncate tabular-nums">
              {detail.data?.range?.from
                ? `بازه ${detail.data.range.from} تا ${detail.data.range.to}`
                : "امتیاز بابت هر فعالیت، با تعداد و ضریبش."}
            </Typography>
          </div>

          {totals && (
            <Typography as="span" variant="h3" className="shrink-0 tabular-nums text-brand">
              {score(totals.total)}
            </Typography>
          )}
        </DialogHeader>

        <div className="grid grid-cols-1 content-start gap-4 overflow-y-auto p-4">
          {detail.isPending && (
            <>
              {/* Shaped like what is coming, so the swap is a fade rather than
                  a resize. */}
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 rounded-xl" />
                ))}
              </div>
              <Skeleton className="h-56 rounded-xl" />
              <Skeleton className="h-56 rounded-xl" />
            </>
          )}

          {detail.isError && (
            <Typography variant="small" className="text-destructive">
              {getApiErrorMessage(detail.error)}
            </Typography>
          )}

          {detail.isSuccess && (
            <>
              {totals && (
                <div className="grid grid-cols-1 gap-2">
                  <div className="grid grid-cols-3 gap-2">
                    <Tile label="تلاش" value={totals.effort} />
                    <Tile label="موفقیت" value={totals.success} />
                    <Tile label="کل" value={totals.total} accent />
                  </div>
                  {totals.effortShare !== null &&
                    totals.effortShare !== undefined && (
                      // Why a big effort number does not always beat a small
                      // success one.
                      <Typography variant="small" className="text-center">
                        {`سهم تلاش از امتیاز کل: ${(totals.effortShare * 100).toLocaleString("fa-IR", { maximumFractionDigits: 0 })}٪`}
                      </Typography>
                    )}
                </div>
              )}

              <ScoreGroup
                title="امتیاز تلاش"
                icon={TrendingUp}
                tone="text-brand"
                group={detail.data.effort}
              />
              <ScoreGroup
                title="امتیاز موفقیت"
                icon={Sparkles}
                tone="text-medal-gold"
                group={detail.data.success}
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
