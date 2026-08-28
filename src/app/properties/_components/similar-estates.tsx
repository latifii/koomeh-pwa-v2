import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import type { EstateSimilarView } from "@/app/properties/_types/estate-detail.types";
import { PropertyCard } from "@/components/features/property/property-card";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/lib/routes";

/**
 * A scroll rail on phones and a grid from `sm` up — the same pattern the
 * homepage uses for its listing rows, so the page ends on familiar ground.
 */
export function SimilarEstates({
  similar,
  viewAllHref = routes.properties(),
}: {
  similar: EstateSimilarView;
  viewAllHref?: string;
}) {
  if (similar.items.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <Typography variant="h3" as="h2" className="text-lg font-bold sm:text-lg">
            {similar.title}
          </Typography>
          {similar.total > 0 && (
            <Typography variant="small" className="mt-0.5">
              {similar.total.toLocaleString("fa-IR")} فایل نزدیک به این ملک
            </Typography>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-brand"
          nativeButton={false}
          render={<Link href={viewAllHref} />}
        >
          همه فایل‌ها
          <ArrowLeft data-icon="inline-end" />
        </Button>
      </div>

      <div className="-mx-page flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden px-page pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
        {similar.items.map((listing) => (
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
