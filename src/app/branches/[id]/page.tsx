import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Building2,
  ChevronLeft,
  Home,
  ImageIcon,
  MapPin,
  Navigation,
  Phone,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";

import businessImage from "@/assets/images/card/business.webp";
import {
  getCachedBranchAgents,
  getCachedBranchEstates,
  getCachedBranchProfile,
  getCachedBranches,
} from "@/app/branches/_cache/branches.cache";
import {
  mapBranchesPage,
  mapBranchProfile,
} from "@/app/branches/_mappers/branch.mapper";
import type {
  BranchAgentsResponse,
  BranchEstatesResponse,
  BranchProfileResponse,
} from "@/app/branches/_schemas/branch.schema";
import { PropertyCard } from "@/components/features/property/property-card";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { ApiImage } from "@/components/shared/api-image";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { ApiError } from "@/lib/api/api-error";
import { routes } from "@/lib/routes";

import { BranchShareButton } from "../_components/branch-actions";
import { BranchContactCard } from "../_components/branch-contact-card";
import { BranchExperts } from "../_components/branch-experts";
import { BranchMapPanel } from "../_components/branch-map-panel";
import { BranchSection } from "../_components/branch-section";
import { BranchStrengths } from "../_components/branch-strengths";

export const revalidate = 900;

// Signals that this route can be statically generated; without it Next treats
// every dynamic segment as fully dynamic and never caches the result.
export function generateStaticParams() {
  return [];
}

// `cache` de-duplicates within one render; the tagged data cache underneath
// survives across requests and can be purged per branch.
const dedupedBranches = cache(() => getCachedBranches(1, 60));

async function optional<T>(promise: Promise<T>): Promise<T | undefined> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof ApiError) return undefined;
    return undefined;
  }
}

async function getBranchContext(id: string) {
  if (!/^\d+$/.test(id)) notFound();

  const branchesResponse = await dedupedBranches();
  const branchDto = branchesResponse.result.items.find(
    (branch) => branch.id === Number(id),
  );

  if (!branchDto) notFound();

  const [profile, agents, estates] = await Promise.all([
    optional<BranchProfileResponse>(getCachedBranchProfile(id)),
    optional<BranchAgentsResponse>(getCachedBranchAgents(id, 12, true)),
    optional<BranchEstatesResponse>(getCachedBranchEstates(id, 4)),
  ]);

  const branch = mapBranchProfile(profile ?? branchDto, agents, estates);
  const branches = mapBranchesPage(branchesResponse).items;

  return {
    branch,
    otherBranches: branches.filter((item) => item.id !== branch.id),
  };
}

export async function generateMetadata({ params }: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const { branch } = await getBranchContext(id);
    return {
      title: `${branch.name} گروه املاک کومه | ${branch.address ?? "قم"}`,
      description: branch.descriptionParagraphs[0],
    };
  } catch {
    return { title: "شعبه یافت نشد | کومه" };
  }
}

