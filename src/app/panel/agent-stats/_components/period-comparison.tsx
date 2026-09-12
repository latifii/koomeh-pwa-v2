"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownRight,
  ArrowUpRight,
  GitCompareArrows,
  Minus,
} from "lucide-react";

import type { AgentStatsRange } from "@/app/panel/agent-stats/_api/agent-stats.service";
import {
  agentStatsDetailQueryOptions,
  agentStatsLeagueQueryOptions,
  agentStatsReportQueryOptions,
} from "@/app/panel/agent-stats/_queries/agent-stats.query";
import type { AgentStatsDetail } from "@/app/panel/agent-stats/_schemas/agent-stats.schema";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { toJalaliDisplay } from "@/lib/jalali-date";
import { cn } from "@/lib/utils";

function score(value: number): string {
  return value.toLocaleString("fa-IR", { maximumFractionDigits: 1 });
}

/** Signed, so a fall reads as one: «−۱۲» not «۱۲». */
function signed(value: number): string {
  if (value > 0) return `+${score(value)}`;
  return score(value);
}

/**
 * The old page's growth rule: change against the second period, or nothing
 * when there is nothing to grow from — «نداشت، حالا دارد» is not 100%.
 */
function growth(first: number, second: number): number | null {
  if (second === 0) return null;
  return Math.round(((first - second) / Math.abs(second)) * 1000) / 10;
}

export type ComparisonMode =
  /** Every agent's league total, both periods. */
  | { kind: "league" }
  /** One agent's score breakdown, indicator by indicator. */
  | { kind: "breakdown"; agentId: number }
  /** One report type across agents (or one agent, for an agent). */
  | { kind: "report"; type: string };

type Row = {
  id: string | number;
  label: string;
  first: number;
  second: number;
  firstRank?: number | null;
  secondRank?: number | null;
};

/** Flatten a breakdown into (indicator → count) so two periods line up. */
function breakdownCounts(
  detail: AgentStatsDetail | undefined,
): Map<string, { label: string; count: number }> {
  const map = new Map<string, { label: string; count: number }>();
  if (!detail) return map;
  for (const group of [detail.effort, detail.success]) {
    for (const section of group.sections) {
      for (const row of section.rows) {
        map.set(row.name, { label: row.title, count: row.count ?? 0 });
      }
    }
  }
  return map;
}

/**
 * «مقایسه با یک بازه‌ی تاریخی دیگر» — the old report page's switch.
 *
 * Two of the same query, one per period, lined up row by row: agents for the
 * league and for a report type, indicators for one agent's breakdown. Each
 * row shows both figures as a pair of bars on one scale, the change, and the
 * growth against the second period; the footer sums the lot. Nothing is
 * fetched that the page does not already know how to fetch — the comparison
 * is the two answers side by side.
 */
