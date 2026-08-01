import { Building2, MapPin, UserRound } from "lucide-react";

import { CountUp } from "@/components/ui/count-up";
import { cn } from "@/lib/utils";

/** Mock headline figures — swap for real counts once the API is wired up. */
const heroStats = [
  { icon: Building2, value: 2400, suffix: "+", label: "ملک ثبت‌شده" },
  { icon: UserRound, value: 40, suffix: "+", label: "مشاور متخصص" },
  { icon: MapPin, value: 4, label: "شعبه در قم" },
];

/**
 * One low bar rather than three tall cards: the numbers stay prominent while
 * the block keeps a small footprint over the hero image.
 */
export function HeroStats({ compact = false }: { compact?: boolean }) {
  return (
    <dl
      className={cn(
        "grid w-full grid-cols-3 divide-x divide-white/15 rounded-2xl border border-white/15 bg-black/25 backdrop-blur-md",
        compact ? "px-1 py-2" : "max-w-2xl px-2 py-3"
      )}
    >
      {heroStats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "flex flex-col items-center gap-0.5",
            compact ? "px-1" : "px-3"
          )}
        >
          <dd className="flex items-center gap-1.5">
            <stat.icon
              className={cn("text-secondary", compact ? "size-4" : "size-5")}
            />
            <span
              className={cn(
                "font-heading leading-none font-bold text-white",
                compact ? "text-lg" : "text-2xl"
              )}
            >
              <CountUp value={stat.value} />
              {stat.suffix}
            </span>
          </dd>
          <dt
            className={cn(
              "leading-tight text-white/70",
              compact ? "text-[10px]" : "text-xs"
            )}
          >
            {stat.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}
