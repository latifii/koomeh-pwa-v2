import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronLeft,
  Clock,
  Eye,
  FileText,
  Hash,
  LayoutPanelTop,
  ListChecks,
  MapPin,
  Sparkles,
  SquareStack,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { propertyTypeLabels } from "@/data/home";
import {
  formatPublished,
  getAllEstateIds,
  getEstateDetail,
  getSimilarListings,
} from "@/data/estate-detail";
import { getEstateTour } from "@/data/virtual-tour";
import { routes } from "@/lib/routes";

import { DetailSection } from "../_components/detail-section";
import { EstateActions } from "../_components/estate-actions";
import { EstateContactCard } from "../_components/estate-contact-card";
import { EstateDescription } from "../_components/estate-description";
import {
  EstateAmenities,
  EstateConditions,
  EstateHighlights,
  EstateSpecs,
  EstateTrustNotes,
} from "../_components/estate-facts";
import { EstateGallery } from "../_components/estate-gallery";
import { EstateMapPanel } from "../_components/estate-map-panel";
import { EstateMobileBar } from "../_components/estate-mobile-bar";
import { EstatePriceCard } from "../_components/estate-price-card";
import { EstateTourCard } from "../_components/estate-tour-card";
import { SimilarEstates } from "../_components/similar-estates";

export function generateStaticParams() {
  return getAllEstateIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const detail = getEstateDetail(id);

  if (!detail) return { title: "ملک یافت نشد | کومه" };

  return {
    title: `${detail.title} در ${detail.district} ${detail.city} | کومه`,
    description: detail.description.split("\n\n")[0],
  };
}

export default async function EstatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = getEstateDetail(id);

  if (!detail) notFound();

  const similar = getSimilarListings(detail, 4);
  const tour = getEstateTour(id);

  const badges = [
    propertyTypeLabels[detail.propertyType],
    detail.dealType === "sale" ? "فروش" : "رهن و اجاره",
    ...(detail.isNew ? ["نوساز"] : []),
    ...(detail.isUrgent ? ["فوری"] : []),
  ];

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
          <ChevronLeft className="size-3.5 shrink-0" />
          <Link
            href={routes.properties({ district: detail.district })}
            className="shrink-0 hover:text-brand"
          >
            {detail.district}
          </Link>
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
          estateId={detail.id}
          propertyType={detail.propertyType}
          title={detail.title}
          badges={badges}
          hasTour={detail.hasTour}
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
              <Typography
                as="span"
                variant="small"
                className="flex items-center gap-1"
              >
                <MapPin className="size-3.5 text-brand/70" />
                {detail.district}، {detail.city}
              </Typography>
              <Typography
                as="span"
                variant="small"
                className="flex items-center gap-1"
              >
                <Hash className="size-3.5 text-brand/70" />
                کد آگهی {Number(detail.code).toLocaleString("fa-IR")}
              </Typography>
              <Typography
                as="span"
                variant="small"
                className="flex items-center gap-1"
              >
                <Clock className="size-3.5 text-brand/70" />
                {formatPublished(detail.publishedDaysAgo)}
              </Typography>
              <Typography
                as="span"
                variant="small"
                className="flex items-center gap-1"
              >
                <Eye className="size-3.5 text-brand/70" />
                {detail.views.toLocaleString("fa-IR")} بازدید
              </Typography>
            </div>
          </div>

          <EstateActions title={detail.title} className="shrink-0" />
        </header>

        <div className="mt-4">
          <EstateHighlights detail={detail} />
        </div>

        {tour && (
          <div className="mt-4">
            <EstateTourCard
              estateId={detail.id}
              title={detail.title}
              sceneCount={tour.scenes.length}
            />
          </div>
        )}

        <div className="mt-5 grid items-start gap-5 lg:grid-cols-3">
          <div className="grid gap-4 lg:col-span-2">
            <DetailSection title="توضیحات" icon={FileText}>
              <EstateDescription text={detail.description} />
              <div className="mt-4">
                <EstateTrustNotes />
              </div>
            </DetailSection>

            <DetailSection title="مشخصات ملک" icon={SquareStack}>
              <EstateSpecs detail={detail} />
            </DetailSection>

            <DetailSection title="امکانات ملک" icon={Sparkles}>
              <EstateAmenities detail={detail} />
            </DetailSection>

            <DetailSection
              title="شرایط ملک"
              icon={ListChecks}
              action={
                detail.hasExchange ? (
                  <Badge variant="secondary">قابل معاوضه</Badge>
                ) : null
              }
            >
              <EstateConditions conditions={detail.conditions} />
            </DetailSection>

            {detail.hasPlan && (
              <DetailSection
                title="پلان واحد"
                icon={LayoutPanelTop}
                action={
                  <Typography as="span" variant="small">
                    {detail.area.toLocaleString("fa-IR")} مترمربع
                  </Typography>
                }
              >
                <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-muted/40 px-4 py-10 text-center">
                  <LayoutPanelTop
                    className="size-8 text-brand/50"
                    strokeWidth={1.5}
                  />
                  <Typography variant="h4" as="p" className="sm:text-sm">
                    پلان این واحد در دفتر شعبه موجود است
                  </Typography>
                  <Typography variant="small" className="max-w-sm leading-5">
                    برای دریافت فایل پلان و ابعاد دقیق فضاها با کارشناس پرونده
                    هماهنگ کنید.
                  </Typography>
                </div>
              </DetailSection>
            )}

            <DetailSection
              title="موقعیت روی نقشه"
              icon={MapPin}
              action={
                <Typography as="span" variant="small">
                  موقعیت تقریبی
                </Typography>
              }
            >
              <EstateMapPanel lat={detail.lat} lng={detail.lng} />
              <Typography variant="small" className="mt-3 leading-6">
                به منظور حفظ حریم مالک، محدوده تقریبی ملک نمایش داده می‌شود.
                نشانی دقیق هنگام هماهنگی بازدید در اختیار شما قرار می‌گیرد.
              </Typography>
            </DetailSection>
          </div>

          {/* Sticky rail: price and contact stay reachable through a long read. */}
          <aside className="hidden lg:sticky lg:top-20 lg:grid lg:gap-4">
            <EstatePriceCard detail={detail} />
            <EstateContactCard agent={detail.agent} />

            <Button
              variant="outline"
              size="lg"
              className="w-full"
              nativeButton={false}
              render={
                <Link
                  href={routes.properties({ district: detail.district })}
                />
              }
            >
              فایل‌های دیگر {detail.district}
            </Button>
          </aside>
        </div>

        {/* Below `lg` the rail unstacks and lands here, after the content. */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:hidden">
          <EstatePriceCard detail={detail} />
          <EstateContactCard agent={detail.agent} />
        </div>

        <SimilarEstates listings={similar} city="qom" />
      </Container>

      <EstateMobileBar detail={detail} />
    </div>
  );
}
