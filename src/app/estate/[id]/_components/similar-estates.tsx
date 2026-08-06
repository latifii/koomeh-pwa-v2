import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PropertyCard } from "@/components/property/property-card";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/data/search";

/**
 * A scroll rail on phones and a grid from `sm` up — the same pattern the
 * homepage uses for its listing rows, so the page ends on familiar ground.
 */
export function SimilarEstates({
  listings,
  city,
}: {
  listings: Listing[];
  city: string;
}) {
  if (listings.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-bold">ملک‌های مشابه</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            فایل‌هایی با متراژ و موقعیت نزدیک به این ملک
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-brand"
          nativeButton={false}
          render={<Link href={`/search/${city}`} />}
        >
          همه فایل‌ها
          <ArrowLeft data-icon="inline-end" />
        </Button>
      </div>

      <div className="-mx-page flex snap-x snap-mandatory gap-3 overflow-x-auto px-page pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
        {listings.map((listing) => (
          <PropertyCard
            key={listing.id}
            estate={listing}
            className="w-[70vw] shrink-0 snap-start sm:w-auto"
          />
        ))}
      </div>
    </section>
  );
}
