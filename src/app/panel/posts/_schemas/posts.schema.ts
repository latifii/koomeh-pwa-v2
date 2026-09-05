import { z } from "zod";

import { metaSchema, optionSchema } from "@/app/panel/_admin/_schemas/admin-lists.schema";

export const postRowSchema = z.object({
  id: z.number().int(),
  title: z.string().default(""),
  description: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  lang: z.string().nullable().optional(),
  active: z.boolean().default(false),
  /** Shown only to agents, not to the public magazine. */
  access_expert: z.boolean().default(false),
  category_id: z.number().int().nullable().optional(),
  link_rewrite: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  video: z.string().nullable().optional(),
  visit: z.number().int().default(0),
  expire_at: z.string().nullable().optional(),
  created_at: z.string().default(""),
  created_at_jalali: z.string().default(""),
});

/** The single-post call adds the article body and its tags. */
export const postDetailSchema = postRowSchema.extend({
  body: z.string().nullable().optional(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  tags: z.array(z.union([z.string(), z.object({ name: z.string() })])).default([]),
});

export const postsResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    items: z.array(postRowSchema).default([]),
    meta: metaSchema,
    categories: z.array(optionSchema).default([]),
  }),
});

export const postResponseSchema = z.object({
  status: z.literal("success"),
  result: postDetailSchema,
});

export const postSavedResponseSchema = z
  .object({ status: z.string() })
  .passthrough();

export type PostRow = z.infer<typeof postRowSchema>;
export type PostDetail = z.infer<typeof postDetailSchema>;

export type PostFilters = {
  title: string;
  category_id: string;
  active: string;
  type: string;
};

export const defaultPostFilters: PostFilters = {
  title: "",
  category_id: "",
  active: "",
  type: "",
};

/* --------------------------------------------------------------------- form */

export const postFormSchema = z.object({
  title: z.string().trim().min(1, "عنوان را وارد کنید").max(190, "عنوان طولانی است"),
  description: z.string().trim().max(1000, "چکیده طولانی است"),
  body: z.string(),
  category_id: z.string(),
  type: z.string(),
  lang: z.string(),
  link_rewrite: z.string().trim().max(190),
  meta_title: z.string().trim().max(190),
  meta_description: z.string().trim().max(300),
  /** Jalali `Y/m/d`, blank for "never". */
  expire_at: z.string().trim(),
  video: z.string().trim().max(500),
  tags: z.string().trim().max(300),
  active: z.boolean(),
  access_expert: z.boolean(),
});

export type PostFormValues = z.infer<typeof postFormSchema>;
