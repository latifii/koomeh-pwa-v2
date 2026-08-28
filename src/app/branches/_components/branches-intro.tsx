import { PageIntro } from "@/components/shared/page-intro";
import { routes } from "@/lib/routes";

/** Rendered by both the page and its `loading.tsx`, so the two cannot drift. */
export function BranchesIntro() {
  return (
    <PageIntro
      crumbs={[{ label: "خانه", href: routes.home }, { label: "شعب کومه" }]}
      eyebrow="نزدیک‌ترین دفتر به شما"
      title="شعب املاک کومه"
      description="برای مشاوره حضوری، بررسی فایل‌ها و هماهنگی بازدید می‌توانید با نزدیک‌ترین شعبه در تماس باشید."
    />
  );
}