export default async function BranchPage({ params }: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { branch, otherBranches } = await getBranchContext(id);
  const directionsUrl =
    branch.lat !== undefined && branch.lng !== undefined
      ? `https://www.google.com/maps/search/?api=1&query=${branch.lat},${branch.lng}`
      : undefined;

  const stats = [
    {
      icon: Home,
      value:
        branch.estateTotal !== undefined
          ? branch.estateTotal.toLocaleString("fa-IR")
          : "—",
      label: "فایل فعال",
    },
    {
      icon: Users,
      value: (branch.agentCount ?? branch.agents.length).toLocaleString("fa-IR"),
      label: "مشاور",
    },
    {
      icon: Building2,
      value: branch.typeLabel ?? "شعبه",
      label: "نوع شعبه",
    },
    {
      icon: Sparkles,
      value: branch.experience ?? "—",
      label: "سابقه",
    },
  ];

  return (
    <div className="pb-16">
      <Breadcrumb
        items={[
          { label: "خانه", href: routes.home },
          { label: "شعب کومه", href: routes.branches },
          { label: branch.name },
        ]}
      />

      <Container>
        <section className="relative min-h-80 overflow-hidden rounded-3xl bg-primary px-5 py-7 text-primary-foreground sm:px-8 sm:py-10">
          {branch.coverImage && (
            <>
              <ApiImage
                src={branch.coverImage}
                fallbackSrc={businessImage}
                alt={branch.name}
                fill
                sizes="100vw"
                priority
                className="object-cover opacity-30"
              />
              <span className="absolute inset-0 bg-linear-to-t from-primary via-primary/85 to-primary/45" />
            </>
          )}

          <div className="relative z-10 flex min-h-64 flex-col justify-end gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {branch.experience && (
                  <Typography as="span" variant="small" light className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 font-medium backdrop-blur-md">
                    <Building2 className="size-3.5 text-secondary" />
                    {branch.experience} سابقه
                  </Typography>
                )}
                {branch.typeLabel && (
                  <Typography as="span" variant="small" light className="inline-flex items-center gap-1.5 rounded-full border border-secondary/40 bg-secondary/15 px-2.5 py-1 font-medium">
                    {branch.typeLabel}
                  </Typography>
                )}
              </div>

              <Typography variant="h2" as="h1" light className="leading-snug">
                {branch.name}
              </Typography>

              {branch.address && (
                <Typography as="p" variant="lead" light className="mt-2 flex items-start gap-1.5 text-white/75">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-secondary" />
                  {branch.address}
                </Typography>
              )}

              <Typography as="p" variant="body" light className="mt-3 max-w-xl leading-7 text-white/70">
                {branch.descriptionParagraphs[0]}
              </Typography>

              <div className="mt-5 flex flex-wrap gap-2.5">
                {branch.phone && (
                  <Button
                    size="lg"
                    variant="secondary"
                    nativeButton={false}
                    render={<a href={branch.telUrl ?? `tel:${branch.phone}`} />}
                    className="font-heading"
                  >
                    <Phone data-icon="inline-start" />
                    تماس با شعبه
                  </Button>
                )}
                {directionsUrl && (
                  <Button
                    size="lg"
                    nativeButton={false}
                    render={<a href={directionsUrl} target="_blank" rel="noopener noreferrer" />}
                    className="border border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  >
                    <Navigation data-icon="inline-start" />
                    مسیریابی
                  </Button>
                )}
                <BranchShareButton name={branch.name} />
              </div>
            </div>
          </div>
        </section>
      </Container>

      <Container className="mt-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 rounded-2xl border bg-card p-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <stat.icon className="size-5" />
              </span>
              <span className="min-w-0">
                <Typography as="span" variant="h4" className="block leading-tight">
                  {stat.value}
                </Typography>
                <Typography as="span" variant="small" className="block truncate">
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
            <BranchSection title="درباره این شعبه" icon={Building2}>
              <div className="space-y-3">
                {branch.descriptionParagraphs.map((paragraph) => (
                  <Typography key={paragraph} variant="muted" className="leading-7">
                    {paragraph}
                  </Typography>
                ))}
              </div>
            </BranchSection>

            <BranchSection title="نقاط قوت ما" subtitle="چرا معامله با کومه؟" icon={Sparkles}>
              <BranchStrengths />
            </BranchSection>

            {branch.coveredDistricts.length > 0 && (
              <BranchSection title="محله‌های تحت پوشش" icon={MapPin}>
                <div className="flex flex-wrap gap-2">
                  {branch.coveredDistricts.map((district) => (
                    <Typography key={district.id} as="span" variant="small" className="rounded-full border bg-muted/50 px-2.5 py-1 font-medium">
                      {district.name}
                    </Typography>
                  ))}
                </div>
              </BranchSection>
            )}

            {branch.agents.length > 0 && (
              <BranchSection
                title={`مشاوران ${branch.name}`}
                subtitle="تیم حرفه‌ای در خدمت شما"
                icon={UserCheck}
                bare
              >
                <BranchExperts experts={branch.agents} />
              </BranchSection>
            )}

            {branch.hasMap && branch.lat !== undefined && branch.lng !== undefined && (
              <BranchSection
                title="آدرس روی نقشه"
                icon={MapPin}
                action={
                  branch.address ? (
                    <Typography as="span" variant="small" className="hidden max-w-xs truncate sm:block">
                      {branch.address}
                    </Typography>
                  ) : undefined
                }
              >
                <BranchMapPanel lat={branch.lat} lng={branch.lng} name={branch.name} />
              </BranchSection>
            )}

            {branch.images.length > 0 && (
              <BranchSection title="تصاویر شعبه" icon={ImageIcon} bare>
                <div className="-mx-page flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden px-page pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
                  {branch.images.map((image) => (
                    <div key={image.id} className="relative aspect-4/3 w-[76vw] shrink-0 snap-start overflow-hidden rounded-2xl border bg-muted sm:w-auto">
                      <ApiImage
                        src={image.url}
                        fallbackSrc={businessImage}
                        alt={branch.name}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 76vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </BranchSection>
            )}

            {branch.estates.length > 0 && (
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
                    render={<Link href={routes.properties()} />}
                  >
                    همه فایل‌ها
                    <ChevronLeft data-icon="inline-end" />
                  </Button>
                }
              >
                <div className="-mx-page flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden px-page pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
                  {branch.estates.map((listing) => (
                    <PropertyCard
                      key={listing.id}
                      estate={listing}
                      className="w-[70vw] shrink-0 snap-start sm:w-auto"
                    />
                  ))}
                </div>
              </BranchSection>
            )}

            {branch.agents.length === 0 && branch.estates.length === 0 && (
              <EmptyState
                icon={Building2}
                title="جزئیات تکمیلی شعبه در دسترس نیست"
                description="اطلاعات پایه شعبه نمایش داده شد؛ بخش مشاوران و فایل‌ها پس از آماده شدن سرویس پروفایل کامل می‌شود."
              />
            )}
          </div>

          <aside className="grid gap-4 lg:sticky lg:top-20">
            <BranchContactCard branch={branch} />

            {otherBranches.length > 0 && (
              <div className="rounded-2xl border bg-card p-4">
                <Typography variant="h4" as="h2" className="mb-3 flex items-center gap-1.5">
                  <Building2 className="size-4 text-brand" />
                  دیگر شعب کومه
                </Typography>
                <ul className="grid gap-1.5">
                  {otherBranches.map((other) => (
                    <li key={other.id}>
                      <Link href={other.href} className="group flex items-center gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-border hover:bg-muted/50">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-brand">
                          <Building2 className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <Typography as="span" variant="h4" className="block truncate">
                            {other.name}
                          </Typography>
                          {other.address && (
                            <Typography as="span" variant="small" className="block truncate">
                              {other.address}
                            </Typography>
                          )}
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
