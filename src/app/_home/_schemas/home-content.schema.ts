import { z } from "zod";

const articleItemSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  summary: z.string(),
  image: z.string(),
  url: z.string(),
  category_id: z.number().int(),
  publish_date: z.string(),
  created_at: z.string(),
});

const articleSectionSchema = z.object({
  eyebrow: z.string(),
  title: z.string(),
  subtitle: z.string().nullable(),
  view_all_url: z.string(),
  total: z.number().int().nonnegative(),
  items: z.array(articleItemSchema),
});

export const latestBlogArticlesResponseSchema = z.object({
  status: z.literal("success"),
  result: articleSectionSchema.extend({
    key: z.literal("latest_blog_articles"),
  }),
});

export const neighborhoodGuideArticlesResponseSchema = z.object({
  status: z.literal("success"),
  result: articleSectionSchema.extend({
    key: z.literal("neighborhood_guide_articles"),
  }),
});

export const cityBranchesResponseSchema = z.object({
  status: z.literal("success"),
  result: z.object({
    key: z.literal("city_branches"),
    eyebrow: z.string(),
    title: z.string(),
    subtitle: z.string().nullable(),
    view_all_url: z.string().nullable(),
    total: z.number().int().nonnegative(),
    items: z.array(
      z.object({
        id: z.number().int(),
        name: z.string(),
        phone: z.string(),
        address: z.string(),
        latitude: z.string(),
        longitude: z.string(),
        cover_image: z.string(),
        url: z.string(),
      }),
    ),
  }),
});

export type LatestBlogArticlesResponse = z.infer<
  typeof latestBlogArticlesResponseSchema
>;
export type NeighborhoodGuideArticlesResponse = z.infer<
  typeof neighborhoodGuideArticlesResponseSchema
>;
export type CityBranchesResponse = z.infer<typeof cityBranchesResponseSchema>;
