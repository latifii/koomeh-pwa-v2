import { z } from "zod";

export const blogCategorySchema = z.object({
  id: z.number().int(),
  name: z.string(),
});

export const blogPostCardSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  summary: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  video: z.string().nullable().optional(),
  category: blogCategorySchema.nullable().optional(),
  category_id: z.number().int().nullable().optional(),
  visit: z.number().int().nonnegative().default(0),
  publish_date: z.string(),
  created_at: z.string(),
  url: z.string(),
});

export const blogCategoriesResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    total: z.number().int().nonnegative(),
    items: z.array(
      blogCategorySchema.extend({
        post_count: z.number().int().nonnegative(),
        url: z.string(),
        is_area: z.boolean(),
      }),
    ),
  }),
});

export const blogPostsResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    per_page: z.number().int().positive(),
    last_page: z.number().int().nonnegative(),
    has_more: z.boolean(),
    sort: z.object({
      by: z.number().int(),
      label: z.string(),
    }),
    category: blogCategorySchema.nullable().optional(),
    items: z.array(blogPostCardSchema),
  }),
});

export const blogPostResponseSchema = z.object({
  status: z.literal("success"),
  result: blogPostCardSchema.extend({
    body: z.string().nullable().optional(),
    is_area: z.boolean(),
    seo: z
      .object({
        meta_title: z.string().nullable().optional(),
        meta_description: z.string().nullable().optional(),
        canonical: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
    tags: z.array(
      z.object({
        id: z.number().int(),
        name: z.string(),
      }),
    ).default([]),
    related: z.array(blogPostCardSchema).default([]),
    links: z.record(z.string(), z.unknown()).nullable().optional(),
  }),
});

export type BlogPostCardDto = z.infer<typeof blogPostCardSchema>;
export type BlogCategoriesResponse = z.infer<
  typeof blogCategoriesResponseSchema
>;
export type BlogPostsResponse = z.infer<typeof blogPostsResponseSchema>;
export type BlogPostResponse = z.infer<typeof blogPostResponseSchema>;
