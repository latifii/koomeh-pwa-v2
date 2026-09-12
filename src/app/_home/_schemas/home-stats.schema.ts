import { z } from "zod";

/** `/home/sections/stats` — the counts under the home page headline. */
export const homeStatsResponseSchema = z.object({
  status: z.string(),
  result: z.object({
    sale_count: z.number(),
    rent_count: z.number(),
    agents_count: z.number(),
    branches_count: z.number(),
  }),
});

export type HomeStatsResponse = z.infer<typeof homeStatsResponseSchema>;
