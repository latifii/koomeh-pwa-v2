import type {
  CityBranchesResponse,
  LatestBlogArticlesResponse,
  NeighborhoodGuideArticlesResponse,
} from "@/app/_home/_schemas/home-content.schema";
import type {
  HomeBlogArticlesSection,
  HomeBranchesSection,
  HomeNeighborhoodGuidesSection,
} from "@/app/_home/_types/home-content.types";
import { toAbsoluteMediaUrl } from "@/lib/api/config";
import { routes } from "@/lib/routes";

const articleCategoryLabels: Record<number, string> = {
  3: "مجله املاک",
  9: "راهنمای محله",
  10: "راهنمای شهر",
};

export function mapLatestBlogArticles(
  response: LatestBlogArticlesResponse,
): HomeBlogArticlesSection {
  const section = response.result;
  return {
    key: section.key,
    eyebrow: section.eyebrow,
    title: section.title,
    subtitle: section.subtitle ?? undefined,
    viewAllHref: routes.articles,
    total: section.total,
    items: section.items.map((article) => ({
      id: String(article.id),
      title: article.title.trim(),
      excerpt: article.summary.trim(),
      category:
        articleCategoryLabels[article.category_id] ?? "مجله املاک",
      publishedAtLabel: article.publish_date,
      image: toAbsoluteMediaUrl(article.image),
    })),
  };
}

export function mapNeighborhoodGuideArticles(
  response: NeighborhoodGuideArticlesResponse,
): HomeNeighborhoodGuidesSection {
  const section = response.result;
  return {
    key: section.key,
    eyebrow: section.eyebrow,
    title: section.title,
    subtitle: section.subtitle ?? undefined,
    viewAllHref: routes.neighborhoods,
    total: section.total,
    items: section.items.map((article) => ({
      id: String(article.id),
      name: article.title.trim(),
      description: article.summary.trim(),
      image: toAbsoluteMediaUrl(article.image),
    })),
  };
}

export function mapCityBranches(
  response: CityBranchesResponse,
): HomeBranchesSection {
  const section = response.result;
  return {
    key: section.key,
    eyebrow: section.eyebrow,
    title: section.title,
    subtitle: section.subtitle ?? undefined,
    viewAllHref: section.view_all_url ? routes.branches : undefined,
    total: section.total,
    items: section.items.map((branch) => ({
      id: String(branch.id),
      name: branch.name.trim(),
      address: branch.address.trim(),
      phone: branch.phone,
      coverImage: toAbsoluteMediaUrl(branch.cover_image),
    })),
  };
}
