import { z } from "zod";

/**
 * The session cookie's shape, as a schema.
 *
 * Kept apart from `session.types.ts` because only `decryptSession` uses it, and
 * that runs on the server. The types module is imported by the browser store,
 * and anything of substance living there is shipped to every visitor: while
 * these schemas sat beside the types, `zod` rode along into the first load of
 * every page for a validation step the browser never performs.
 *
 * `session.types.ts` derives its types from here, so the two cannot drift.
 */

export const sessionUserSchema = z.object({
  id: z.number(),
  fullName: z.string(),
  username: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  photo: z.string().optional(),
  /**
   * A snapshot, not the authority. Roles are baked into the cookie, so one
   * revoked in the backend keeps showing here until the session is rebuilt —
   * which happens on every token rotation, so at most one access-token
   * lifetime (two hours on this API), not the whole refresh window. Long
   * enough to matter for what the UI offers, which is why nothing
   * security-relevant may rest on these: the API decides, and answers 403
   * regardless of what the cookie claims.
   */
  roles: z.array(z.string()),
  isAdmin: z.boolean(),
  isExpert: z.boolean(),
});

/** What the encrypted cookie carries. Times are epoch milliseconds. */
export const userSessionSchema = z.object({
  user: sessionUserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresAt: z.number(),
  refreshExpiresAt: z.number(),
});
