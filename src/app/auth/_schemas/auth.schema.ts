import { z } from "zod";

/* ------------------------------------------------------------ API responses */

const authUserSchema = z.object({
  id: z.number().int(),
  name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  full_name: z.string().nullable().optional(),
  username: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  roles: z.array(z.string()).default([]),
});

/** `/api/login` and `/api/refresh` return the same token pair. */
export const tokenPairSchema = z.object({
  status: z.boolean().optional(),
  token_type: z.string().default("Bearer"),
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number().int().nonnegative(),
  expires_at: z.string().nullable().optional(),
  refresh_expires_in: z.number().int().nonnegative(),
  refresh_expires_at: z.string().nullable().optional(),
  user: authUserSchema.nullable().optional(),
});

export const meResponseSchema = z.union([
  authUserSchema,
  z.object({ user: authUserSchema }),
  z.object({ result: authUserSchema }),
]);

/**
 * `/api/site3/session` — the only place roles are broken out into flags, which
 * is what the panel needs to decide what to render.
 */
export const siteSessionResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    id: z.number().int(),
    name: z.string().nullable().optional(),
    username: z.string().nullable().optional(),
    photo: z.string().nullable().optional(),
    is_admin: z.boolean().default(false),
    is_expert: z.boolean().default(false),
    roles: z.array(z.string()).default([]),
    impersonating: z.boolean().default(false),
  }),
});

export type AuthUserDto = z.infer<typeof authUserSchema>;
export type TokenPairDto = z.infer<typeof tokenPairSchema>;
export type SiteSessionResponse = z.infer<typeof siteSessionResponseSchema>;

/* --------------------------------------------------------------- form input */

/**
 * The API calls it `username`, but for this project it is always a mobile
 * number, so the field is validated as one. Persian and Arabic-Indic digits are
 * normalised first — phone keypads and copy-paste produce them constantly.
 */
const PERSIAN_DIGITS = /[۰-۹٠-٩]/g;

export function toEnglishDigits(value: string): string {
  return value.replace(PERSIAN_DIGITS, (digit) => {
    const persian = "۰۱۲۳۴۵۶۷۸۹".indexOf(digit);
    if (persian >= 0) return String(persian);
    return String("٠١٢٣٤٥٦٧٨٩".indexOf(digit));
  });
}

export const signInSchema = z.object({
  username: z
    .string()
    .transform((value) => toEnglishDigits(value).replace(/[\s-]/g, ""))
    .pipe(
      z
        .string()
        .regex(/^09\d{9}$/, "شماره همراه باید ۱۱ رقم و با ۰۹ شروع شود"),
    ),
  password: z.string().min(1, "رمز عبور را وارد کنید"),
});

export type SignInValues = z.input<typeof signInSchema>;
export type SignInModel = z.output<typeof signInSchema>;
