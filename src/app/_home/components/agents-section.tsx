import Link from "next/link";
import { ArrowLeft, Trophy, User } from "lucide-react";

import { Section } from "@/components/layout/section";
import type { Agent } from "@/data/home";
import { cn } from "@/lib/utils";

import { SectionHeader } from "./section-header";

const rankTitles: Record<Agent["rank"], string> = {
  1: "اول",
  2: "دوم",
  3: "سوم",
};

const rankStyles: Record<Agent["rank"], string> = {
  1: "bg-secondary text-primary",
  2: "bg-white/15 text-white",
  3: "bg-white/10 text-white/80",
};

export function AgentsSection({ agents }: { agents: Agent[] }) {
  if (agents.length === 0) return null;

  return (
    <Section tone="primary">
      <SectionHeader
        eyebrow="تیم حرفه‌ای کومه"
        title="مشاوران برتر این ماه"
        description="مشاورانی با شناخت واقعی از محله‌های قم."
        light
        className="mb-8"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {agents.map((agent) => (
          <Link
            key={agent.id}
            href={`/agents/${agent.id}`}
            className="flex flex-col items-center gap-3 rounded-2xl bg-white/5 p-6 text-center ring-1 ring-white/10 transition-colors hover:bg-white/10"
          >
            <span
              className={cn(
                "flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold",
                rankStyles[agent.rank]
              )}
            >
              <Trophy className="size-3" />
              رتبه {rankTitles[agent.rank]}
            </span>

            <span className="flex size-20 items-center justify-center rounded-full bg-white/10">
              <User className="size-9 text-white/70" strokeWidth={1.5} />
            </span>

            <h3 className="font-heading text-base font-semibold">
              {agent.name}
            </h3>
            <p className="text-xs text-primary-foreground/60">
              شعبه {agent.branch}
            </p>
            <small className="text-xs text-secondary">
              امتیاز کسب‌شده: {agent.score}
            </small>

            <span className="mt-1 flex items-center gap-1 text-xs font-medium">
              مشاهده پروفایل
              <ArrowLeft className="size-3.5" />
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
