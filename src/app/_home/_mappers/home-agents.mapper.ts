import type { TopRankedAgentsResponse } from "@/app/_home/_schemas/home-agents.schema";
import type { HomeTopAgentsSection } from "@/app/_home/_types/home-agents.types";
import type { Agent } from "@/data/home";
import { toAbsoluteMediaUrl } from "@/lib/api/config";
import { routes } from "@/lib/routes";

const numberFormatter = new Intl.NumberFormat("fa-IR", {
  maximumFractionDigits: 0,
});

function isPodiumRank(rank: number): rank is Agent["rank"] {
  return rank === 1 || rank === 2 || rank === 3;
}

export function mapTopRankedAgents(
  response: TopRankedAgentsResponse,
): HomeTopAgentsSection {
  const section = response.result;
  const podium = section.items
    .filter((agent) => isPodiumRank(agent.rank))
    .sort((first, second) => first.rank - second.rank)
    .slice(0, 3);
  const highestScore = Math.max(...podium.map((agent) => agent.score), 1);

  return {
    key: section.key,
    eyebrow: section.eyebrow,
    title: section.title,
    subtitle: section.subtitle,
    viewAllHref: section.view_all_url ? routes.agents : undefined,
    month: section.month,
    monthName: section.month_name,
    total: section.total,
    items: podium.map((agent) => ({
      id: String(agent.id),
      name: agent.name.trim(),
      branch: agent.branch.name,
      rank: agent.rank as Agent["rank"],
      score: numberFormatter.format(agent.score),
      scoreValue: Math.round((agent.score / highestScore) * 100),
      gender: "male" as const,
      photo: toAbsoluteMediaUrl(agent.photo),
    })),
  };
}
