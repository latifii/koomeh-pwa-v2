import { z } from "zod";

const rankedAgentSchema = z.object({
  id: z.number().int(),
  rank: z.number().int().positive(),
  rank_label: z.string(),
  name: z.string(),
  photo: z.string(),
  score: z.number().nonnegative(),
  branch: z.object({
    id: z.number().int(),
    name: z.string(),
  }),
  url: z.string(),
});

export const topRankedAgentsResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    key: z.literal("top_ranked_agents_of_month"),
    eyebrow: z.string(),
    title: z.string(),
    subtitle: z.string(),
    view_all_url: z.string().nullable(),
    month: z.number().int().min(1).max(12),
    month_name: z.string(),
    total: z.number().int().nonnegative(),
    items: z.array(rankedAgentSchema),
  }),
});

export type TopRankedAgentsResponse = z.infer<
  typeof topRankedAgentsResponseSchema
>;
