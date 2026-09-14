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
/**
 * `/api/verify-mobile` — step one of the two-step sign-in. Says which step
 * two follows: 1 = the password, 2 = a code that has just been texted.
 */
export const verifyMobileResponseSchema = z.object({
  status: z.boolean(),
  login_type: z.union([z.literal(1), z.literal(2)]),
  register: z.coerce.number().int().default(0),
  forget_status: z.coerce.number().int().default(0),
  has_password: z.coerce.number().int().default(0),
  message: z.string().optional(),
});

/** `/api/verify-code` — step two; the token pair plus the change-password flag. */
export const verifyCodeResponseSchema = tokenPairSchema.extend({
  login_type: z.union([z.literal(1), z.literal(2)]).optional(),
  has_password: z.coerce.number().int().optional(),
  must_change_password: z.boolean().default(false),
  message: z.string().optional(),
});

export type TokenPairDto = z.infer<typeof tokenPairSchema>;
export type VerifyMobileDto = z.infer<typeof verifyMobileResponseSchema>;
export type VerifyCodeDto = z.infer<typeof verifyCodeResponseSchema>;
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
      z.string().regex(/^09\d{9}$/, "شماره همراه باید ۱۱ رقم و با ۰۹ شروع شود"),
    ),
  password: z.string().min(1, "رمز عبور را وارد کنید"),
});

export type SignInValues = z.input<typeof signInSchema>;
export type SignInModel = z.output<typeof signInSchema>;

/** The mobile alone — step one of the two-step flow. */
export const mobileSchema = signInSchema.pick({ username: true });
export type MobileValues = z.input<typeof mobileSchema>;

/** Step two: the number that step one confirmed, and the password or code. */
export const verifyStepSchema = z.object({
  mobile: z.string().regex(/^09\d{9}$/),
  code: z
    .string()
    .transform((value) => toEnglishDigits(value).trim())
    .pipe(z.string().min(1, "این فیلد را پر کنید")),
  loginType: z.union([z.literal(1), z.literal(2)]),
  forgetPass: z.boolean().default(false),
});
export type VerifyStepValues = z.input<typeof verifyStepSchema>;
