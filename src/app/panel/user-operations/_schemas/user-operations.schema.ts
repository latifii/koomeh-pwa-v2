import { z } from "zod";

/**
 * The agents' own log — the old site's `/profile/operationUser`.
 *
 * Not to be confused with the two lists under `_operations`: those are what an
 * agent did *to* a listing or a customer. This is about the agent — a late
 * arrival, dress code, points the manager hands out — and every row carries a
 * score that the scoreboard adds up. The score is computed by the API at the
 * moment of writing, from the office's own coefficients, so it is read here and
 * never recalculated.
 */

/**
 * The operation types the office uses. Numbers are the API's; the two
 * site-14-only kinds (absence, afternoon delay) never reach this site and are
 * deliberately absent. `INACTIVITY` is legacy: it can be filtered on because
 * old rows have it, but nothing new is written with it.
 */
export const USER_OPERATION_TYPE = {
  COVER: "1",
  DELAY: "2",
  INACTIVITY: "3",
  SESSION: "4",
  MANAGEMENT: "5",
} as const;

export const userOperationRowSchema = z.object({
  id: z.number().int(),
  type: z.number().int(),
  type_label: z.string().nullable().optional(),
  score: z.number().default(0),
  /** Minutes for a delay, the points for a management entry, free text otherwise. */
  comment: z.string().nullable().optional(),
  expert: z
    .object({
      id: z.number().int(),
      name: z.string().nullable().optional(),
      /** The old site's path; this app builds its own link from the id. */
      url: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  operation_date: z.string().nullable().optional(),
  created_at: z.string().default(""),
  created_at_jalali: z.string().default(""),
});

export const userOperationsResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    items: z.array(userOperationRowSchema).default([]),
    meta: z
      .object({
        page: z.number().int().default(1),
        per_page: z.number().int().default(20),
        total: z.number().int().nonnegative().default(0),
        last_page: z.number().int().nonnegative().default(1),
      })
      .default({ page: 1, per_page: 20, total: 0, last_page: 1 }),
    /** Only an administrator may delete; the API says so rather than the UI guessing. */
    can_delete: z.boolean().default(false),
  }),
});

export const createUserOperationResponseSchema = z.object({
  status: z.literal("success"),
  result: userOperationRowSchema,
});

export type UserOperationRow = z.infer<typeof userOperationRowSchema>;

export type UserOperationFilters = {
  /** An agent's id, or a branch's id negated — the shared dropdown's convention. */
  user_id: string;
  type: string;
  datefrom: string;
  dateto: string;
};

export const defaultUserOperationFilters: UserOperationFilters = {
  user_id: "",
  type: "",
  datefrom: "",
  dateto: "",
};

const digits = /^-?\d+$/;

/**
 * The form. What `comment` means — and whether it is required — depends on the
 * type, which is why it is validated here rather than by a field prop: a delay
 * is minutes and must be given, a management entry *is* its points, and the
 * other two only take an optional note.
 */
export const createUserOperationSchema = z
  .object({
    type: z.enum([
      USER_OPERATION_TYPE.COVER,
      USER_OPERATION_TYPE.DELAY,
      USER_OPERATION_TYPE.SESSION,
      USER_OPERATION_TYPE.MANAGEMENT,
    ]),
    expert_id: z.string().min(1, "کارشناس را انتخاب کنید"),
    comment: z.string().trim().max(500, "حداکثر ۵۰۰ نویسه"),
  })
  .superRefine((values, ctx) => {
    if (values.type === USER_OPERATION_TYPE.DELAY) {
      const minutes = Number(values.comment);
      if (!digits.test(values.comment) || minutes < 1 || minutes > 1440) {
        ctx.addIssue({
          code: "custom",
          path: ["comment"],
          message: "دقیقه‌ی تأخیر را به عدد وارد کنید (۱ تا ۱۴۴۰)",
        });
      }
    }

    if (values.type === USER_OPERATION_TYPE.MANAGEMENT) {
      const points = Number(values.comment);
      if (!digits.test(values.comment) || points < -1000 || points > 1000) {
        ctx.addIssue({
          code: "custom",
          path: ["comment"],
          message: "امتیاز را به عدد وارد کنید (منفی هم می‌شود)",
        });
      }
    }
  });

export type CreateUserOperationValues = z.infer<typeof createUserOperationSchema>;
