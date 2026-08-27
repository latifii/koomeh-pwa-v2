"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

import type { Listing } from "@/data/search";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/lib/routes";

const subscribe = () => () => {};

/**
 * The first page of results as plain, server-rendered links.
 *
 * `/properties` is the site's main search page, and on the server it always
 * renders the phone layout — `useMediaQuery` has no viewport to read, so it
 * answers `false`. That layout keeps its results inside a Drawer, which is a
 * portal and never renders on the server, so the HTML reached crawlers with no
 * link to a single listing on it.
 *
 * This is the same content the visitor sees, not a hidden copy: it is present
 * only until React hydrates, at which point the interactive view takes over and
 * this unmounts. A no-JS visitor keeps it and can still browse.
 */
export function SearchResultsFallback({ results }: { results: Listing[] }) {
  // `true` on the server and through hydration, `false` once the app is live.
  const isServerRender = useSyncExternalStore(
    subscribe,
    () => false,
    () => true,
  );

  if (!isServerRender || results.length === 0) return null;

  return (
    <section className="px-page py-4">
      <Typography as="h2" variant="h4" className="mb-3">
        نتایج جست‌وجو
      </Typography>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((listing) => (
          <li key={listing.id} className="rounded-xl border bg-card p-3">
            <Link
              href={listing.href ?? routes.property(listing.id)}
              className="font-medium hover:text-brand"
            >
              {listing.title}
            </Link>
            <Typography variant="small" className="mt-1 text-muted-foreground">
              {listing.locationLabel ??
                [listing.district, listing.city].filter(Boolean).join("، ")}
            </Typography>
            <Typography variant="small" className="mt-1">
              {listing.dealType === "rent"
                ? [listing.deposit, listing.monthlyRent]
                    .filter(Boolean)
                    .join(" · ")
                : listing.price}
            </Typography>
          </li>
        ))}
      </ul>
    </section>
  );
}
