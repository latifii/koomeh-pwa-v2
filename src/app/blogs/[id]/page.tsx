import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/layout/container";
import { ListSkeleton } from "@/components/shared/list-skeleton";
import { routes } from "@/lib/routes";

import { getCachedBlogCategories } from "@/app/articles/_cache/blog.cache";
import { BlogIntro } from "@/app/articles/_components/blog-intro";
import { BlogListServer } from "@/app/articles/_components/blog-list-server";
import { mapBlogCategories } from "@/app/articles/_mappers/blog.mapper";

export const revalidate = 900;

type Params = { id: string };

/**
 * One category of the magazine — the old site's `/blogs/{id}`, kept at the
 * same address for what is indexed. `/blogs/3` is «مجله املاک», the list the
 * home page and the menus point at; `/blogs/4` is «مجله حقوقی».
 */
async function categoryFrom(params: Params) {
  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) return null;
  const categories = mapBlogCategories(await getCachedBlogCategories());
  return categories.find((category) => category.id === id) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const category = await categoryFrom(await params);
  if (!category) return { title: "مجله کومه" };

  return {
    alternates: { canonical: routes.articlesCategory(category.id) },
    title: `${category.name} | مجله کومه`,
    description: `مطالب ${category.name} گروه املاک کومه؛ راهنما و نکات کاربردی درباره خرید، فروش و اجاره ملک در قم.`,
  };
}

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const category = await categoryFrom(await params);
  if (!category) notFound();

  return (
    <div className="pb-16">
      <BlogIntro category={category} />

      <Container>
        <Suspense fallback={<ListSkeleton count={9} />}>
          <BlogListServer categoryId={category.id} />
        </Suspense>
      </Container>
    </div>
  );
}
