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
import { propertyTypeLabels } from "@/data/home";
import {
  formatPublished,
  getAllEstateIds,
  getEstateDetail,
  getSimilarListings,
} from "@/data/estate-detail";

import { DetailSection } from "./_components/detail-section";
import { EstateActions } from "./_components/estate-actions";
import { EstateContactCard } from "./_components/estate-contact-card";
import { EstateDescription } from "./_components/estate-description";
import {
  EstateAmenities,
  EstateConditions,
  EstateHighlights,
  EstateSpecs,
  EstateTrustNotes,
} from "./_components/estate-facts";
import { EstateGallery } from "./_components/estate-gallery";
import { EstateMapPanel } from "./_components/estate-map-panel";
import { EstateMobileBar } from "./_components/estate-mobile-bar";
import { EstatePriceCard } from "./_components/estate-price-card";
import { SimilarEstates } from "./_components/similar-estates";

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
          <Link href="/" className="shrink-0 hover:text-brand">
            خانه
          </Link>
          <ChevronLeft className="size-3.5 shrink-0" />
          <Link href="/search/qom" className="shrink-0 hover:text-brand">
            جستجوی ملک
          </Link>
          <ChevronLeft className="size-3.5 shrink-0" />
          <Link
            href={`/search/qom?district=${encodeURIComponent(detail.district)}`}
            className="shrink-0 hover:text-brand"
          >
            {detail.district}
          </Link>
          <ChevronLeft className="size-3.5 shrink-0" />
          <span className="shrink-0 truncate font-medium text-foreground">
            {detail.title}
          </span>
        </nav>
      </Container>

      {/* Full-bleed on phones, inset from `md` where the mosaic takes over. */}
      <Container className="max-md:px-0">
        <EstateGallery
          propertyType={detail.propertyType}
          title={detail.title}
          badges={badges}
          hasTour={detail.hasTour}
        />
      </Container>

      <Container className="mt-5">
        <header className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h1 className="font-heading text-xl font-bold sm:text-2xl">
              {detail.title}
            </h1>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5 text-brand/70" />
                {detail.district}، {detail.city}
              </span>
              <span className="flex items-center gap-1">
                <Hash className="size-3.5 text-brand/70" />
                کد آگهی {Number(detail.code).toLocaleString("fa-IR")}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3.5 text-brand/70" />
                {formatPublished(detail.publishedDaysAgo)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="size-3.5 text-brand/70" />
                {detail.views.toLocaleString("fa-IR")} بازدید
              </span>
            </div>
          </div>

          <EstateActions title={detail.title} className="shrink-0" />
        </header>

        <div className="mt-4">
          <EstateHighlights detail={detail} />
        </div>

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
                  <span className="text-xs text-muted-foreground">
                    {detail.area.toLocaleString("fa-IR")} مترمربع
                  </span>
                }
              >
                <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-muted/40 px-4 py-10 text-center">
                  <LayoutPanelTop
                    className="size-8 text-brand/50"
                    strokeWidth={1.5}
                  />
                  <p className="font-heading text-sm font-semibold">
                    پلان این واحد در دفتر شعبه موجود است
                  </p>
                  <p className="max-w-sm text-xs leading-5 text-muted-foreground">
                    برای دریافت فایل پلان و ابعاد دقیق فضاها با کارشناس پرونده
                    هماهنگ کنید.
                  </p>
                </div>
              </DetailSection>
            )}

            <DetailSection
              title="موقعیت روی نقشه"
              icon={MapPin}
              action={
                <span className="text-xs text-muted-foreground">
                  موقعیت تقریبی
                </span>
              }
            >
              <EstateMapPanel lat={detail.lat} lng={detail.lng} />
              <p className="mt-3 text-xs leading-6 text-muted-foreground">
                به منظور حفظ حریم مالک، محدوده تقریبی ملک نمایش داده می‌شود.
                نشانی دقیق هنگام هماهنگی بازدید در اختیار شما قرار می‌گیرد.
              </p>
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
                  href={`/search/qom?district=${encodeURIComponent(detail.district)}`}
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
