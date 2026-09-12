"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  ChevronDown,
  ClipboardList,
  Medal,
  Trophy,
} from "lucide-react";

import { useSessionStore } from "@/app/auth/_stores/auth.store";
import type { AgentStatsRange } from "@/app/panel/agent-stats/_api/agent-stats.service";
import {
  agentStatsLeagueQueryOptions,
  myAgentStatsQueryOptions,
} from "@/app/panel/agent-stats/_queries/agent-stats.query";
import type { AgentStatsLeague } from "@/app/panel/agent-stats/_schemas/agent-stats.schema";
import { JalaliDateInput } from "@/components/shared/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { cn } from "@/lib/utils";

type LeagueItem = AgentStatsLeague["items"][number];

function score(value: number): string {
  return value.toLocaleString("fa-IR", { maximumFractionDigits: 1 });
}

/**
 * The old dashboard's rule for a gold row: on the podium *and* past the
 * threshold. Third place with a small total is just green like the rest.
 */
const GOLD_THRESHOLD = 1500;

/** Rows a league shows before «نمایش همه». */
const PREVIEW_ROWS = 5;

/**
 * The agent stats table, row for row as the old dashboard's «جدول آماری
 * مشاور». Keys are the API's counter names (the old `$report…Count`
 * variables with the prefix and suffix dropped); a key the API stops sending
 * simply shows a dash rather than breaking the table.
 */
const MY_STATS_ROWS: ReadonlyArray<{
  key: string;
  label: string;
  unit: string;
}> = [
  { key: "viewhouse", label: "مشاهده ملک", unit: "ملک" },
  { key: "updateHousing", label: "ویرایش ملک", unit: "ملک" },
  { key: "housing", label: "ثبت ملک", unit: "ملک" },
  { key: "360Deg", label: "ثبت ملک با عکس ۳۶۰", unit: "ملک" },
  { key: "totalcustomer", label: "ثبت مشتری", unit: "مشتری" },
  { key: "time", label: "زمان حضور", unit: "ساعت" },
  { key: "ladder", label: "نردبان", unit: "ملک" },
  { key: "advertisment", label: "آگهی کردن", unit: "ملک" },
  { key: "visit", label: "بازدید ملک با مشتری", unit: "ملک" },
  { key: "masters", label: "کارشناسی ملک", unit: "ملک" },
  { key: "buyContract", label: "تعداد قرارداد خرید و فروش", unit: "ملک" },
  { key: "rentContract", label: "تعداد قرارداد رهن و اجاره", unit: "ملک" },
  {
    key: "commonBuyContract",
    label: "تعداد قرارداد اشتراکی خرید و فروش",
    unit: "ملک",
  },
  {
    key: "commonRentContract",
    label: "تعداد قرارداد اشتراکی رهن و اجاره",
    unit: "ملک",
  },
  { key: "unsuccessContract", label: "تعداد قرارداد ناموفق", unit: "" },
  { key: "tahatorContract", label: "تعداد قرارداد تهاتر", unit: "" },
  {
    key: "commonTahatorContract",
    label: "تعداد قرارداد تهاتر مشارکتی",
    unit: "",
  },
  { key: "mosharekatContract", label: "تعداد قرارداد مشارکت", unit: "" },
  {
    key: "commonMosharekatContract",
    label: "تعداد قرارداد مشارکت مشارکتی",
    unit: "",
  },
  { key: "buyIncome", label: "درآمد خرید و فروش", unit: "" },
  { key: "rentIncome", label: "درآمد رهن و اجاره", unit: "" },
  { key: "delay", label: "تأخیر", unit: "" },
  { key: "cover", label: "پوشش", unit: "" },
  { key: "session", label: "جلسه مذاکره حضوری", unit: "" },
  { key: "inactivity", label: "عدم فعالیت", unit: "" },
  { key: "viewRelation", label: "مشاهده املاک ارسال‌شده", unit: "" },
  { key: "sentRelation", label: "پیامک املاک متناسب", unit: "" },
];

