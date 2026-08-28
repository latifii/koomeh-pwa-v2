import { BookOpen } from "lucide-react";

import { PageIntro } from "@/components/shared/page-intro";
import { routes } from "@/lib/routes";

/** Rendered by both the page and its `loading.tsx`, so the two cannot drift. */
export function BlogIntro() {
  return (
    <PageIntro
      crumbs={[{ label: "خانه", href: routes.home }, { label: "مجله املاک" }]}
      icon={<BookOpen className="size-4" />}
      eyebrow="دانش بازار ملک"
      title="مجله املاک کومه"
      description="پیش از هر تصمیمی درباره خرید، فروش یا اجاره ملک در قم، بازار را از زبان کارشناسان ما بخوانید."
    />
  );
}
