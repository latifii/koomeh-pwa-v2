import type { Agent } from "@/data/home";

export interface HomeTopAgentsSection {
  key: "top_ranked_agents_of_month";
  eyebrow: string;
  title: string;
  subtitle: string;
  viewAllHref?: string;
  month: number;
  monthName: string;
  total: number;
  items: Agent[];
}
