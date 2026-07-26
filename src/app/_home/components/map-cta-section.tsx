import Link from "next/link";
import { Map } from "lucide-react";

import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

export function MapCtaSection() {
  return (
    <Section id="map-search">
      <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-16 sm:py-16">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--color-white)_1px,transparent_0)] opacity-[0.05] [background-size:22px_22px]"
        />
        <div
          aria-hidden
          className="absolute -end-16 -bottom-16 size-64 rounded-full bg-secondary/20 blur-3xl"
        />

        <div className="relative flex flex-col items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-full bg-white/10">
            <Map className="size-6 text-secondary" />
          </span>
          <Typography variant="eyebrow" light>
            جستجو بر اساس موقعیت
          </Typography>
          <Typography variant="h2" light>
            جستجوی دقیق در نقشه
          </Typography>
          <Typography variant="muted" light className="max-w-md">
            ملک‌های اطراف محله موردنظر خود را روی نقشه پیدا کنید.
          </Typography>
          <Button
            variant="secondary"
            size="lg"
            className="mt-2"
            nativeButton={false}
            render={<Link href="/c/qom" />}
          >
            <Map />
            باز کردن نقشه
          </Button>
        </div>
      </div>
    </Section>
  );
}
