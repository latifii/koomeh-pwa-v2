import { z } from "zod";

export const settingRowSchema = z.object({
  id: z.number().int(),
  group: z.string().default(""),
  name: z.string().default(""),
  value: z.string().nullable().optional(),
  comment: z.string().nullable().optional(),
  /**
   * A second number some rows carry — the league's success multipliers live
   * here. The form never writes it: the web form only ever sent `value`, and
   * the API only writes `count` when it is in the body precisely so that a form
   * which forgot it cannot zero those multipliers.
   */
  count: z.number().int().nullable().optional(),
});

export const settingsResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    items: z.array(settingRowSchema).default([]),
    groups: z.array(z.string()).default([]),
  }),
});

export const baleTestResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    ok: z.boolean().default(false),
    /**
     * Deliberately raw. Three different things produce a failure here — the
     * server cannot reach Bale, the token is wrong, or the bot is not an admin
     * of the channel — and a friendly message would hide which.
     */
    message: z.string().default(""),
  }),
});

export type SettingRow = z.infer<typeof settingRowSchema>;
