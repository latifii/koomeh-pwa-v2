import { AlertTriangle, CalendarDays, CheckCircle2, Clock } from "lucide-react";

import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

type Stats = { total: number; open: number; done: number; overdue: number };

/**
 * The four figures the old calendar put above the grid: how many events the
 * month holds, how many are still to do, how many are done, and how many of
 * the open ones are already past their time. `open` is `total − done`, so
 * overdue is a slice of open, not a fifth bucket — the tone says which.
 */
const TILES: ReadonlyArray<{
  key: keyof Stats;
  label: string;
  icon: typeof CalendarDays;
  tone: string;
}> = [
  { key: "total", label: "رویداد این ماه", icon: CalendarDays, tone: "bg-brand/10 text-brand" },
  { key: "open", label: "در انتظار انجام", icon: Clock, tone: "bg-muted text-foreground" },
  { key: "done", label: "انجام شده", icon: CheckCircle2, tone: "bg-success/10 text-success" },
  { key: "overdue", label: "عقب افتاده", icon: AlertTriangle, tone: "bg-destructive/10 text-destructive" },
];

export function CalendarMonthStats({ stats }: { stats: Stats }) {
  return (
    <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4" aria-label="آمار این ماه">
      {TILES.map((tile) => (
        <div
          key={tile.key}
          className="flex items-center gap-3 rounded-xl border bg-card p-3.5"
        >
          <span
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              tile.tone,
            )}
          >
            <tile.icon className="size-5" />
          </span>
          <span className="min-w-0">
            <dd className="m-0">
              <Typography
                as="span"
                variant="h4"
                className={cn(
                  "block text-lg font-bold tabular-nums sm:text-lg",
                  tile.key === "overdue" && stats.overdue > 0 && "text-destructive",
                )}
              >
                {stats[tile.key].toLocaleString("fa-IR")}
              </Typography>
            </dd>
            <dt>
              <Typography as="span" variant="small" className="block truncate">
                {tile.label}
              </Typography>
            </dt>
          </span>
        </div>
      ))}
    </dl>
  );
}