/**
 * The scoring block the old dashboard carried below the cards, in its order:
 * a date range, the branch averages chart, «لیگ ستارگان», «لیگ پایه», and the
 * agent's own stats table. One range drives all four, and with the fields
 * empty the API uses the old default — the first of the Jalali month to
 * today — and says so in its `range`.
 *
 * Everything is read from the scoreboard API; nothing is re-ranked here.
 * Stars is every agent with a success score, ranked; base is everyone else,
 * on effort alone. The branch average is the old formula: the sum of a
 * branch's success scores over the number of its agents on the board.
 */
export function DashboardPerformance() {
  const user = useSessionStore((state) => state.session?.user);
  const [dates, setDates] = useState({ datefrom: "", dateto: "" });

  const range: AgentStatsRange = useMemo(
    () => ({
      datefrom: dates.datefrom || undefined,
      dateto: dates.dateto || undefined,
    }),
    [dates.datefrom, dates.dateto],
  );

  const league = useQuery(agentStatsLeagueQueryOptions(range, true));
  const mine = useQuery(myAgentStatsQueryOptions(range, true));

  const items = useMemo(() => league.data?.items ?? [], [league.data]);
  const stars = items.filter((item) => item.success > 0);
  const base = items.filter((item) => item.success <= 0);
  const top = stars[0]?.total ?? 0;

  const branchAverages = useMemo(() => {
    const byBranch = new Map<string, { sum: number; count: number }>();
    for (const item of items) {
      const name = item.branch?.name?.trim();
      if (!name) continue;
      const entry = byBranch.get(name) ?? { sum: 0, count: 0 };
      entry.sum += item.success;
      entry.count += 1;
      byBranch.set(name, entry);
    }
    return [...byBranch.entries()]
      .map(([name, { sum, count }]) => ({ name, avg: count ? sum / count : 0 }))
      .sort((a, b) => b.avg - a.avg);
  }, [items]);
  const maxAverage = branchAverages[0]?.avg ?? 0;

  const counters = mine.data?.counters ?? {};

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card>
        <CardContent className="grid grid-cols-2 items-end gap-3 p-3 sm:flex sm:flex-wrap sm:p-4">
          <div className="grid gap-1.5 sm:min-w-40 sm:flex-1">
            <Typography as="label" variant="small" htmlFor="perf-from">
              تاریخ از
            </Typography>
            <JalaliDateInput
              id="perf-from"
              value={dates.datefrom}
              placeholder={league.data?.range?.from ?? "از تاریخ"}
              onChange={(value) => setDates((c) => ({ ...c, datefrom: value }))}
            />
          </div>
          <div className="grid gap-1.5 sm:min-w-40 sm:flex-1">
            <Typography as="label" variant="small" htmlFor="perf-to">
              تاریخ تا
            </Typography>
            <JalaliDateInput
              id="perf-to"
              value={dates.dateto}
              placeholder={league.data?.range?.to ?? "تا تاریخ"}
              onChange={(value) => setDates((c) => ({ ...c, dateto: value }))}
            />
          </div>
          {league.data?.range && (
            <Typography variant="small" className="col-span-2 sm:basis-auto">
              بازه‌ی محاسبه: {league.data.range.from} تا {league.data.range.to}
            </Typography>
          )}
        </CardContent>
      </Card>

      {league.isError && (
        <Typography variant="small" className="text-destructive">
          {getApiErrorMessage(league.error)}
        </Typography>
      )}

      {/* معدل امتیازات شعب — one measure, one hue; the bar's length is the
          number, and the number is written beside it in text ink. */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-4 text-brand" />
            معدل امتیازات شعب
          </CardTitle>
        </CardHeader>
        <CardContent>
          {league.isPending ? (
            <Skeleton className="h-32 rounded-lg" />
          ) : branchAverages.length === 0 ? (
            <Typography variant="small">
              در این بازه امتیازی برای شعبه‌ها ثبت نشده است.
            </Typography>
          ) : (
            <ol
              className="grid grid-cols-1 gap-2"
              aria-label="معدل امتیاز موفقیت هر شعبه"
            >
              {branchAverages.map((branch) => (
                <li
                  key={branch.name}
                  className="grid grid-cols-[minmax(4.5rem,7rem)_1fr_auto] items-center gap-2 sm:grid-cols-[minmax(6rem,10rem)_1fr_auto] sm:gap-3"
                  title={`${branch.name}: ${score(branch.avg)}`}
                >
                  <Typography
                    as="span"
                    variant="small"
                    className="truncate text-foreground"
                  >
                    {branch.name}
                  </Typography>
                  <span className="h-2.5 overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-e-sm bg-brand transition-[width]"
                      style={{
                        width: `${maxAverage > 0 ? Math.max(2, (branch.avg / maxAverage) * 100) : 0}%`,
                      }}
                    />
                  </span>
                  <Typography
                    as="span"
                    variant="small"
                    className="tabular-nums text-foreground"
                  >
                    {score(branch.avg)}
                  </Typography>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      <LeagueTable
        title="لیگ ستارگان"
        icon={Trophy}
        pending={league.isPending}
        items={stars}
        emptyText="در این بازه هنوز کسی امتیاز موفقیت نگرفته است."
        columns={[
          { label: "رتبه" },
          { label: "کارشناس" },
          { label: "شعبه", wide: true },
          { label: "موفقیت" },
          { label: "تلاش", wide: true },
          { label: "کل" },
          { label: "", wide: true },
        ]}
        rowClassName={(item) =>
          cn(
            item.rank !== null &&
              item.rank !== undefined &&
              item.rank <= 3 &&
              item.total > GOLD_THRESHOLD
              ? "bg-medal-gold/15"
              : "bg-success/5",
            item.id === user?.id && "ring-1 ring-inset ring-brand/40",
          )
        }
        renderRow={(item) => (
          <>
            <td className="p-3">
              <span className="flex items-center gap-1">
                {item.rank !== null &&
                  item.rank !== undefined &&
                  item.rank <= 3 && (
                    <Medal className="size-4 text-medal-gold" />
                  )}
                {item.rank?.toLocaleString("fa-IR") ?? "—"}
              </span>
            </td>
            <AgentCell item={item} />
            <td className="hidden p-3 sm:table-cell">
              {item.branch?.name ?? "—"}
            </td>
            <td className="p-3">{score(item.success)}</td>
            <td className="hidden p-3 sm:table-cell">{score(item.effort)}</td>
            <td className="p-3 font-medium">{score(item.total)}</td>
            <td className="hidden w-[40%] p-3 sm:table-cell">
              <span className="block h-2 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-e-sm bg-brand"
                  style={{
                    width: `${top > 0 ? (item.total / top) * 100 : 0}%`,
                  }}
                />
              </span>
            </td>
          </>
        )}
      />

      <LeagueTable
        title="لیگ پایه"
        icon={Medal}
        pending={league.isPending}
        items={base}
        emptyText="همه‌ی کارشناسان این بازه در لیگ ستارگان‌اند."
        columns={[
          { label: "ردیف" },
          { label: "کارشناس" },
          { label: "شعبه", wide: true },
          { label: "موفقیت", wide: true },
          { label: "تلاش" },
        ]}
        rowClassName={(item) =>
          cn(
            "bg-destructive/5",
            item.id === user?.id && "ring-1 ring-inset ring-brand/40",
          )
        }
        renderRow={(item, index) => (
          <>
            <td className="p-3">{(index + 1).toLocaleString("fa-IR")}</td>
            <AgentCell item={item} />
            <td className="hidden p-3 sm:table-cell">
              {item.branch?.name ?? "—"}
            </td>
            <td className="hidden p-3 sm:table-cell">{score(item.success)}</td>
            <td className="p-3">{score(item.effort)}</td>
          </>
        )}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="size-4 text-brand" />
            جدول آماری مشاور
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-hidden p-0">
          {mine.isPending ? (
            <Skeleton className="m-4 h-64 rounded-lg" />
          ) : mine.isError ? (
            <Typography variant="small" className="p-4 text-destructive">
              {getApiErrorMessage(mine.error)}
            </Typography>
          ) : (
            <dl className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 xl:grid-cols-4">
              {MY_STATS_ROWS.map((row) => {
                const value = counters[row.key];
                const has = typeof value === "number" && value !== 0;
                return (
                  <div
                    key={row.key}
                    className={cn(
                      "flex flex-col gap-0.5 bg-card px-3 py-2.5",
                      !has && "text-muted-foreground",
                    )}
                  >
                    <dt>
                      <Typography
                        as="span"
                        variant="small"
                        className="block truncate text-[11px] sm:text-xs"
                      >
                        {row.label}
                      </Typography>
                    </dt>
                    <dd className="m-0">
                      <Typography
                        as="span"
                        variant="small"
                        className={cn(
                          "font-semibold tabular-nums",
                          has ? "text-foreground" : "",
                        )}
                      >
                        {typeof value === "number"
                          ? Math.trunc(value).toLocaleString("fa-IR")
                          : "—"}
                        {row.unit && has ? ` ${row.unit}` : ""}
                      </Typography>
                    </dd>
                  </div>
                );
              })}
            </dl>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AgentCell({ item }: { item: LeagueItem }) {
  return (
    <td className="p-3">
      <span className="flex items-center gap-2">
        <Avatar className="size-8">
          {item.photo && <AvatarImage src={item.photo} alt="" />}
          <AvatarFallback>{item.name.trim().charAt(0)}</AvatarFallback>
        </Avatar>
        <Typography as="span" variant="body" className="truncate">
          {item.name}
        </Typography>
      </span>
    </td>
  );
}

function LeagueTable({
  title,
  icon: Icon,
  pending,
  items,
  emptyText,
  columns,
  rowClassName,
  renderRow,
}: {
  title: string;
  icon: typeof Trophy;
  pending: boolean;
  items: LeagueItem[];
  emptyText: string;
  /** `wide` columns leave the phone layout; the table keeps rank, name, score. */
  columns: { label: string; wide?: boolean }[];
  rowClassName: (item: LeagueItem) => string;
  renderRow: (item: LeagueItem, index: number) => React.ReactNode;
}) {
  // Five rows to start — the podium and a little context — the rest on request.
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? items : items.slice(0, PREVIEW_ROWS);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="size-4 text-brand" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {pending ? (
          <Skeleton className="m-4 h-40 rounded-lg" />
        ) : items.length === 0 ? (
          <Typography variant="small" className="p-4">
            {emptyText}
          </Typography>
        ) : (
          <>
            <div className="overflow-x-auto overflow-y-hidden">
              <table className="w-full text-sm sm:min-w-[40rem]">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    {columns.map((column, index) => (
                      <th
                        key={index}
                        className={cn(
                          "p-3 text-start font-medium",
                          column.wide && "hidden sm:table-cell",
                        )}
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="[font-variant-numeric:tabular-nums]">
                  {shown.map((item, index) => (
                    <tr
                      key={item.id}
                      className={cn(
                        "border-b last:border-b-0",
                        rowClassName(item),
                      )}
                    >
                      {renderRow(item, index)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {items.length > PREVIEW_ROWS && (
              <div className="border-t p-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setExpanded((current) => !current)}
                  aria-expanded={expanded}
                >
                  <ChevronDown
                    className={cn(
                      "size-4 transition-transform",
                      expanded && "rotate-180",
                    )}
                  />
                  {expanded
                    ? "نمایش کمتر"
                    : `نمایش همه (${items.length.toLocaleString("fa-IR")} نفر)`}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
