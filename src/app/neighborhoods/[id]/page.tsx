import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  Handshake,
  Home,
  MapPin,
  MapPinned,
  Navigation,
  Search,
  TrendingUp,
} from "lucide-react";

import { getCachedNeighborhood } from "@/app/neighborhoods/_cache/neighborhoods.cache";
import { mapNeighborhoodDetail } from "@/app/neighborhoods/_mappers/neighborhoods.mapper";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { RichText } from "@/components/shared/rich-text";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { formatToman } from "@/data/search";
import { isApiError } from "@/lib/api/api-error";
import { JsonLd } from "@/components/shared/json-ld";
import { routes } from "@/lib/routes";
import { breadcrumbSchema } from "@/lib/structured-data";

import { AreaEstates } from "./_components/area-estates";
import { AreaMapPanel } from "./_components/area-map-panel";
import { AreaPriceCard } from "./_components/area-price-card";

export const revalidate = 3600;

// Signals that this route can be statically generated; without it Next treats
// every dynamic segment as fully dynamic and never caches the result.
export function generateStaticParams() {
  return [];
}

const getArea = cache(async (id: string) => {
  if (!/^\d+$/.test(id)) notFound();

  try {
    return mapNeighborhoodDetail(await getCachedNeighborhood(id));
  } catch (error) {
    if (isApiError(error) && error.status === 404) notFound();
    throw error;
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const area = await getArea(id);
    const title = area.metaTitle ?? `${area.title} | راهنمای محله`;
    const description = area.metaDescription ?? area.summary;

    return {
      title,
      description,
      alternates: { canonical: routes.neighborhood(area.id) },
      openGraph: {
        type: "article",
        title,
        description,
        url: routes.neighborhood(area.id),
        images: area.image ? [{ url: area.image, alt: area.title }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: area.image ? [area.image] : undefined,
      },
    };
  } catch {
    return { title: "محله یافت نشد | کومه" };
  }
}

export default async function AreaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const area = await getArea(id);

  const perMeter = area.prices.avgApartment ?? area.prices.avgLand;
  const placeName = area.area?.name ?? area.title;

  // Files are listed by district id where the guide has one; otherwise the
  // search page opens unfiltered rather than on a filter that means nothing.
  const searchHref = area.area
    ? routes.properties({ districts: area.area.id })
    : routes.properties();

  const directionsUrl =
    area.hasMap && area.lat !== undefined && area.lng !== undefined
      ? `https://www.google.com/maps/search/?api=1&query=${area.lat},${area.lng}`
      : undefined;

  const stats = [
    {
      icon: Home,
      value: area.counts.all.toLocaleString("fa-IR"),
      label: "فایل فعال",
    },
    {
      icon: Building2,
      value: area.counts.sale.toLocaleString("fa-IR"),
      label: "خرید و فروش",
    },
    {
      icon: Handshake,
      value: area.counts.rent.toLocaleString("fa-IR"),
      label: "رهن و اجاره",
    },
    {
      icon: TrendingUp,
      value: perMeter ? formatToman(perMeter) : "—",
      label: "میانگین هر متر",
    },
  ];

  return (
    <div className="pb-16">
      <JsonLd
        data={breadcrumbSchema([
          { name: "خانه", path: routes.home },
          { name: "محلات", path: routes.neighborhoods },
          { name: area.title, path: routes.neighborhood(area.id) },
        ])}
      />

      <Breadcrumb
        items={[
          { label: "خانه", href: routes.home },
          { label: "محلات", href: routes.neighborhoods },
          { label: area.title },
        ]}
      />

      <Container>
        <section className="relative overflow-hidden rounded-3xl bg-primary p-5 text-primary-foreground sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -end-16 -top-20 size-64 rounded-full bg-white/10 blur-3xl"
          />

          <div className="relative z-10 max-w-2xl">
            <Typography
              as="span"
              variant="small"
              light
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 font-medium backdrop-blur-md"
            >
              <MapPinned className="size-3.5 text-secondary" />
              راهنمای {area.area?.kindLabel ?? "محله"}
              {area.area?.city ? ` · ${area.area.city.name}` : ""}
            </Typography>

            <Typography
              variant="h2"
              as="h1"
              light
              className="mt-3 text-2xl sm:text-3xl"
            >
              {area.title}
            </Typography>

            {area.summary && (
              <Typography
                as="p"
                variant="lead"
                light
                className="mt-3 text-white/75"
              >
                {area.summary}
              </Typography>
            )}

            <div className="mt-5 flex flex-wrap gap-2.5">
              <Button
                size="lg"
                variant="secondary"
                nativeButton={false}
                render={<Link href={searchHref} />}
                className="font-heading"
              >
                <Search data-icon="inline-start" />
                فایل‌های {placeName}
              </Button>

              {directionsUrl && (
                <Button
                  size="lg"
                  nativeButton={false}
                  render={
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                  className="border border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                >
                  <Navigation data-icon="inline-start" />
                  مسیریابی
                </Button>
              )}
            </div>
          </div>
        </section>
      </Container>

      <Container className="mt-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-2xl border bg-card p-3.5"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <stat.icon className="size-5" />
              </span>
              <span className="min-w-0">
                <Typography
                  as="span"
                  variant="h4"
                  className="block text-lg font-bold leading-tight sm:text-lg"
                >
                  {stat.value}
                </Typography>
                <Typography
                  as="span"
                  variant="small"
                  className="block truncate text-[11px]"
                >
                  {stat.label}
                </Typography>
              </span>
            </div>
          ))}
        </div>
      </Container>

      <Container className="mt-5">
        <div className="grid items-start gap-5 lg:grid-cols-3">
          <div className="grid min-w-0 gap-4 lg:col-span-2">
            {area.body && (
              <section className="rounded-2xl border bg-card p-4 sm:p-5">
                <Typography
                  variant="h4"
                  as="h2"
                  className="mb-4 flex items-center gap-2 sm:text-base"
                >
                  <span className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <MapPin className="size-4" />
                  </span>
                  درباره {placeName}
                </Typography>
                <RichText html={area.body} />
              </section>
            )}

            {area.hasMap && (
              <section className="rounded-2xl border bg-card p-4 sm:p-5">
                <Typography
                  variant="h4"
                  as="h2"
                  className="mb-4 flex items-center gap-2 sm:text-base"
                >
                  <span className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <MapPinned className="size-4" />
                  </span>
                  موقعیت روی نقشه
                </Typography>
                <AreaMapPanel lat={area.lat!} lng={area.lng!} />
              </section>
            )}

            <section className="min-w-0">
              <div className="mb-4">
                <Typography variant="h3" as="h2" className="text-lg sm:text-lg">
                  فایل‌های فعال {placeName}
                </Typography>
                <Typography variant="small" className="mt-0.5">
                  ملک‌هایی که هم‌اکنون در این محدوده ثبت شده‌اند
                </Typography>
              </div>
              <AreaEstates postId={area.id} counts={area.counts} />
            </section>
          </div>

          <aside className="grid gap-4 lg:sticky lg:top-20">
            <section className="rounded-2xl border bg-card p-4">
              <Typography
                variant="h4"
                as="h2"
                className="mb-3 flex items-center gap-1.5"
              >
                <TrendingUp className="size-4 text-brand" />
                میانگین قیمت
              </Typography>
              <AreaPriceCard prices={area.prices} />
            </section>

            {area.adjacent.length > 0 && (
              <section className="rounded-2xl border bg-card p-4">
                <Typography
                  variant="h4"
                  as="h2"
                  className="mb-3 flex items-center gap-1.5"
                >
                  <MapPinned className="size-4 text-brand" />
                  محله‌های مجاور
                </Typography>
                <div className="flex flex-wrap gap-2">
                  {area.adjacent.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="rounded-full border bg-muted/50 px-3 py-1.5 text-sm font-medium transition-colors hover:border-brand/40 hover:text-brand"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </Container>
    </div>
  );
}
