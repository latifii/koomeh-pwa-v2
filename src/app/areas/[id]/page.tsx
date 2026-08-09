import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  Calculator,
  ChevronLeft,
  Home,
  Handshake,
  MapPin,
  MapPinned,
  Navigation,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { PropertyCard } from "@/components/features/property/property-card";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import {
  formatToman,
  getAllAreaIds,
  getAreaDetail,
  getAreaListings,
  getOtherAreas,
} from "@/data/area-detail";
import { propertyTypeLabels } from "@/data/home";

import { AreaMapPanel } from "./_components/area-map-panel";
import { AreaPriceCard } from "./_components/area-price-card";

export function generateStaticParams() {
  return getAllAreaIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const area = getAreaDetail(id);

  if (!area) return { title: "محله یافت نشد | کومه" };

  return {
    title: `خرید و اجاره ملک در ${area.name} قم | راهنمای محله`,
    description: `${area.tagline}؛ ${area.description[0]}`,
  };
}

export default async function AreaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const area = getAreaDetail(id);

  if (!area) notFound();

  const listings = getAreaListings(area, 8);
  const otherAreas = getOtherAreas(area.id, 4);
  const perMeter =
    area.stats.avgApartmentPerMeter || area.stats.avgLandPerMeter;

  const searchHref = `/search/qom?district=${encodeURIComponent(area.name)}`;
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${area.lat},${area.lng}`;

  const stats = [
    {
      icon: Home,
      value: area.stats.listingCount.toLocaleString("fa-IR"),
      label: "فایل فعال",
    },
    {
      icon: TrendingUp,
      value: area.stats.saleCount.toLocaleString("fa-IR"),
      label: "فروش",
    },
    {
      icon: Handshake,
      value: area.stats.rentCount.toLocaleString("fa-IR"),
      label: "رهن و اجاره",
    },
    {
      icon: Calculator,
      value: perMeter ? formatToman(perMeter) : "—",
      label: "میانگین متری",
    },
  ];

  return (
    <div className="pb-16">
      <Container className="py-3">
        <nav
          aria-label="مسیر صفحه"
          className="flex items-center gap-1 overflow-x-auto text-xs text-muted-foreground [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <Link href="/" className="shrink-0 hover:text-brand">
            خانه
          </Link>
          <ChevronLeft className="size-3.5 shrink-0" />
          <Link href="/areas" className="shrink-0 hover:text-brand">
            محلات
          </Link>
          <ChevronLeft className="size-3.5 shrink-0" />
          <Typography
            as="span"
            variant="small"
            className="shrink-0 font-medium text-foreground"
          >
            {area.name}
          </Typography>
        </nav>
      </Container>

      {/* Hero band */}
      <Container>
        <section className="relative overflow-hidden rounded-3xl bg-primary p-5 text-primary-foreground sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 inset-e-[-4rem] size-80 rounded-full bg-secondary/15 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-28 inset-s-[-6rem] size-80 rounded-full bg-white/5 blur-[120px]"
          />

          <div className="relative z-10 max-w-2xl">
            <Typography
              as="span"
              variant="small"
              light
              className="flex w-fit items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium backdrop-blur-md"
            >
              <MapPinned className="size-3.5 text-secondary" />
              راهنمای محله در قم
            </Typography>

            <Typography variant="h2" as="h1" light className="mt-3 text-2xl sm:text-3xl">
              {area.name}
            </Typography>
            <Typography as="p" variant="lead" light className="mt-1 text-white/80">
              {area.tagline}
            </Typography>

            <div className="mt-3 flex flex-wrap gap-2">
              {area.highlights.map((highlight) => (
                <Typography
                  as="span"
                  variant="small"
                  light
                  key={highlight}
                  className="rounded-full border border-white/15 bg-white/10 px-2.5 py-0.5 text-[11px] text-white/85 backdrop-blur-md"
                >
                  {highlight}
                </Typography>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <Button
                size="lg"
                variant="secondary"
                nativeButton={false}
                render={<Link href={searchHref} />}
                className="font-heading"
              >
                <Search data-icon="inline-start" />
                فایل‌های {area.name}
              </Button>
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
            </div>
          </div>
        </section>
      </Container>

      {/* Stats strip */}
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
            {/* About */}
            <section className="rounded-2xl border bg-card p-4 sm:p-5">
              <Typography
                variant="h4"
                as="h2"
                className="mb-4 flex items-center gap-2 sm:text-base"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <MapPin className="size-4" />
                </span>
                درباره محله {area.name}
              </Typography>
              <div className="space-y-3">
                {area.description.map((paragraph, index) => (
                  <Typography key={index} variant="muted" className="leading-7">
                    {paragraph}
                  </Typography>
                ))}
              </div>

              <div className="mt-4">
                <Typography variant="small" className="mb-2 font-medium text-foreground">
                  مناسب برای
                </Typography>
                <div className="flex flex-wrap gap-2">
                  {area.popularFor.map((type) => (
                    <Typography
                      as="span"
                      variant="small"
                      key={type}
                      className="flex items-center gap-1.5 rounded-xl border border-brand/25 bg-brand/5 px-3 py-1.5 font-medium"
                    >
                      <Building2 className="size-3.5 text-brand" />
                      {propertyTypeLabels[type]}
                    </Typography>
                  ))}
                </div>
              </div>
            </section>

            {/* Map */}
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
              <AreaMapPanel lat={area.lat} lng={area.lng} />
            </section>

            {/* Active listings */}
            <section className="min-w-0">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <Typography variant="h3" as="h2" className="text-lg sm:text-lg">
                    فایل‌های {area.name}
                  </Typography>
                  <Typography variant="small" className="mt-0.5">
                    {area.stats.listingCount.toLocaleString("fa-IR")} فایل فعال در
                    این محله
                  </Typography>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-brand"
                  nativeButton={false}
                  render={<Link href={searchHref} />}
                >
                  همه فایل‌ها
                  <ChevronLeft data-icon="inline-end" />
                </Button>
              </div>

              {listings.length > 0 ? (
                <div className="-mx-page flex snap-x snap-mandatory gap-3 overflow-x-auto px-page pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
                  {listings.map((listing) => (
                    <PropertyCard
                      key={listing.id}
                      estate={listing}
                      className="w-[70vw] shrink-0 snap-start sm:w-auto"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-muted/30 px-6 py-14 text-center">
                  <span className="flex size-12 items-center justify-center rounded-full bg-muted text-brand">
                    <Home className="size-6" strokeWidth={1.5} />
                  </span>
                  <Typography variant="h4" as="p">
                    فعلاً فایلی در این محله ثبت نشده است
                  </Typography>
                  <Typography variant="small" className="max-w-xs">
                    برای اطلاع از فایل‌های جدید این محله با کارشناسان ما در تماس
                    باشید.
                  </Typography>
                </div>
              )}
            </section>
          </div>

          {/* Sticky sidebar */}
          <aside className="grid gap-4 lg:sticky lg:top-20">
            <div className="rounded-2xl border bg-card p-4">
              <Typography
                variant="h4"
                as="h2"
                className="mb-3 flex items-center gap-1.5 sm:text-sm"
              >
                <Calculator className="size-4 text-brand" />
                میانگین قیمت در {area.name}
              </Typography>
              <AreaPriceCard area={area} />
            </div>

            {otherAreas.length > 0 && (
              <div className="rounded-2xl border bg-card p-4">
                <Typography
                  variant="h4"
                  as="h2"
                  className="mb-3 flex items-center gap-1.5 sm:text-sm"
                >
                  <Sparkles className="size-4 text-brand" />
                  محله‌های دیگر
                </Typography>
                <ul className="grid gap-1.5">
                  {otherAreas.map((other) => (
                    <li key={other.id}>
                      <Link
                        href={`/areas/${other.id}`}
                        className="group flex items-center gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-border hover:bg-muted/50"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-brand">
                          <MapPinned className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <Typography
                            as="span"
                            variant="h4"
                            className="block truncate text-[13px] font-medium sm:text-[13px]"
                          >
                            {other.name}
                          </Typography>
                          <Typography
                            as="span"
                            variant="small"
                            className="block truncate text-[11px]"
                          >
                            {other.tagline}
                          </Typography>
                        </span>
                        <ChevronLeft className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </Container>
    </div>
  );
}
