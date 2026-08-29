import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink, MapPin } from "lucide-react";

import { getCachedEstateDetail } from "@/app/properties/_cache/estate-detail.cache";
import { mapEstateDetail } from "@/app/properties/_mappers/estate-detail.mapper";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { isApiError } from "@/lib/api/api-error";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "پیش‌نمایش آگهی | پنل کومه" };

/**
 * How the listing reads to a visitor, from the same endpoint the public page
 * uses — so a difference between this and the live page is a real difference,
 * not a fixture drifting from reality.
 */
export default async function PropertyPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  let detail;
  try {
    detail = mapEstateDetail(await getCachedEstateDetail(id));
  } catch (error) {
    if (isApiError(error) && error.status === 404) notFound();
    throw error;
  }

  const facts: [string, string][] = [
    ["نوع", detail.estateTypeLabel],
    ["معامله", detail.dealTypeLabel],
    // The API decides which specs a listing has, so take the first few rather
    // than naming fields that may not exist on this property type.
    ...detail.facts.slice(0, 4).map((fact): [string, string] => [
      fact.label,
      fact.value,
    ]),
  ];

  return (
    <div>
      <PanelPageHeader
        title="پیش‌نمایش آگهی"
        description="نمای فایل همان‌طور که بازدیدکننده می‌بیند."
        action={
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={routes.panel.adManagement(detail.numericId)} />}
          >
            <ArrowRight />
            بازگشت به مدیریت
          </Button>
        }
      />

      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">پیش‌نمایش</Badge>
            {detail.status.stamp && <Badge>{detail.status.stamp}</Badge>}
            <Typography variant="small">
              {`کد آگهی ${detail.numericId.toLocaleString("fa-IR")}`}
            </Typography>
          </div>

          <Typography as="h2" variant="h2" className="mt-5">
            {detail.title}
          </Typography>

          {detail.location.addressLabel && (
            <Typography variant="lead" className="mt-2 flex items-center gap-1">
              <MapPin className="size-4 text-brand" />
              {detail.location.addressLabel}
            </Typography>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {facts.map(([label, value]) => (
              <div key={label} className="rounded-xl bg-muted p-4">
                <Typography variant="small">{label}</Typography>
                <Typography variant="h4" className="mt-1">
                  {value}
                </Typography>
              </div>
            ))}
          </div>

          {detail.description && (
            <Typography variant="muted" className="mt-6 leading-7">
              {detail.description}
            </Typography>
          )}

          <Button
            className="mt-6"
            variant="outline"
            nativeButton={false}
            render={<Link href={routes.property(detail.numericId)} />}
          >
            <ExternalLink />
            صفحه عمومی ملک
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
