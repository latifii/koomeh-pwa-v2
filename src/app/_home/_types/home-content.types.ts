import type { AreaGuide, Article, Branch } from "@/data/home";

interface HomeContentSection<TKey extends string, TItem> {
  key: TKey;
  eyebrow: string;
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  total: number;
  items: TItem[];
}

export type HomeBlogArticlesSection = HomeContentSection<
  "latest_blog_articles",
  Article
>;

export type HomeNeighborhoodGuidesSection = HomeContentSection<
  "neighborhood_guide_articles",
  AreaGuide
>;

export type HomeBranchesSection = HomeContentSection<"city_branches", Branch>;
