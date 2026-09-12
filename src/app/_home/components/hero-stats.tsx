import { Building2, KeyRound, UserRound } from "lucide-react";

import type { HomeStats } from "@/app/_home/_types/home-stats.types";
import { CountUp } from "@/components/ui/count-up";
import { cn } from "@/lib/utils";

/**
 * Shown when the counts could not be fetched — the page must not lose its
 * headline figures to a slow upstream, and these are the right order of
 * magnitude for the site.
 */
const FALLBACK: HomeStats = { sale: 2400, rent: 800, agents: 40, branches: 4 };

/**
 * One low bar rather than three tall cards: the numbers stay prominent while
 * the block keeps a small footprint over the hero image. The figures are the
 * live counts — published sale files, rent files and active agents.
 */
export function HeroStats({
  stats,
  compact = false,
}: {
  stats?: HomeStats;
  compact?: boolean;
}) {
  const figures = stats ?? FALLBACK;
  const rows = [
    { icon: Building2, value: figures.sale, suffix: "+", label: "ملک فروشی" },
    { icon: KeyRound, value: figures.rent, suffix: "+", label: "ملک اجاره‌ای" },
    { icon: UserRound, value: figures.agents, label: "مشاور فعال" },
  ];

  return (
    <dl
      className={cn(
        "grid w-full grid-cols-3 divide-x divide-white/15 rounded-2xl border border-white/15 bg-black/25 backdrop-blur-md",
        compact ? "px-1 py-2" : "max-w-2xl px-2 py-3",
      )}
    >
      {rows.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "flex flex-col items-center gap-0.5",
            compact ? "px-1" : "px-3",
          )}
        >
          <dd className="flex items-center gap-1.5">
            <stat.icon
              className={cn("text-secondary", compact ? "size-4" : "size-5")}
            />
            <span
              className={cn(
                "font-heading leading-none font-bold text-white",
                compact ? "text-lg" : "text-2xl",
              )}
            >
              <CountUp value={stat.value} />
              {stat.suffix}
            </span>
          </dd>
          <dt
            className={cn(
              "leading-tight text-white/70",
              compact ? "text-[10px]" : "text-xs",
            )}
          >
            {stat.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}
