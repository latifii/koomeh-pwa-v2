import Link from "next/link";
import { ArrowLeft, Landmark } from "lucide-react";

import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

import { CoverPlaceholder } from "./cover-placeholder";

export function StorySection() {
  return (
    <Section>
      <div className="grid items-center gap-8 overflow-hidden rounded-3xl border bg-card lg:grid-cols-2">
        <div className="relative">
          <CoverPlaceholder
            icon={Landmark}
            tone="muted"
            className="aspect-4/3 w-full lg:aspect-auto lg:h-full"
            iconClassName="text-primary/50 dark:text-primary/40"
          />
          <span className="absolute bottom-4 inset-s-4 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm">
            ریشه‌دار در قم
          </span>
        </div>

        <div className="flex flex-col gap-4 p-6 sm:p-10">
          <Typography variant="eyebrow">کومه یعنی چه؟</Typography>
          <Typography variant="h2">نامی از دل تاریخ قم</Typography>
          <Typography variant="muted">
            <strong className="text-foreground">کومه</strong> به معنی اتاقک
            کلبه‌مانندی است که در کنار مراتع و مزارع برای استراحت ساخته
            می‌شود.
          </Typography>
          <Typography variant="muted">
            در گذشته در محدوده فعلی شهر قم، به دلیل آبگیر بودن منطقه
            علف‌زارها و گیاهان فراوانی رشد می‌کرد و محل مناسبی برای چَرا دادن
            گوسفندان بود و چوپانان در این منطقه کومه‌های متعددی بنا کرده
            بودند.
          </Typography>
          <Typography variant="muted">
            ریشه نام شهر قم با الهام از واژه{" "}
            <strong className="text-foreground">کومه</strong> (به دلیل تراکم
            کومه‌ها) به نام کُم خوانده شد و سپس معرب گردید و به قم تغییر یافت.
          </Typography>

          <Button
            variant="outline"
            className="mt-2 w-fit"
            nativeButton={false}
            render={<Link href="/blog/346" />}
          >
            داستان کامل کومه
            <ArrowLeft className="size-4" />
          </Button>
        </div>
      </div>
    </Section>
  );
}
