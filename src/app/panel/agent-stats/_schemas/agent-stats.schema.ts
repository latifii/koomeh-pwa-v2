import { z } from "zod";

/**
 * The agents' scoreboard ("لیگ ستارگان").
 *
 * Two scores make up a rank: `effort` counts activity — files registered,
 * customers contacted, posts published — and `success` counts closed business.
 * `effortShare` is how much of the total the effort side is worth, which is why
 * a big effort number does not always beat a small success one.
 */

const rangeSchema = z.object({
  from: z.string().nullable().optional(),
  to: z.string().nullable().optional(),
});

export const agentStatsLeagueResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    range: rangeSchema.nullable().optional(),
    effort_share_in_total: z.number().nullable().optional(),
    items: z
      .array(
        z.object({
          id: z.number().int(),
          name: z.string(),
          effort: z.number().default(0),
          success: z.number().default(0),
          total: z.number().default(0),
          rank: z.number().int().nullable().optional(),
          photo: z.string().nullable().optional(),
          branch: z
            .object({
              id: z.number().int().nullable().optional(),
              name: z.string().nullable().optional(),
            })
            .nullable()
            .optional(),
        }),
      )
      .default([]),
  }),
});

/** `/agent-stats/me` is the raw counters, with no scoring applied. */
export const agentStatsMeResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    range: rangeSchema.nullable().optional(),
    counters: z.record(z.string(), z.number()).default({}),
  }),
});

const scoreRowSchema = z.object({
  name: z.string(),
  title: z.string(),
  unit: z.string().nullable().optional(),
  count: z.number().nullable().default(0),
  /**
   * The per-unit multiplier; `count × zarib` is `points`. Comes back null for
   * a row the branch has not set a coefficient on — seen on the disciplinary
   * section — so it is nullable rather than merely defaulted.
   */
  zarib: z.number().nullable().default(0),
  points: z.number().nullable().default(0),
  active: z.boolean().default(true),
  desc: z.string().nullable().optional(),
});

const scoreGroupSchema = z.object({
  sections: z
    .array(
      z.object({
        title: z.string(),
        icon: z.string().nullable().optional(),
        rows: z.array(scoreRowSchema).default([]),
        subtotal: z.number().default(0),
      }),
    )
    .default([]),
  total: z.number().default(0),
  exact: z.number().nullable().optional(),
});

export const agentStatsDetailResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    expert: z
      .object({
        id: z.number().int(),
        name: z.string().nullable().optional(),
        pic: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
    range: rangeSchema.nullable().optional(),
    effort: scoreGroupSchema,
    success: scoreGroupSchema,
    totals: z
      .object({
        effort: z.number().default(0),
        success: z.number().default(0),
        total: z.number().default(0),
        effortShare: z.number().nullable().optional(),
      })
      .nullable()
      .optional(),
    canEditCoefficients: z.boolean().default(false),
  }),
});

export type AgentStatsLeague = z.infer<
  typeof agentStatsLeagueResponseSchema
>["result"];
export type AgentStatsDetail = z.infer<
  typeof agentStatsDetailResponseSchema
>["result"];
export type AgentStatsMe = z.infer<typeof agentStatsMeResponseSchema>["result"];
