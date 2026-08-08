import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  ChevronLeft,
  Handshake,
  Home,
  MapPin,
  Navigation,
  Phone,
  Sparkles,
  Star,
  UserCheck,
  Users,
} from "lucide-react";

import { PropertyCard } from "@/components/property/property-card";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import {
  getAllBranchIds,
  getBranchDetail,
  getOtherBranches,
} from "@/data/branch-detail";

import { BranchContactCard } from "./_components/branch-contact-card";
import { BranchExperts } from "./_components/branch-experts";
import { BranchMapPanel } from "./_components/branch-map-panel";
import { BranchSection } from "./_components/branch-section";
import { BranchShareButton } from "./_components/branch-actions";
import { BranchStrengths } from "./_components/branch-strengths";

export function generateStaticParams() {
  return getAllBranchIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const branch = getBranchDetail(id);

  if (!branch) return { title: "شعبه یافت نشد | کومه" };

  return {
    title: `${branch.name} گروه املاک کومه | ${branch.address}`,
    description: branch.description.split("\n\n")[0],
  };
}

export default async function BranchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const branch = getBranchDetail(id);

  if (!branch) notFound();

  const otherBranches = getOtherBranches(branch.id);
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${branch.lat},${branch.lng}`;

  const stats = [
    {
      icon: Home,
      value: branch.activeListings.toLocaleString("fa-IR"),
      label: "فایل فعال",
    },
    {
      icon: Users,
      value: branch.experts.length.toLocaleString("fa-IR"),
      label: "مشاور",
    },
    {
      icon: Handshake,
      value: `${branch.monthlyDeals.toLocaleString("fa-IR")}+`,
      label: "معامله ماهانه",
    },
    {
      icon: Star,
      value: branch.rating.toLocaleString("fa-IR"),
      label: `${branch.reviewsCount.toLocaleString("fa-IR")} نظر`,
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
          <Link href="/#branches" className="shrink-0 hover:text-brand">
            شعب کومه
          </Link>
          <ChevronLeft className="size-3.5 shrink-0" />
          <Typography as="span" variant="small" className="shrink-0 font-medium text-foreground">
            {branch.name}
          </Typography>
        </nav>
      </Container>

      {/* Hero band */}
      <Container>
        <section className="relative overflow-hidden rounded-3xl bg-primary px-5 py-7 text-primary-foreground sm:px-8 sm:py-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 inset-e-[-4rem] size-80 rounded-full bg-secondary/15 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-28 inset-s-[-6rem] size-80 rounded-full bg-white/5 blur-[120px]"
          />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Typography
                  as="span"
                  variant="small"
                  light
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium backdrop-blur-md"
                >
                  <Building2 className="size-3.5 text-secondary" />
                  از سال {branch.establishedYear.toLocaleString("fa-IR")}
                </Typography>
                <Typography
                  as="span"
                  variant="small"
                  light
                  className="inline-flex items-center gap-1.5 rounded-full border border-secondary/40 bg-secondary/15 px-2.5 py-1 text-[11px] font-medium"
                >
                  <Star className="size-3.5 fill-secondary text-secondary" />
                  {branch.rating.toLocaleString("fa-IR")} از ۵
                </Typography>
              </div>

              <Typography variant="h2" as="h1" light className="text-2xl sm:text-3xl">
                {branch.name}
              </Typography>

              <Typography
                as="p"
                variant="lead"
                light
                className="mt-2 flex items-start gap-1.5 text-white/75"
              >
                <MapPin className="mt-0.5 size-4 shrink-0 text-secondary" />
                {branch.address}
              </Typography>

              <Typography
                as="p"
                variant="body"
                light
                className="mt-3 max-w-xl leading-7 text-white/70"
              >
                {branch.description.split("\n\n")[0]}
              </Typography>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <Button
                  size="lg"
                  variant="secondary"
                  nativeButton={false}
                  render={<a href={`tel:${branch.phone}`} />}
                  className="font-heading"
                >
                  <Phone data-icon="inline-start" />
                  تماس با شعبه
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
                <BranchShareButton name={branch.name} />
              </div>
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
            <BranchSection
              title="درباره این شعبه"
              icon={Building2}
            >
              <div className="space-y-3">
                {branch.description.split("\n\n").map((paragraph, index) => (
                  <Typography key={index} variant="muted" className="leading-7">
                    {paragraph}
                  </Typography>
                ))}
              </div>
            </BranchSection>

            <BranchSection
              title="نقاط قوت ما"
              subtitle="چرا معامله با کومه؟"
              icon={Sparkles}
            >
              <BranchStrengths />
            </BranchSection>

            <BranchSection
              title={`مشاوران ${branch.name}`}
              subtitle="تیم حرفه‌ای در خدمت شما"
              icon={UserCheck}
              bare
            >
              <BranchExperts experts={branch.experts} />
            </BranchSection>

            <BranchSection
              title="آدرس روی نقشه"
              icon={MapPin}
              action={
                <span className="text-xs text-muted-foreground">
                  {branch.address}
                </span>
              }
            >
              <BranchMapPanel
                lat={branch.lat}
                lng={branch.lng}
                name={branch.name}
              />
            </BranchSection>

            {branch.featuredListings.length > 0 && (
              <BranchSection
                title="فایل‌های این شعبه"
                subtitle="منتخبی از املاک موجود"
                icon={Home}
                bare
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-brand"
                    nativeButton={false}
                    render={<Link href="/search/qom" />}
                  >
                    همه فایل‌ها
                    <ChevronLeft data-icon="inline-end" />
                  </Button>
                }
              >
                <div className="-mx-page flex snap-x snap-mandatory gap-3 overflow-x-auto px-page pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
                  {branch.featuredListings.map((listing) => (
                    <PropertyCard
                      key={listing.id}
                      estate={listing}
                      className="w-[70vw] shrink-0 snap-start sm:w-auto"
                    />
                  ))}
                </div>
              </BranchSection>
            )}
          </div>

          {/* Sticky sidebar */}
          <aside className="grid gap-4 lg:sticky lg:top-20">
            <BranchContactCard branch={branch} />

            {otherBranches.length > 0 && (
              <div className="rounded-2xl border bg-card p-4">
                <Typography
                  variant="h4"
                  as="h2"
                  className="mb-3 flex items-center gap-1.5 sm:text-sm"
                >
                  <Building2 className="size-4 text-brand" />
                  دیگر شعب کومه
                </Typography>
                <ul className="grid gap-1.5">
                  {otherBranches.map((other) => (
                    <li key={other.id}>
                      <Link
                        href={`/branch/${other.id}`}
                        className="group flex items-center gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-border hover:bg-muted/50"
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-brand">
                          <Building2 className="size-4" />
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
                            {other.address}
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
