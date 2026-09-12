import { z } from "zod";

import { toEnglishDigits } from "@/app/auth/_schemas/auth.schema";

const placeSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  count: z.number().int().nonnegative().optional(),
});

/**
 * The live response carries about twenty more fields than the spec documents
 * (gender, national_code, social handles, city_districts…). Only what the form
 * edits is typed here; the rest is ignored rather than guessed at.
 */
export const profileResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    id: z.number().int(),
    name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    username: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    photo: z.string().nullable().optional(),
    /** The four the old form had. Handles or links — stored as typed. */
    telegram: z.string().nullable().optional(),
    whatsapp: z.string().nullable().optional(),
    instagram: z.string().nullable().optional(),
    eitaa: z.string().nullable().optional(),
    birthday: z.string().nullable().optional(),
    birthday_jalali: z.string().nullable().optional(),
    /** Held back until an administrator approves it. */
    alias: z
      .object({
        value: z.string().nullable().optional(),
        pending: z.boolean().default(false),
      })
      .nullable()
      .optional(),
    bio: z
      .object({
        value: z.string().nullable().optional(),
        pending_value: z.string().nullable().optional(),
        pending: z.boolean().default(false),
      })
      .nullable()
      .optional(),
    activity_estate_type: z.array(z.number().int()).default([]),
    /** The districts this user works in, most-weighted first. */
    districts: z.array(placeSchema).default([]),
    /** Every district of the user's city — the options for the field above. */
    city_districts: z.array(placeSchema).default([]),
    is_expert: z.boolean().default(false),
  }),
});

export const updateProfileResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    message: z.string().nullable().optional(),
    pending: z.array(z.string()).default([]),
  }),
});

export const preferencesResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    typeprice: z.string().nullable().optional(),
    typearea: z.string().nullable().optional(),
    persisted: z.boolean().optional(),
  }),
});

export const profilePhotoResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    photo: z.string(),
    pending: z.boolean().optional(),
    message: z.string().nullable().optional(),
  }),
});

export const changePasswordResponseSchema = z.object({
  status: z.literal("success"),
  result: z.record(z.string(), z.unknown()).nullable().optional(),
});

/* ------------------------------------------------------------------- forms */

const optionalEmail = z
  .string()
  .trim()
  .refine((value) => value === "" || z.email().safeParse(value).success, {
    message: "ایمیل معتبر نیست",
  });

const optionalMobile = z
  .string()
  .transform((value) => toEnglishDigits(value).replace(/[\s-]/g, ""))
  .refine((value) => value === "" || /^09\d{9}$/.test(value), {
    message: "شماره همراه باید ۱۱ رقم و با ۰۹ شروع شود",
  });

/** A handle with or without the @, or a full link — either is fine to store. */
const socialHandle = z
  .string()
  .trim()
  .max(120, "بیش از حد طولانی است")
  .transform((value) => value.replace(/^@/, ""));

export const profileFormSchema = z.object({
  name: z.string().trim().max(60, "نام طولانی است"),
  last_name: z.string().trim().max(60, "نام خانوادگی طولانی است"),
  email: optionalEmail,
  phone: optionalMobile,
  /** Jalali `Y/m/d`, or empty. */
  birthday: z.string().trim(),
  alias: z.string().trim().max(60, "نام مستعار طولانی است"),
  bio: z.string().trim().max(1000, "معرفی نباید بیش از ۱۰۰۰ کاراکتر باشد"),
  telegram: socialHandle,
  whatsapp: socialHandle,
  instagram: socialHandle,
  eitaa: socialHandle,
});

/** The API asks for at least six characters and a matching confirmation. */
export const changePasswordFormSchema = z
  .object({
    password: z.string().min(6, "رمز عبور باید دست‌کم ۶ نویسه باشد"),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ["password_confirmation"],
    message: "تکرار رمز عبور یکسان نیست",
  });

export type ProfileResponse = z.infer<typeof profileResponseSchema>;
export type PreferencesResponse = z.infer<typeof preferencesResponseSchema>;
export type ProfileFormValues = z.infer<typeof profileFormSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordFormSchema>;
