"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Medal, ShieldAlert, Trophy } from "lucide-react";

import { useSessionStore } from "@/app/auth/_stores/auth.store";
import type { AgentStatsRange } from "@/app/panel/agent-stats/_api/agent-stats.service";
import { AgentStatsDetailDialog } from "@/app/panel/agent-stats/_components/agent-stats-detail-dialog";
import {
  agentStatsLeagueQueryOptions,
  myAgentStatsQueryOptions,
} from "@/app/panel/agent-stats/_queries/agent-stats.query";
import { EmptyState } from "@/components/shared/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { cn } from "@/lib/utils";

function score(value: number): string {
  return value.toLocaleString("fa-IR", { maximumFractionDigits: 1 });
}

/**
 * The scoreboard. Ranks come from the API already sorted, so nothing here
 * re-sorts — the tie-breaking rule lives on the server and would drift if this
 * tried to reproduce it.
 */
export function AgentStatsBoard() {
  const user = useSessionStore((state) => state.session?.user);
  const isStaff = Boolean(user?.isExpert || user?.isAdmin);

  const [range, setRange] = useState<AgentStatsRange>({});
  const [selected, setSelected] = useState<number | null>(null);

  const league = useQuery(agentStatsLeagueQueryOptions(range, isStaff));
  const mine = useQuery(myAgentStatsQueryOptions(range, isStaff));

  if (!isStaff) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="جدول امتیاز فقط برای کارشناسان است"
        description="این بخش به دسترسی کارشناس یا مدیر نیاز دارد."
      />
    );
  }

  const myRow = league.data?.items.find((item) => item.id === user?.id) ?? null;
  // Counters come back as a flat map with a lot of zeros; only what happened
  // is worth showing.
  const activeCounters = Object.entries(mine.data?.counters ?? {}).filter(
    ([, value]) => value > 0,
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div className="space-y-1">
            <Label htmlFor="stats-from">از تاریخ (شمسی)</Label>
            <Input
              id="stats-from"
              value={range.datefrom ?? ""}
              placeholder="1405/06/01"
              onChange={(event) =>
                setRange((current) => ({
                  ...current,
                  datefrom: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="stats-to">تا تاریخ (شمسی)</Label>
            <Input
              id="stats-to"
              value={range.dateto ?? ""}
              placeholder="1405/06/31"
              onChange={(event) =>
                setRange((current) => ({
                  ...current,
                  dateto: event.target.value,
                }))
              }
            />
          </div>
          <Button type="button" variant="outline" onClick={() => setRange({})}>
            بازه‌ی پیش‌فرض
          </Button>
          {league.data?.range && (
            <Typography variant="small" className="text-muted-foreground">
              {`بازه: ${league.data.range.from} تا ${league.data.range.to}`}
            </Typography>
          )}
        </CardContent>
      </Card>

      {myRow && (
        <Card className="border-brand">
          <CardContent className="flex flex-wrap items-center gap-4 p-4">
            <span className="flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Trophy className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <Typography variant="h4">جایگاه شما</Typography>
              <Typography variant="small" className="text-muted-foreground">
                {`رتبه ${myRow.rank?.toLocaleString("fa-IR") ?? "—"} · تلاش ${score(myRow.effort)} · موفقیت ${score(myRow.success)}`}
              </Typography>
            </div>
            <Typography variant="h3" className="text-brand">
              {score(myRow.total)}
            </Typography>
          </CardContent>
        </Card>
      )}

      {activeCounters.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <Typography variant="h4" className="mb-3">
              شمارنده‌های خام شما
            </Typography>
            <div className="flex flex-wrap gap-2">
              {activeCounters.map(([name, value]) => (
                <Badge key={name} variant="secondary">
                  {`${name}: ${value.toLocaleString("fa-IR")}`}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {league.isPending && <Skeleton className="h-96 rounded-xl" />}

      {league.isError && (
        <EmptyState
          icon={Trophy}
          title="جدول امتیاز در دسترس نیست"
          description={getApiErrorMessage(league.error)}
          action={
            <Button type="button" variant="outline" onClick={() => league.refetch()}>
              تلاش دوباره
            </Button>
          }
        />
      )}

      {league.isSuccess && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto overflow-y-hidden">
              <table className="w-full min-w-[36rem] text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="p-3 text-start font-medium">رتبه</th>
                    <th className="p-3 text-start font-medium">مشاور</th>
                    <th className="p-3 text-start font-medium">تلاش</th>
                    <th className="p-3 text-start font-medium">موفقیت</th>
                    <th className="p-3 text-start font-medium">کل</th>
                    <th className="p-3" />
                  </tr>
                </thead>
                <tbody className="[font-variant-numeric:tabular-nums]">
                  {league.data.items.map((item) => (
                    <tr
                      key={item.id}
                      className={cn(
                        "border-b last:border-b-0",
                        item.id === user?.id && "bg-brand/5",
                      )}
                    >
                      <td className="p-3">
                        <span className="flex items-center gap-1">
                          {item.rank !== null &&
                            item.rank !== undefined &&
                            item.rank <= 3 && (
                              <Medal className="size-4 text-brand" />
                            )}
                          {item.rank?.toLocaleString("fa-IR") ?? "—"}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="flex items-center gap-2">
                          <Avatar className="size-8">
                            {item.photo && <AvatarImage src={item.photo} alt="" />}
                            <AvatarFallback>
                              {item.name.trim().charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="min-w-0">
                            <Typography as="span" variant="body">
                              {item.name}
                            </Typography>
                            {item.branch?.name && (
                              <Typography
                                variant="small"
                                className="text-muted-foreground"
                              >
                                {item.branch.name}
                              </Typography>
                            )}
                          </span>
                        </span>
                      </td>
                      <td className="p-3">{score(item.effort)}</td>
                      <td className="p-3">{score(item.success)}</td>
                      <td className="p-3 font-medium">{score(item.total)}</td>
                      <td className="p-3 text-end">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelected(item.id)}
                        >
                          ریز امتیاز
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <AgentStatsDetailDialog
        agentId={selected}
        range={range}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
