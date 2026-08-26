import type {
  BlogCategoriesResponse,
  BlogPostCardDto,
  BlogPostResponse,
} from "@/app/articles/_schemas/blog.schema";
import type {
  BlogArticleDetail,
  BlogArticleCard,
  BlogCategory,
} from "@/app/articles/_types/blog.types";
import { toAbsoluteMediaUrl, toAbsoluteSiteUrl } from "@/lib/api/config";
import { routes } from "@/lib/routes";

export function mapBlogCategories(
  response: BlogCategoriesResponse,
): BlogCategory[] {
  return response.result.items.map((category) => ({
    id: category.id,
    name: category.name.trim(),
    postCount: category.post_count,
    isArea: category.is_area,
  }));
}

function articleHref(post: BlogPostCardDto): string {
  if (/^\/(?:area|city)\//.test(post.url)) {
    return routes.neighborhood(post.id);
  }

  return routes.article(post.id);
}

export function mapBlogImage(value: string | null | undefined): string | undefined {
  if (!value || /\/img\/noimage\.png(?:[?#].*)?$/i.test(value.trim())) {
    return undefined;
  }

  const image = toAbsoluteMediaUrl(value);
  return image && /\/img\/noimage\.png(?:[?#].*)?$/i.test(image)
    ? undefined
    : image;
}

export function mapBlogPostCard(post: BlogPostCardDto): BlogArticleCard {
  return {
    id: String(post.id),
    numericId: post.id,
    title: post.title.trim(),
    excerpt: post.summary?.trim() ?? "",
    image: mapBlogImage(post.image),
    category: post.category
      ? { id: post.category.id, name: post.category.name.trim() }
      : undefined,
    views: post.visit,
    publishedAtLabel: post.publish_date,
    createdAt: post.created_at,
    href: articleHref(post),
  };
}

export function mapBlogPostDetail(
  response: BlogPostResponse,
): BlogArticleDetail {
  const post = response.result;
  const card = mapBlogPostCard(post);

  return {
    ...card,
    body: post.body?.trim() || undefined,
    isArea: post.is_area,
    seo: {
      title: post.seo?.meta_title?.trim() || undefined,
      description: post.seo?.meta_description?.trim() || undefined,
      canonical: toAbsoluteSiteUrl(post.seo?.canonical ?? null),
    },
    tags: post.tags.map((tag) => ({
      id: tag.id,
      name: tag.name.trim(),
    })),
    related: post.related.map(mapBlogPostCard),
  };
}
