"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  CalendarClock,
  ChevronLeft,
  ClipboardList,
  RefreshCw,
  Sparkles,
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

import { DashboardNotes } from "./dashboard-notes";

/**
 * The panel's landing page. Every figure is scoped by the API to the caller —
 * an agent sees their own files, an administrator the whole site — and the
 * `scope` it returns is what the heading reflects.
 */
export function DashboardView() {
  const summary = useQuery(dashboardSummaryQueryOptions());
  const tasks = useQuery(dashboardTasksQueryOptions());
  const followUps = useQuery(followUpsQueryOptions());
  const highlights = useQuery(highlightsQueryOptions());

  const isAll = summary.data?.scope === "all";

  const stats = [
    {
      label: isAll ? "کل فایل‌های فعال" : "فایل‌های من",
      value: summary.data?.estates,
      icon: Building2,
      href: routes.panel.properties,
    },
    {
      label: isAll ? "کل مشتریان" : "مشتریان من",
      value: summary.data?.customers,
      icon: UserRound,
      href: routes.panel.requests,
    },
    {
      label: "فایل‌های امروز سایت",
      value: summary.data?.estates_today,
      icon: TrendingUp,
      href: routes.panel.properties,
    },
    {
      label: "نیازمند به‌روزرسانی",
      value: summary.data?.estates_needing_update ?? undefined,
      icon: RefreshCw,
      href: routes.panel.properties,
    },
  ];

  return (
    <div className="grid gap-4">
      <DashboardNotes />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="flex items-center gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-brand/30"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <stat.icon className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              {summary.isPending ? (
                <Skeleton className="h-6 w-16" />
              ) : (
                <Typography
                  as="span"
                  variant="h4"
                  className="block text-lg font-bold tabular-nums sm:text-lg"
                >
                  {stat.value !== undefined
                    ? stat.value.toLocaleString("fa-IR")
                    : "—"}
                </Typography>
              )}
              <Typography as="span" variant="small" className="block truncate">
                {stat.label}
              </Typography>
            </span>
            <ChevronLeft className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>

      {summary.isError && (
        <Typography variant="small" className="text-destructive">
          {getApiErrorMessage(summary.error)}
        </Typography>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="size-4 text-brand" />
              کارهای پیش رو
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.isPending ? (
              <RowSkeleton />
            ) : tasks.data?.length ? (
              <ul className="grid gap-2">
                {tasks.data.map((task) => (
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
                      <Typography variant="h4" as="p" className="truncate sm:text-sm">
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

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="size-4 text-brand" />
              پیگیری مشتریان
              {followUps.data?.total ? (
                <Badge variant="secondary">
                  {followUps.data.total.toLocaleString("fa-IR")}
                </Badge>
              ) : null}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-brand"
              nativeButton={false}
              render={<Link href={routes.panel.requests} />}
            >
              همه
              <ChevronLeft data-icon="inline-end" />
            </Button>
          </CardHeader>
          <CardContent>
            {followUps.isPending ? (
              <RowSkeleton />
            ) : followUps.data?.items.length ? (
              <ul className="grid gap-2">
                {followUps.data.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="min-w-0">
                      <Typography variant="h4" as="p" className="truncate sm:text-sm">
                        {item.name?.trim() || `مشتری ${item.id.toLocaleString("fa-IR")}`}
                      </Typography>
                      <Typography variant="small" className="mt-0.5 truncate">
                        {item.updated_at_jalali ?? item.updated_at}
                      </Typography>
                    </div>
                    {item.relations?.total ? (
                      <Badge variant="secondary" className="shrink-0">
                        {item.relations.total.toLocaleString("fa-IR")} فایل
                      </Badge>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <Typography variant="small">
                امروز مشتری‌ای برای پیگیری ندارید.
              </Typography>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="size-4 text-brand" />
            ویژه‌های هفته
          </CardTitle>
        </CardHeader>
        <CardContent>
          {highlights.isPending ? (
            <RowSkeleton />
          ) : (highlights.data?.estates.length ?? 0) +
              (highlights.data?.customers.length ?? 0) ===
            0 ? (
            <Typography variant="small">
              این هفته فایل یا مشتری ویژه‌ای ثبت نشده است.
            </Typography>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              <HighlightColumn
                title="فایل‌های ویژه"
                items={highlights.data?.estates ?? []}
                hrefFor={(item) =>
                  item.estate_id ? routes.property(item.estate_id) : undefined
                }
              />
              <HighlightColumn
                title="مشتریان ویژه"
                items={highlights.data?.customers ?? []}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

type Highlight = {
  id: number;
  estate_id?: number | null;
  customer_id?: number | null;
  comment?: string | null;
  agent?: { id?: number | null; name?: string | null; photo?: string | null } | null;
  created_at_jalali?: string | null;
};

function HighlightColumn({
  title,
  items,
  hrefFor,
}: {
  title: string;
  items: Highlight[];
  hrefFor?: (item: Highlight) => string | undefined;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <Typography variant="small" className="mb-2 font-medium text-foreground">
        {title}
      </Typography>
      <ul className="grid gap-2">
        {items.slice(0, 5).map((item) => {
          const href = hrefFor?.(item);
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
                <Typography variant="small" className="line-clamp-2 text-foreground">
                  {item.comment?.trim() || "بدون توضیح"}
                </Typography>
                <Typography as="span" variant="small" className="block truncate text-[11px]">
                  {item.agent?.name}
                  {item.created_at_jalali ? ` · ${item.created_at_jalali}` : ""}
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
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="grid gap-2">
      {Array.from({ length: 3 }, (_, index) => (
        <Skeleton key={index} className="h-14 rounded-lg" />
      ))}
    </div>
  );
}