export function PeriodComparison({
  mode,
  first,
  second,
  unit,
  title,
  myId,
}: {
  mode: ComparisonMode;
  first: AgentStatsRange;
  second: AgentStatsRange;
  unit?: string;
  title: string;
  myId?: number;
}) {
  const isLeague = mode.kind === "league";
  const isBreakdown = mode.kind === "breakdown";
  const isReport = mode.kind === "report";
  const reportType = isReport ? mode.type : "";
  const agentId = isBreakdown ? mode.agentId : null;

  const leagueA = useQuery(agentStatsLeagueQueryOptions(first, isLeague));
  const leagueB = useQuery(agentStatsLeagueQueryOptions(second, isLeague));
  const detailA = useQuery(agentStatsDetailQueryOptions(agentId, first));
  const detailB = useQuery(agentStatsDetailQueryOptions(agentId, second));
  const reportA = useQuery(
    agentStatsReportQueryOptions(reportType, first, isReport),
  );
  const reportB = useQuery(
    agentStatsReportQueryOptions(reportType, second, isReport),
  );

  const queries = isLeague
    ? [leagueA, leagueB]
    : isBreakdown
      ? [detailA, detailB]
      : [reportA, reportB];
  const pending = queries.some((query) => query.isPending);
  const failed = queries.find((query) => query.isError);

  const rows = useMemo<Row[]>(() => {
    if (isLeague) {
      const a = new Map(
        (leagueA.data?.items ?? []).map((item) => [item.id, item]),
      );
      const b = new Map(
        (leagueB.data?.items ?? []).map((item) => [item.id, item]),
      );
      const ids = new Set([...a.keys(), ...b.keys()]);
      return [...ids].map((id) => {
        const ra = a.get(id);
        const rb = b.get(id);
        return {
          id,
          label: (ra ?? rb)?.name ?? String(id),
          first: ra?.total ?? 0,
          second: rb?.total ?? 0,
          firstRank: ra?.rank,
          secondRank: rb?.rank,
        };
      });
    }

    if (isBreakdown) {
      const a = breakdownCounts(detailA.data);
      const b = breakdownCounts(detailB.data);
      const keys = new Set([...a.keys(), ...b.keys()]);
      return (
        [...keys]
          .map((key) => ({
            id: key,
            label: (a.get(key) ?? b.get(key))?.label ?? key,
            first: a.get(key)?.count ?? 0,
            second: b.get(key)?.count ?? 0,
          }))
          // Rows untouched in both periods would be a wall of zeros.
          .filter((row) => row.first !== 0 || row.second !== 0)
      );
    }

    const a = new Map(
      (reportA.data?.items ?? []).map((item) => [item.id, item]),
    );
    const b = new Map(
      (reportB.data?.items ?? []).map((item) => [item.id, item]),
    );
    const ids = new Set([...a.keys(), ...b.keys()]);
    return [...ids].map((id) => {
      const ra = a.get(id);
      const rb = b.get(id);
      return {
        id,
        label: (ra ?? rb)?.name ?? String(id),
        first: ra?.count ?? 0,
        second: rb?.count ?? 0,
        firstRank: ra?.rank,
        secondRank: rb?.rank,
      };
    });
  }, [
    isLeague,
    isBreakdown,
    leagueA.data,
    leagueB.data,
    detailA.data,
    detailB.data,
    reportA.data,
    reportB.data,
  ]);

  const sorted = useMemo(
    () => [...rows].sort((x, y) => y.first - x.first || y.second - x.second),
    [rows],
  );
  const totalA = rows.reduce((sum, row) => sum + row.first, 0);
  const totalB = rows.reduce((sum, row) => sum + row.second, 0);
  const max = Math.max(
    0,
    ...rows.map((row) => Math.max(row.first, row.second)),
  );
  const totalGrowth = growth(totalA, totalB);

  const periodLabel = (
    range: AgentStatsRange,
    fallback: { from?: string | null; to?: string | null } | null | undefined,
  ) => {
    const from = range.datefrom
      ? toJalaliDisplay(range.datefrom)
      : fallback?.from;
    const to = range.dateto ? toJalaliDisplay(range.dateto) : fallback?.to;
    return from && to ? `${from} تا ${to}` : "بازه‌ی پیش‌فرض";
  };
  const firstLabel = periodLabel(
    first,
    (
      queries[0].data as
        | { range?: { from?: string | null; to?: string | null } | null }
        | undefined
    )?.range,
  );
  const secondLabel = periodLabel(
    second,
    (
      queries[1].data as
        | { range?: { from?: string | null; to?: string | null } | null }
        | undefined
    )?.range,
  );

  if (failed) {
    return (
      <EmptyState
        icon={GitCompareArrows}
        title="مقایسه انجام نشد"
        description={getApiErrorMessage(failed.error)}
      />
    );
  }

  if (pending) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  const rowLabel = isBreakdown ? "شاخص" : "مشاور";

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* The two periods, and what moved between them. */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Summary
          label="بازه‌ی اول"
          hint={firstLabel}
          value={score(totalA)}
          unit={unit}
          swatch="bg-brand"
        />
        <Summary
          label="بازه‌ی دوم"
          hint={secondLabel}
          value={score(totalB)}
          unit={unit}
          swatch="bg-chart-2"
        />
        <Summary
          label="تغییر"
          hint="بازه‌ی اول نسبت به دوم"
          value={signed(totalA - totalB)}
          unit={unit}
          tone={
            totalA - totalB > 0 ? "up" : totalA - totalB < 0 ? "down" : "flat"
          }
        />
        <Summary
          label="درصد تغییر"
          hint={
            totalGrowth === null ? "بازه‌ی دوم صفر بود" : "نسبت به بازه‌ی دوم"
          }
          value={totalGrowth === null ? "—" : `${signed(totalGrowth)}٪`}
          tone={
            totalGrowth === null
              ? "flat"
              : totalGrowth > 0
                ? "up"
                : totalGrowth < 0
                  ? "down"
                  : "flat"
          }
        />
      </div>

      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <GitCompareArrows className="size-4 text-brand" />
            مقایسه‌ی {title}
            {unit && (
              <Typography as="span" variant="small">
                ({unit})
              </Typography>
            )}
          </CardTitle>
          {/* Two series, so the legend is not optional. */}
          <Typography
            as="span"
            variant="small"
            className="flex flex-wrap items-center gap-x-4 gap-y-1"
          >
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="inline-block size-2.5 rounded-sm bg-brand"
              />
              بازه‌ی اول · {firstLabel}
            </span>
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="inline-block size-2.5 rounded-sm bg-chart-2"
              />
              بازه‌ی دوم · {secondLabel}
            </span>
          </Typography>
        </CardHeader>
        <CardContent className="p-0">
          {sorted.length === 0 ? (
            <Typography variant="small" className="p-4">
              برای این دو بازه داده‌ای یافت نشد.
            </Typography>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[44rem]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[14rem]">{rowLabel}</TableHead>
                    <TableHead>مقایسه</TableHead>
                    <TableHead className="text-end">بازه‌ی اول</TableHead>
                    <TableHead className="text-end">بازه‌ی دوم</TableHead>
                    <TableHead className="text-end">تغییر</TableHead>
                    <TableHead className="text-end">درصد</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="[font-variant-numeric:tabular-nums]">
                  {sorted.map((row) => {
                    const diff = row.first - row.second;
                    const pct = growth(row.first, row.second);
                    const isMe = row.id === myId;
                    return (
                      <TableRow
                        key={row.id}
                        className={cn(isMe && "bg-brand/5")}
                      >
                        <TableCell className="max-w-[14rem]">
                          <span className="block truncate font-medium text-foreground">
                            {row.label}
                          </span>
                          {(row.firstRank || row.secondRank) && (
                            <Typography
                              as="span"
                              variant="small"
                              className="block"
                            >
                              رتبه{" "}
                              {row.firstRank?.toLocaleString("fa-IR") ?? "—"} ←{" "}
                              {row.secondRank?.toLocaleString("fa-IR") ?? "—"}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell className="min-w-[12rem]">
                          <PairedBars
                            first={row.first}
                            second={row.second}
                            max={max}
                          />
                        </TableCell>
                        <TableCell className="text-end">
                          {score(row.first)}
                        </TableCell>
                        <TableCell className="text-end">
                          {score(row.second)}
                        </TableCell>
                        <TableCell className="text-end">
                          <Change value={diff} />
                        </TableCell>
                        <TableCell className="text-end">
                          {pct === null ? (
                            "—"
                          ) : (
                            <Change value={pct} suffix="٪" />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter className="[font-variant-numeric:tabular-nums]">
                  <TableRow>
                    <TableCell>جمع کل</TableCell>
                    <TableCell>
                      <PairedBars
                        first={totalA}
                        second={totalB}
                        max={Math.max(totalA, totalB)}
                      />
                    </TableCell>
                    <TableCell className="text-end">{score(totalA)}</TableCell>
                    <TableCell className="text-end">{score(totalB)}</TableCell>
                    <TableCell className="text-end">
                      <Change value={totalA - totalB} />
                    </TableCell>
                    <TableCell className="text-end">
                      {totalGrowth === null ? (
                        "—"
                      ) : (
                        <Change value={totalGrowth} suffix="٪" />
                      )}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/** Two thin bars on one scale, first above second, with a hairline between. */
function PairedBars({
  first,
  second,
  max,
}: {
  first: number;
  second: number;
  max: number;
}) {
  const width = (value: number) =>
    max > 0 ? `${Math.max(value > 0 ? 1.5 : 0, (value / max) * 100)}%` : "0%";
  return (
    <span className="grid gap-0.5" aria-hidden>
      <span className="h-2 overflow-hidden rounded-full bg-muted">
        <span
          className="block h-full rounded-e-sm bg-brand"
          style={{ width: width(first) }}
        />
      </span>
      <span className="h-2 overflow-hidden rounded-full bg-muted">
        <span
          className="block h-full rounded-e-sm bg-chart-2"
          style={{ width: width(second) }}
        />
      </span>
    </span>
  );
}

function Change({ value, suffix = "" }: { value: number; suffix?: string }) {
  const Icon = value > 0 ? ArrowUpRight : value < 0 ? ArrowDownRight : Minus;
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-0.5 tabular-nums",
        value > 0 && "border-success/40 bg-success/10 text-success",
        value < 0 && "border-destructive/40 bg-destructive/10 text-destructive",
      )}
    >
      <Icon className="size-3" />
      {signed(value)}
      {suffix}
    </Badge>
  );
}

function Summary({
  label,
  hint,
  value,
  unit,
  swatch,
  tone,
}: {
  label: string;
  hint?: string;
  value: string;
  unit?: string;
  swatch?: string;
  tone?: "up" | "down" | "flat";
}) {
  return (
    <div className="rounded-xl border bg-card p-3.5">
      <Typography variant="small" className="flex items-center gap-1.5">
        {swatch && (
          <span
            aria-hidden
            className={cn("inline-block size-2.5 rounded-sm", swatch)}
          />
        )}
        {label}
      </Typography>
      <Typography
        variant="h4"
        className={cn(
          "mt-0.5 tabular-nums",
          tone === "up" && "text-success",
          tone === "down" && "text-destructive",
        )}
      >
        {value}
        {unit && (
          <Typography as="span" variant="small" className="ms-1">
            {unit}
          </Typography>
        )}
      </Typography>
      {hint && (
        <Typography variant="small" className="mt-0.5 truncate">
          {hint}
        </Typography>
      )}
    </div>
  );
}
