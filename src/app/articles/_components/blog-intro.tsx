import { BookOpen, Scale } from "lucide-react";

import { PageIntro } from "@/components/shared/page-intro";
import { routes } from "@/lib/routes";

/**
 * Rendered by both the page and its `loading.tsx`, so the two cannot drift.
 * With a `category` it is that category's own heading — «مجله حقوقی» reads
 * as a legal magazine, not as the property magazine with a filter on.
 */
export function BlogIntro({
  category,
}: {
  category?: { id: number; name: string };
}) {
  if (!category) {
    return (
      <PageIntro
        crumbs={[{ label: "خانه", href: routes.home }, { label: "مجله" }]}
        icon={<BookOpen className="size-4" />}
        eyebrow="دانش بازار ملک"
        title="مجله کومه"
        description="پیش از هر تصمیمی درباره خرید، فروش یا اجاره ملک در قم، بازار را از زبان کارشناسان ما بخوانید."
      />
    );
  }

  const isLegal = category.id === LEGAL_CATEGORY_ID;
  return (
    <PageIntro
      crumbs={[
        { label: "خانه", href: routes.home },
        { label: "مجله", href: routes.articles },
        { label: category.name },
      ]}
      icon={
        isLegal ? <Scale className="size-4" /> : <BookOpen className="size-4" />
      }
      eyebrow={isLegal ? "قانون و قرارداد" : "دانش بازار ملک"}
      title={category.name}
      description={
        isLegal
          ? "نکات حقوقی خرید، فروش و اجاره — از قولنامه تا سند — به زبان ساده."
          : "پیش از هر تصمیمی درباره خرید، فروش یا اجاره ملک در قم، بازار را از زبان کارشناسان ما بخوانید."
      }
    />
  );
}

/** «مجله حقوقی» on the old site — the one category with its own voice. */
const LEGAL_CATEGORY_ID = 4;
