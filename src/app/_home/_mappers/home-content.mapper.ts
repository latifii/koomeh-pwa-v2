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
import { mapBlogImage } from "@/app/articles/_mappers/blog.mapper";
import { toAbsoluteMediaUrl } from "@/lib/api/config";
import { routes, slugFromApiUrl } from "@/lib/routes";

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
      slug: slugFromApiUrl(article.url),
      title: article.title.trim(),
      excerpt: article.summary.trim(),
      category:
        articleCategoryLabels[article.category_id] ?? "مجله املاک",
      publishedAtLabel: article.publish_date,
      image: mapBlogImage(article.image),
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
      slug: slugFromApiUrl(article.url),
      name: article.title.trim(),
      description: article.summary.trim(),
      image: mapBlogImage(article.image),
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
      coverImage: branchCoverUrl(branch.cover_image),
    })),
  };
}

/**
 * Branch photos live on the main host, but the API built their URLs on the
 * legacy file host meant for old estate photos, where they 404 — every
 * branch card showed the placeholder. The backend is fixed; this keeps the
 * cards right on a server that has not picked that up yet, and is a no-op
 * once it has.
 */
function branchCoverUrl(value: string | null): string | undefined {
  const url = toAbsoluteMediaUrl(value);
  return url?.replace(
    /^https?:\/\/file\.koomeh\.ir\/upload\/images\/branch\//,
    "https://koomeh.ir/upload/images/branch/",
  );
}
