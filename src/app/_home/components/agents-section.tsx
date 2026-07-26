import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Crown, Handshake, Medal, TrendingUp } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { defaultAvatars } from "@/data/avatars";
import type { Agent } from "@/data/home";
import { cn } from "@/lib/utils";

import { SectionHeader } from "./section-header";

const rankLabels: Record<Agent["rank"], string> = {
  1: "رتبه اول",
  2: "رتبه دوم",
  3: "رتبه سوم",
};

/** Gold / silver / bronze, expressed with brand tokens only. */
const rankStyles: Record<
  Agent["rank"],
  { chip: string; ring: string; bar: string; glow: string }
> = {
  1: {
    chip: "bg-secondary text-secondary-foreground",
    ring: "ring-secondary",
    bar: "bg-secondary",
    glow: "shadow-[0_0_50px_-12px_var(--secondary)]",
  },
  2: {
    chip: "bg-white/85 text-primary",
    ring: "ring-white/70",
    bar: "bg-white/70",
    glow: "",
  },
  3: {
    chip: "bg-white/30 text-white",
    ring: "ring-white/35",
    bar: "bg-white/40",
    glow: "",
  },
};

/**
 * Podium order in RTL flow: the first item lands on the physical right, so
 * third place sits right, the champion stays centred and raised, and the
 * runner-up ends up on the left.
 */
const podiumOrder: Record<Agent["rank"], string> = {
  1: "order-2 lg:-translate-y-6",
  2: "order-3",
  3: "order-1",
};

export function AgentsSection({ agents }: { agents: Agent[] }) {
  if (agents.length === 0) return null;

  const ranked = [...agents].sort((a, b) => a.rank - b.rank).slice(0, 3);

  return (
    <Section
      tone="primary"
      container={false}
      className="relative overflow-hidden"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-l from-transparent via-secondary/50 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 start-1/2 size-96 -translate-x-1/2 rounded-full bg-secondary/10 blur-[120px]"
      />

      <Container className="relative z-10">
        <SectionHeader
          eyebrow="تیم حرفه‌ای کومه"
          title="مشاوران برتر این ماه"
          description="رتبه‌بندی بر اساس عملکرد ۳۰ روز گذشته؛ هر ماه بازنشانی می‌شود."
          href="/agents"
          linkLabel="جدول کامل"
          light
          className="mb-8"
        />

        {/* Desktop: podium — champion raised in the middle */}
        <div className="hidden items-end gap-5 lg:flex">
          {ranked.map((agent) => (
            <PodiumCard key={agent.id} agent={agent} />
          ))}
        </div>

        {/* Mobile: a tight leaderboard list — one short row per agent */}
        <ul className="flex flex-col gap-2.5 lg:hidden">
          {ranked.map((agent) => (
            <li key={agent.id}>
              <LeaderRow agent={agent} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

function PodiumCard({ agent }: { agent: Agent }) {
  const style = rankStyles[agent.rank];
  const isChampion = agent.rank === 1;

  return (
    <Link
      href={`/agents/${agent.id}`}
      className={cn(
        "group relative flex flex-1 flex-col items-center gap-3 rounded-3xl border border-white/12 bg-white/5 px-5 pb-5 pt-12 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-secondary/40",
        isChampion && "bg-white/10 pt-14",
        podiumOrder[agent.rank],
        style.glow
      )}
    >
      <span
        className={cn(
          "absolute -top-3 flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold shadow-sm",
          style.chip
        )}
      >
        {isChampion ? (
          <Crown className="size-3" />
        ) : (
          <Medal className="size-3" />
        )}
        {rankLabels[agent.rank]}
      </span>

      <span className="relative">
        <Image
          src={defaultAvatars[agent.gender]}
          alt={agent.name}
          className={cn(
            "size-20 rounded-full object-cover ring-2 ring-offset-2 ring-offset-primary transition-transform duration-300 group-hover:scale-105",
            isChampion && "size-24",
            style.ring
          )}
        />
        <span
          className={cn(
            "absolute -bottom-1 inset-s-0 flex size-6 items-center justify-center rounded-full font-heading text-[11px] font-bold ring-2 ring-primary",
            style.chip
          )}
        >
          {agent.rank}
        </span>
      </span>

      <span className="flex flex-col gap-0.5">
        <h3
          className={cn(
            "font-heading text-base font-semibold text-white",
            isChampion && "text-lg"
          )}
        >
          {agent.name}
        </h3>
        <span className="text-xs text-white/55">شعبه {agent.branch}</span>
      </span>

      <span className="flex w-full items-center justify-center gap-4 text-xs text-white/70">
        <span className="flex items-center gap-1">
          <Handshake className="size-3.5 text-secondary" />
          {agent.deals} معامله
        </span>
        <span className="h-3.5 w-px bg-white/20" />
        <span className="flex items-center gap-1">
          <TrendingUp className="size-3.5 text-secondary" />
          امتیاز {agent.score}
        </span>
      </span>

      <ScoreBar value={agent.scoreValue} className={style.bar} />

      <span className="flex items-center gap-1 text-xs font-medium text-white/80 transition-colors group-hover:text-secondary">
        مشاهده پروفایل
        <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
      </span>
    </Link>
  );
}

function LeaderRow({ agent }: { agent: Agent }) {
  const style = rankStyles[agent.rank];

  return (
    <Link
      href={`/agents/${agent.id}`}
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-white/12 bg-white/5 p-3 backdrop-blur-sm transition-colors active:bg-white/10",
        agent.rank === 1 && "border-secondary/40 bg-white/10"
      )}
    >
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full font-heading text-xs font-bold",
          style.chip
        )}
      >
        {agent.rank}
      </span>

      <Image
        src={defaultAvatars[agent.gender]}
        alt={agent.name}
        className={cn(
          "size-12 shrink-0 rounded-full object-cover ring-2",
          style.ring
        )}
      />

      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate font-heading text-sm font-semibold text-white">
            {agent.name}
          </span>
          <span className="shrink-0 text-[11px] text-white/55">
            شعبه {agent.branch}
          </span>
        </span>
        <ScoreBar value={agent.scoreValue} className={style.bar} />
        <span className="flex items-center gap-2.5 text-[11px] text-white/60">
          <span className="flex items-center gap-1">
            <Handshake className="size-3 text-secondary" />
            {agent.deals} معامله
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="size-3 text-secondary" />
            امتیاز {agent.score}
          </span>
        </span>
      </span>

      <ArrowLeft className="size-4 shrink-0 text-white/40" />
    </Link>
  );
}

/** Relative performance bar — makes the gap between ranks visible at a glance. */
function ScoreBar({ value, className }: { value: number; className: string }) {
  return (
    <span className="block h-1.5 w-full overflow-hidden rounded-full bg-white/12">
      <span
        className={cn("block h-full rounded-full", className)}
        style={{ width: `${value}%` }}
      />
    </span>
  );
}
