import { z } from "zod";

/**
 * For endpoints whose answer is "it worked" and nothing else — a delete, a
 * move, a toggle with no payload. Still parsed rather than ignored, so a
 * failure that arrives with HTTP 200 does not read as a success.
 *
 * `result` is deliberately loose: several of these return a message or an id
 * alongside the status, and callers that need it can narrow their own schema.
 */
export const successResponseSchema = z.object({
  status: z.literal("success"),
  result: z.unknown().optional(),
});

/** The same, for endpoints that answer with a human-readable confirmation. */
export const messageResponseSchema = z.object({
  status: z.literal("success"),
  result: z
    .object({ message: z.string().nullable().optional() })
    .nullable()
    .optional(),
});

export type SuccessResponse = z.infer<typeof successResponseSchema>;
