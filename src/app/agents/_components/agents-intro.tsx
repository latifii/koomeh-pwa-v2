import { Users } from "lucide-react";

import { PageIntro } from "@/components/shared/page-intro";
import { routes } from "@/lib/routes";

/** Rendered by both the page and its `loading.tsx`, so the two cannot drift. */
export function AgentsIntro() {
  return (
    <PageIntro
      crumbs={[{ label: "خانه", href: routes.home }, { label: "کارشناسان" }]}
      icon={<Users className="size-4" />}
      eyebrow="تیم حرفه‌ای کومه"
      title="کارشناسان املاک کومه"
      description="بر اساس تخصص، نوع فعالیت و امتیاز، مشاور مناسب خرید، فروش یا اجاره ملک خود را در قم پیدا کنید."
    />
  );
}
