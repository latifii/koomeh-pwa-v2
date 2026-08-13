import { PropertyCard } from "@/components/features/property/property-card";
import type { Listing } from "@/data/search";

export function PanelPropertyGrid({ listings }: { listings: Listing[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {listings.map((listing) => <PropertyCard key={listing.id} estate={listing} />)}
    </div>
  );
}

