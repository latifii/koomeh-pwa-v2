import { cache, Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  ChevronLeft,
  Clock,
  Eye,
  FileText,
  Hash,
  ListChecks,
  MapPin,
  Repeat2,
  Sparkles,
  SquareStack,
  Video,
} from "lucide-react";

import {
  getCachedEstateDetail,
  getCachedEstateGallery,
  getCachedEstateVirtualTour,
} from "@/app/properties/_cache/estate-detail.cache";
import {
  mapEstateDetail,
  mapEstateGallery,
  mapEstateVirtualTour,
} from "@/app/properties/_mappers/estate-detail.mapper";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { ApiError } from "@/lib/api/api-error";
import { routes } from "@/lib/routes";

import { DetailSection } from "../_components/detail-section";
import { EstateActions } from "../_components/estate-actions";
import { EstateContactCard } from "../_components/estate-contact-card";
import { EstateDescription } from "../_components/estate-description";
import {
  EstateConditions,
  EstateFeatures,
  EstateHighlights,
  EstateSpecs,
} from "../_components/estate-facts";
import { EstateGallery } from "../_components/estate-gallery";
import { EstateMapPanel } from "../_components/estate-map-panel";
import { EstateMobileBar } from "../_components/estate-mobile-bar";
import { EstatePriceCard } from "../_components/estate-price-card";
import { EstateChatCard } from "../_components/estate-chat-card";
import { EstateStaffPanel } from "../_components/estate-staff-panel";
import { EstateTourCard } from "../_components/estate-tour-card";
import { EstateViewTracker } from "../_components/estate-view-tracker";
import { SimilarEstatesServer } from "../_components/similar-estates-server";

export const revalidate = 300;

// Signals that this route can be statically generated; without it Next treats
// every dynamic segment as fully dynamic and never caches the result.
export function generateStaticParams() {
  return [];
}

/** Anything but the detail call is optional — a page still renders without it. */
async function optional<T>(promise: Promise<T>): Promise<T | undefined> {
  try {
    return await promise;
  } catch {
    return undefined;
  }
}

