"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  CalendarClock,
  ChevronLeft,
  ClipboardList,
  RefreshCw,
  Star,
  TrendingUp,
  UserRound,
} from "lucide-react";

import {
  dashboardSummaryQueryOptions,
  dashboardTasksQueryOptions,
  followUpsQueryOptions,
  highlightsQueryOptions,
} from "@/app/panel/dashboard/_queries/dashboard.query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { toAbsoluteMediaUrl } from "@/lib/api/config";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

import { DashboardNotes } from "./dashboard-notes";
import { DashboardPerformance } from "./dashboard-performance";

/**
 * The panel's landing page, section for section the old site's /dashboard for
 * an agent: upcoming tasks, the two notes, four counters, this week's featured
 * files and customers, the scoring block (branch averages, the two leagues,
 * the agent's own stats table) and the customers to follow up. Every figure is
 * scoped by the API to the caller — an agent sees their own files, an
 * administrator the whole site — and the `scope` it returns is what the
 * labels reflect.
 */
export function DashboardView() {
  const summary = useQuery(dashboardSummaryQueryOptions());
  const tasks = useQuery(dashboardTasksQueryOptions());
  const followUps = useQuery(followUpsQueryOptions());
  const highlights = useQuery(highlightsQueryOptions());

  const isAll = summary.data?.scope === "all";

  const stats = [
    {
      label: isAll ? "تعداد املاک" : "تعداد املاک من",
      value: summary.data?.estates,
      icon: Building2,
      href: routes.panel.properties,
    },
    {
      label: isAll ? "تعداد مشتریان" : "تعداد مشتریان من",
      value: summary.data?.customers,
      icon: UserRound,
      href: routes.panel.requests,
    },
    {
      label: "املاک امروز",
      value: summary.data?.estates_today,
      icon: TrendingUp,
      href: routes.panel.properties,
    },
    {
      // The old card's «املاک منقضی»: files past their show-date window.
      label: "املاک منقضی",
      value: summary.data?.estates_needing_update ?? undefined,
      icon: RefreshCw,
      // Opens the list already filtered, as the old card did.
      href: `${routes.panel.properties}?isexpire=1`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* The old page's order: tasks first, then the two notes, the counters,
          the week's featured files and customers, the scoring block, and the
          customers to follow up at the end. */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="size-4 text-brand" />
            کارهای پیش رو
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-brand"
            nativeButton={false}
            render={<Link href={routes.panel.appointments} />}
          >
            تقویم
            <ChevronLeft data-icon="inline-end" />
          </Button>
        </CardHeader>
        <CardContent>
          {tasks.isPending ? (
            <RowSkeleton />
          ) : tasks.data?.length ? (
            <ul className="grid grid-cols-1 gap-2">
              {tasks.data.slice(0, 6).map((task) => (
                <li
                  key={task.id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <span
                    aria-hidden
                    className="mt-1.5 size-2 shrink-0 rounded-full"
                    style={{ background: task.color ?? "var(--brand)" }}
                  />
                  <div className="min-w-0 flex-1">
                    <Typography
                      variant="h4"
                      as="p"
                      className="truncate sm:text-sm"
                    >
                      {task.title}
                    </Typography>
                    <Typography variant="small" className="mt-0.5">
                      {task.at_jalali ?? task.at}
                      {task.location ? ` · ${task.location}` : ""}
                    </Typography>
                  </div>
                  {task.type_label && (
                    <Badge variant="secondary">{task.type_label}</Badge>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <Typography variant="small">
              رویداد پیش‌رویی در تقویم شما ثبت نشده است.
            </Typography>
          )}
        </CardContent>
      </Card>

      <DashboardNotes />

      {/* Two to a row on a phone — four single-column tiles were a screen of
          scrolling for four numbers. The arrow goes when there is no room. */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="flex items-center gap-2.5 rounded-xl border bg-card p-3 transition-colors hover:border-brand/30 sm:gap-3 sm:p-4"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand sm:size-11 sm:rounded-xl">
              <stat.icon className="size-4 sm:size-5" />
            </span>
            <span className="min-w-0 flex-1">
              {summary.isPending ? (
                <Skeleton className="h-6 w-12" />
              ) : (
                <Typography
                  as="span"
                  variant="h4"
                  className="block text-base font-bold tabular-nums sm:text-lg"
                >
                  {stat.value !== undefined
                    ? stat.value.toLocaleString("fa-IR")
                    : "—"}
                </Typography>
              )}
              <Typography
                as="span"
                variant="small"
                className="block truncate text-[11px] sm:text-xs"
              >
                {stat.label}
              </Typography>
            </span>
            <ChevronLeft className="hidden size-4 shrink-0 text-muted-foreground sm:block" />
          </Link>
        ))}
      </div>

      {summary.isError && (
        <Typography variant="small" className="text-destructive">
          {getApiErrorMessage(summary.error)}
        </Typography>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <HighlightCard
          title="املاک ویژه"
          pending={highlights.isPending}
          items={highlights.data?.estates ?? []}
          emptyText="این هفته فایل ویژه‌ای ثبت نشده است."
          codeLabel="کد ملک"
          codeOf={(item) => item.estate_id}
          hrefFor={(item) =>
            item.estate_id ? routes.property(item.estate_id) : undefined
          }
        />
        <HighlightCard
          title="مشتریان ویژه"
          pending={highlights.isPending}
          items={highlights.data?.customers ?? []}
          emptyText="این هفته مشتری ویژه‌ای ثبت نشده است."
          codeLabel="کد مشتری"
          codeOf={(item) => item.customer_id}
          hrefFor={(item) =>
            item.customer_id
              ? routes.panel.request(item.customer_id)
              : undefined
          }
        />
      </div>

      <DashboardPerformance />

      <TodayCustomersCard
        pending={followUps.isPending}
        items={followUps.data?.items ?? []}
      />
    </div>
  );
}

type Highlight = {
  id: number;
  estate_id?: number | null;
  customer_id?: number | null;
  comment?: string | null;
  agent?: {
    id?: number | null;
    name?: string | null;
    photo?: string | null;
  } | null;
  created_at_jalali?: string | null;
};

/**
 * One of the two «ویژه» boxes, as the old dashboard drew them: the code, who
 * logged it, when, and the note — the box itself always present, so an empty
 * week reads as «none this week» rather than as a missing section.
 */
function HighlightCard({
  title,
  pending,
  items,
  emptyText,
  codeLabel,
  codeOf,
  hrefFor,
}: {
  title: string;
  pending: boolean;
  items: Highlight[];
  emptyText: string;
  codeLabel: string;
  codeOf: (item: Highlight) => number | null | undefined;
  hrefFor: (item: Highlight) => string | undefined;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="size-4 text-brand" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pending ? (
          <RowSkeleton />
        ) : items.length === 0 ? (
          <Typography variant="small">{emptyText}</Typography>
        ) : (
          <ul className="grid grid-cols-1 gap-2">
            {/* Six is a glance; the rest is what the page behind the code is for. */}
            {items.slice(0, 6).map((item) => {
              const href = hrefFor(item);
              const code = codeOf(item);
              const body = (
                <>
                  <Avatar className="size-8 shrink-0">
                    {item.agent?.photo && (
                      <AvatarImage
                        src={toAbsoluteMediaUrl(item.agent.photo) ?? ""}
                        alt={item.agent.name ?? ""}
                      />
                    )}
                    <AvatarFallback className="text-[10px]">
                      {item.agent?.name?.charAt(0) ?? "؟"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      {code ? (
                        <Typography
                          as="span"
                          variant="small"
                          className="font-medium tabular-nums text-foreground"
                        >
                          {codeLabel} {code.toLocaleString("fa-IR")}
                        </Typography>
                      ) : null}
                      <Typography
                        as="span"
                        variant="small"
                        className="truncate"
                      >
                        {item.agent?.name}
                        {item.created_at_jalali
                          ? ` · ${item.created_at_jalali}`
                          : ""}
                      </Typography>
                    </span>
                    <Typography
                      variant="small"
                      className="line-clamp-2 text-foreground"
                    >
                      {item.comment?.trim() || "بدون توضیح"}
                    </Typography>
                  </span>
                </>
              );

              return (
                <li key={item.id}>
                  {href ? (
                    <Link
                      href={href}
                      className="flex items-start gap-2.5 rounded-lg border p-2.5 transition-colors hover:border-brand/30"
                    >
                      {body}
                    </Link>
                  ) : (
                    <div className="flex items-start gap-2.5 rounded-lg border p-2.5">
                      {body}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

type FollowUp = {
  id: number;
  name?: string | null;
  updated_at?: string | null;
  updated_at_jalali?: string | null;
  relations?: { total: number; by_status: number[] } | null;
};

/**
 * The old dashboard's «عملکرد امروز»: the agent's live customers whose last
 * change falls on a follow-up day, each with the count of files proposed to
 * them by status — and, as on the old page, only those with at least one
 * file, since the table is about what to follow up on. The API's by_status
 * indexes are the relation statuses: 0 unknown, 1 rejected, 2 approved,
 * 3 sent; the old columns ran total, approved, rejected, sent, unknown.
 */
const RELATION_COLUMNS: ReadonlyArray<{
  index: number;
  label: string;
  tone?: string;
}> = [
  { index: 2, label: "تأییدشده", tone: "text-success" },
  { index: 1, label: "ردشده", tone: "text-destructive" },
  { index: 3, label: "ارسال‌شده" },
  { index: 0, label: "نامشخص" },
];

function TodayCustomersCard({
  pending,
  items,
}: {
  pending: boolean;
  items: FollowUp[];
}) {
  const rows = items.filter((item) => (item.relations?.total ?? 0) > 0);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="size-4 text-brand" />
          عملکرد امروز
          {rows.length > 0 && (
            <Badge variant="secondary">
              {rows.length.toLocaleString("fa-IR")}
            </Badge>
          )}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-brand"
          nativeButton={false}
          render={<Link href={`${routes.panel.requests}?today=1&agent=me`} />}
        >
          همه
          <ChevronLeft data-icon="inline-end" />
        </Button>
      </CardHeader>
      <CardContent className={rows.length > 0 ? "p-0" : undefined}>
        {pending ? (
          <RowSkeleton />
        ) : rows.length === 0 ? (
          <Typography variant="small">
            امروز مشتری‌ای در نوبت پیگیری با فایل پیشنهادی ندارید.
          </Typography>
        ) : (
          <ul className="divide-y">
            {rows.map((item) => {
              const byStatus = item.relations?.by_status ?? [];
              return (
                <li
                  key={item.id}
                  className="grid gap-2 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <Link
                    href={routes.panel.request(item.id)}
                    className="min-w-0 hover:text-brand"
                  >
                    <Typography
                      as="span"
                      variant="small"
                      className="block truncate font-medium text-foreground"
                    >
                      {item.name?.trim() ||
                        `مشتری ${item.id.toLocaleString("fa-IR")}`}
                      <Typography
                        as="span"
                        variant="small"
                        className="ms-2 tabular-nums"
                      >
                        #{item.id.toLocaleString("fa-IR")}
                      </Typography>
                    </Typography>
                    <Typography
                      as="span"
                      variant="small"
                      className="block truncate"
                    >
                      {item.updated_at_jalali ?? item.updated_at}
                    </Typography>
                  </Link>
                  {/* The five old columns as one row of figures, labelled. */}
                  <dl className="grid grid-cols-5 gap-1 text-center sm:gap-2">
                    <div>
                      <dd className="m-0 font-semibold tabular-nums text-brand">
                        {(item.relations?.total ?? 0).toLocaleString("fa-IR")}
                      </dd>
                      <dt className="text-[10px] text-muted-foreground">
                        متناسب
                      </dt>
                    </div>
                    {RELATION_COLUMNS.map((column) => (
                      <div key={column.index}>
                        <dd
                          className={cn(
                            "m-0 font-semibold tabular-nums",
                            (byStatus[column.index] ?? 0) > 0 && column.tone,
                          )}
                        >
                          {(byStatus[column.index] ?? 0).toLocaleString(
                            "fa-IR",
                          )}
                        </dd>
                        <dt className="text-[10px] text-muted-foreground">
                          {column.label}
                        </dt>
                      </div>
                    ))}
                  </dl>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function RowSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-2">
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton key={index} className="h-14 rounded-lg" />
      ))}
    </div>
  );
}
