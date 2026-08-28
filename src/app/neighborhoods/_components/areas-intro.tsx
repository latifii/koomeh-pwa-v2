import { MapPinned } from "lucide-react";

import { PageIntro } from "@/components/shared/page-intro";
import { routes } from "@/lib/routes";

/** Rendered by both the page and its `loading.tsx`, so the two cannot drift. */
export function AreasIntro() {
  return (
    <PageIntro
      crumbs={[{ label: "خانه", href: routes.home }, { label: "محلات" }]}
      icon={<MapPinned className="size-4" />}
      eyebrow="قم را بهتر بشناسید"
      title="محلات قم"
      description="پیش از انتخاب محله برای زندگی یا سرمایه‌گذاری، میانگین قیمت، تعداد فایل فعال و ویژگی‌های هر محله را مرور کنید."
    />
  );
}