const getDetail = cache(async (id: string) => {
  if (!/^\d+$/.test(id)) notFound();

  try {
    return mapEstateDetail(await getCachedEstateDetail(id));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
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
    const detail = await getDetail(id);
    const location = detail.location.addressLabel ?? detail.location.cityName;

    return {
      title: location
        ? `${detail.title} در ${location} | کومه`
        : `${detail.title} | کومه`,
      description: detail.description ?? undefined,
    };
  } catch {
    return { title: "ملک یافت نشد | کومه" };
  }
}

export default async function EstatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getDetail(id);

  const [galleryResponse, tourResponse] = await Promise.all([
    optional(getCachedEstateGallery(id)),
    detail.media.hasVirtualTour
      ? optional(getCachedEstateVirtualTour(id))
      : Promise.resolve(undefined),
  ]);

  const gallery = galleryResponse ? mapEstateGallery(galleryResponse) : undefined;
  const tour = tourResponse ? mapEstateVirtualTour(tourResponse) : undefined;

  // Plans are photos of the same file, so they extend the gallery rather than
  // living in a section that would sit empty for most listings.
  const photos = [...(gallery?.photos ?? []), ...(gallery?.plans ?? [])];

  const badges = [
    detail.estateTypeLabel,
    detail.dealTypeLabel,
    ...(detail.isSpecial ? ["ویژه"] : []),
    ...(detail.status.stamp ? [detail.status.stamp] : []),
  ];

  const districtHref = detail.location.districtId
    ? routes.properties({ districts: detail.location.districtId })
    : routes.properties();

  return (
    // The mobile action bar and the global bottom nav both float over the page,
    // so the last section needs room to clear them.
    <div className="pb-40 lg:pb-16">
      <Container className="py-3">
        <nav
          aria-label="مسیر صفحه"
          className="flex items-center gap-1 overflow-x-auto text-xs text-muted-foreground [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <Link href={routes.home} className="shrink-0 hover:text-brand">
            خانه
          </Link>
          <ChevronLeft className="size-3.5 shrink-0" />
          <Link href={routes.properties()} className="shrink-0 hover:text-brand">
            جستجوی ملک
          </Link>
          {detail.location.districtName && (
            <>
              <ChevronLeft className="size-3.5 shrink-0" />
              <Link href={districtHref} className="shrink-0 hover:text-brand">
                {detail.location.districtName}
              </Link>
            </>
          )}
          <ChevronLeft className="size-3.5 shrink-0" />
          <Typography
            as="span"
            variant="small"
            className="shrink-0 truncate font-medium text-foreground"
          >
            {detail.title}
          </Typography>
        </nav>
      </Container>

      {/* Full-bleed on phones, inset from `md` where the mosaic takes over. */}
      <Container className="max-md:px-0">
        <EstateGallery
          photos={photos}
          propertyType={detail.propertyType}
          title={detail.title}
          badges={badges}
          tourHref={
            detail.media.hasVirtualTour
              ? routes.propertyVirtualTour(detail.id)
              : undefined
          }
        />
      </Container>

      <Container className="mt-5">
        <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <Typography
              variant="h3"
              as="h1"
              className="text-xl font-bold sm:text-2xl"
            >
              {detail.title}
            </Typography>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              {detail.location.addressLabel && (
                <Typography
                  as="span"
                  variant="small"
                  className="flex items-center gap-1"
                >
                  <MapPin className="size-3.5 text-brand/70" />
                  {detail.location.addressLabel}
                </Typography>
              )}
              <Typography
                as="span"
                variant="small"
                className="flex items-center gap-1"
              >
                <Hash className="size-3.5 text-brand/70" />
                کد آگهی {detail.numericId.toLocaleString("fa-IR")}
              </Typography>
              {detail.publishedLabel && (
                <Typography
                  as="span"
                  variant="small"
                  className="flex items-center gap-1"
                >
                  <Clock className="size-3.5 text-brand/70" />
                  {detail.publishedLabel}
                </Typography>
              )}
              {detail.visitCount !== undefined && (
                <Typography
                  as="span"
                  variant="small"
                  className="flex items-center gap-1"
                >
                  <Eye className="size-3.5 text-brand/70" />
                  {detail.visitCount.toLocaleString("fa-IR")} بازدید
                </Typography>
              )}
              {detail.status.isVerified && (
                <Typography
                  as="span"
                  variant="small"
                  className="flex items-center gap-1 text-brand"
                >
                  <BadgeCheck className="size-3.5" />
                  {detail.status.confirmationLabel}
                </Typography>
              )}
            </div>
          </div>

          <EstateActions
            estateId={detail.id}
            title={detail.title}
            className="shrink-0"
          />
        </header>

        <div className="mt-4">
          <EstateHighlights facts={detail.facts} />
        </div>

        {tour && (
          <div className="mt-4">
            <EstateTourCard
              estateId={detail.id}
              title={detail.title}
              imageCount={tour.imageCount}
              previewImage={tour.images[0]?.url ?? detail.media.coverImage}
            />
          </div>
        )}

        <div className="mt-5 grid items-start gap-5 lg:grid-cols-3">
          <div className="grid gap-4 lg:col-span-2">
            {detail.description && (
              <DetailSection title="توضیحات" icon={FileText}>
                <EstateDescription text={detail.description} />
              </DetailSection>
            )}

            <DetailSection title="مشخصات ملک" icon={SquareStack}>
              <EstateSpecs detail={detail} />
            </DetailSection>

            {detail.featureGroups.length > 0 && (
              <DetailSection title="امکانات ملک" icon={Sparkles}>
                <EstateFeatures groups={detail.featureGroups} />
              </DetailSection>
            )}

            {detail.conditions.length > 0 && (
              <DetailSection title="شرایط ملک" icon={ListChecks}>
                <EstateConditions conditions={detail.conditions} />
              </DetailSection>
            )}

            {detail.exchange && (
              <DetailSection title="معاوضه" icon={Repeat2}>
                <Typography variant="muted" className="leading-7">
                  {detail.exchange.description ??
                    "این ملک قابل معاوضه است؛ شرایط را با کارشناس پرونده هماهنگ کنید."}
                </Typography>
              </DetailSection>
            )}

            {detail.media.video && (
              <DetailSection title="ویدیوی ملک" icon={Video}>
                <div className="aspect-video w-full overflow-hidden rounded-2xl border">
                  <iframe
                    src={detail.media.video.embedUrl}
                    title={`ویدیوی ${detail.title}`}
                    allowFullScreen
                    className="size-full"
                  />
                </div>
              </DetailSection>
            )}

            {detail.location.hasMap && (
              <DetailSection
                title="موقعیت روی نقشه"
                icon={MapPin}
                action={
                  !detail.location.isFullAddress ? (
                    <Typography as="span" variant="small">
                      موقعیت تقریبی
                    </Typography>
                  ) : null
                }
              >
                <EstateMapPanel
                  lat={detail.location.lat!}
                  lng={detail.location.lng!}
                />
                {!detail.location.isFullAddress && (
                  <Typography variant="small" className="mt-3 leading-6">
                    به منظور حفظ حریم مالک، محدوده تقریبی ملک نمایش داده می‌شود.
                    نشانی دقیق هنگام هماهنگی بازدید در اختیار شما قرار می‌گیرد.
                  </Typography>
                )}
              </DetailSection>
            )}
          </div>

          {/* Sticky rail: price and contact stay reachable through a long read. */}
          <aside className="hidden lg:sticky lg:top-20 lg:grid lg:gap-4">
            <EstatePriceCard detail={detail} />
            <EstateContactCard
              estateId={detail.id}
              agent={detail.agent}
              contact={detail.contact}
              requestVisitHref={detail.links.request_visit}
            />

            {detail.location.districtName && (
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                nativeButton={false}
                render={<Link href={districtHref} />}
              >
                فایل‌های دیگر {detail.location.districtName}
              </Button>
            )}
          </aside>
        </div>

        {/* Below `lg` the rail unstacks and lands here, after the content. */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:hidden">
          <EstatePriceCard detail={detail} />
          <EstateContactCard
            estateId={detail.id}
            agent={detail.agent}
            contact={detail.contact}
            requestVisitHref={detail.links.request_visit}
          />
        </div>

        <EstateChatCard estateId={detail.numericId} />

        {/* Renders nothing — and calls nothing — unless the viewer is staff. */}
        <EstateStaffPanel estateId={detail.numericId} />

        {/* Streamed: this strip sits at the bottom, so the page should not wait. */}
        <Suspense fallback={null}>
          <SimilarEstatesServer estateId={id} viewAllHref={districtHref} />
        </Suspense>
      </Container>

      <EstateMobileBar detail={detail} />

      {/* Records the visit. */}
      <EstateViewTracker estateId={detail.id} />
    </div>
  );
}
