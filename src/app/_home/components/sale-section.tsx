import { Home } from "lucide-react";

import type { Estate } from "@/data/home";

import { PropertyCard } from "./property-card";
import { SectionHeader } from "./section-header";

export function SaleSection({ estates }: { estates: Estate[] }) {
  return (
    <section
      id="sale-estates"
      className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6"
    >
      <SectionHeader
        eyebrow="تازه‌ترین فایل‌ها"
        title="املاک خرید و فروش"
        description="گزینه‌های جدید بازار قم را سریع مقایسه کنید."
        href="/c/qom?type=1"
        className="mb-8"
      />

      {estates.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {estates.map((estate) => (
            <PropertyCard key={estate.id} estate={estate} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center">
          <Home className="size-8 text-muted-foreground" />
          <h3 className="font-heading text-base font-semibold">
            فایل جدیدی پیدا نشد
          </h3>
          <p className="text-sm text-muted-foreground">
            کمی بعد دوباره بررسی کنید یا درخواست خود را ثبت کنید.
          </p>
        </div>
      )}
    </section>
  );
}
