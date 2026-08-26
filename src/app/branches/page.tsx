import type { Metadata } from "next";
import Link from "next/link";
import { Building2, ChevronLeft, MapPin, Phone, Users } from "lucide-react";

import businessImage from "@/assets/images/card/business.webp";
import { getBranches } from "@/app/branches/_api/branch.service";
import { mapBranchesPage } from "@/app/branches/_mappers/branch.mapper";
import { Container } from "@/components/layout/container";
import { ApiImage } from "@/components/shared/api-image";
import { PageState } from "@/components/shared/page-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { ApiError } from "@/lib/api/api-error";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "شعب املاک کومه در قم", description: "نشانی، شماره تماس و کارشناسان شعب گروه املاک کومه در قم." };

export const revalidate = 900;

async function getBranchesPage() {
  try {
    return mapBranchesPage(await getBranches({ page: 1, per_page: 60 }));
  } catch (error) {
    if (error instanceof ApiError && error.code === "NOT_FOUND") {
      return { total: 0, page: 1, per_page: 60, last_page: 0, has_more: false, items: [] };
    }
    throw error;
  }
}

export default async function BranchesPage() {
  const branches = await getBranchesPage();

  if (branches.items.length === 0) {
    return (
      <PageState
        icon={Building2}
        title="شعبه‌ای برای نمایش پیدا نشد"
        description="در حال حاضر اطلاعات شعب از سرویس دریافت نشد. کمی بعد دوباره بررسی کنید."
        action={
          <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
            بازگشت به خانه
          </Button>
        }
      />
    );
  }

  return (
    <div className="pb-16">
      <Container className="py-section-sm">
        <header className="mb-7 max-w-2xl">
          <Typography variant="eyebrow" className="text-brand">نزدیک‌ترین دفتر به شما</Typography>
          <Typography as="h1" variant="h2" className="mt-2">شعب املاک کومه</Typography>
          <Typography variant="lead" className="mt-2 leading-7">برای مشاوره حضوری، بررسی فایل‌ها و هماهنگی بازدید می‌توانید با نزدیک‌ترین شعبه در تماس باشید.</Typography>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {branches.items.map((branch) => (
              <Card key={branch.id} className="overflow-hidden border-border/80">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden bg-primary p-5 text-primary-foreground">
                    {branch.coverImage && (
                      <>
                        <ApiImage
                          src={branch.coverImage}
                          fallbackSrc={businessImage}
                          alt={branch.name}
                          fill
                          sizes="(min-width: 768px) 50vw, 100vw"
                          className="object-cover opacity-25"
                        />
                        <span className="absolute inset-0 bg-primary/75" />
                      </>
                    )}
                    <div className="relative">
                      <Building2 className="mb-4 size-8 text-secondary" />
                      <Typography as="h2" variant="h3" light>{branch.name}</Typography>
                      {branch.address && (
                        <Typography variant="small" light className="mt-2 flex items-start gap-1.5 text-white/70">
                          <MapPin className="mt-0.5 size-4 shrink-0" />
                          {branch.address}
                        </Typography>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4 p-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Typography as="span" variant="small" className="flex items-center gap-2 rounded-lg bg-muted p-3">
                        <Users className="size-4 text-brand" />
                        {branch.agentCount?.toLocaleString("fa-IR") ?? "—"} کارشناس
                      </Typography>
                      {branch.phone && (
                        <Typography as="a" variant="small" href={`tel:${branch.phone}`} className="flex items-center gap-2 rounded-lg bg-muted p-3 hover:text-brand">
                          <Phone className="size-4 text-brand" />
                          {branch.phone}
                        </Typography>
                      )}
                    </div>
                    <Button className="w-full" variant="outline" nativeButton={false} render={<Link href={branch.href} />}>
                      مشاهده اطلاعات شعبه<ChevronLeft data-icon="inline-end" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
          ))}
        </div>
      </Container>
    </div>
  );
}
