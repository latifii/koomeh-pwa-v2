import Link from "next/link";
import { Map } from "lucide-react";

import { Button } from "@/components/ui/button";

export function MapCtaSection() {
  return (
    <section id="map-search" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-16 sm:py-16">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] opacity-[0.05] [background-size:22px_22px]"
        />
        <div
          aria-hidden
          className="absolute -end-16 -bottom-16 size-64 rounded-full bg-secondary/20 blur-3xl"
        />

        <div className="relative flex flex-col items-center gap-4">
          <span className="flex size-12 items-center justify-center rounded-full bg-white/10">
            <Map className="size-6 text-secondary" />
          </span>
          <span className="text-sm font-medium text-secondary">
            جستجو بر اساس موقعیت
          </span>
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">
            جستجوی دقیق در نقشه
          </h2>
          <p className="max-w-md text-sm text-primary-foreground/70">
            ملک‌های اطراف محله موردنظر خود را روی نقشه پیدا کنید.
          </p>
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
    </section>
  );
}
