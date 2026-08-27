import Link from "next/link";
import { Building2, ChevronLeft, MapPin, Phone, Users } from "lucide-react";

import businessImage from "@/assets/images/card/business.webp";
import { getCachedBranches } from "@/app/branches/_cache/branches.cache";
import { mapBranchesPage } from "@/app/branches/_mappers/branch.mapper";
import { ApiImage } from "@/components/shared/api-image";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { ApiError } from "@/lib/api/api-error";

const EMPTY = {
  total: 0,
  page: 1,
  per_page: 60,
  last_page: 0,
  has_more: false,
  items: [],
};

async function getBranchesPage() {
  try {
    return mapBranchesPage(await getCachedBranches(1, 60));
  } catch (error) {
    if (error instanceof ApiError && error.code === "NOT_FOUND") return EMPTY;
    throw error;
  }
}

/**
 * The branch cards, split out so the page heading is sent before the API
 * answers. The empty state lives in here rather than replacing the whole page:
 * a visitor who reaches this route should still see where they are.
 */
export async function BranchesGridServer() {
  const branches = await getBranchesPage();

  if (branches.items.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="شعبه‌ای برای نمایش پیدا نشد"
        description="در حال حاضر اطلاعات شعب از سرویس دریافت نشد. کمی بعد دوباره بررسی کنید."
      />
    );
  }

  return (
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
                <Typography as="h2" variant="h3" light>
                  {branch.name}
                </Typography>
                {branch.address && (
                  <Typography
                    variant="small"
                    light
                    className="mt-2 flex items-start gap-1.5 text-white/70"
                  >
                    <MapPin className="mt-0.5 size-4 shrink-0" />
                    {branch.address}
                  </Typography>
                )}
              </div>
            </div>
            <div className="space-y-4 p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <Typography
                  as="span"
                  variant="small"
                  className="flex items-center gap-2 rounded-lg bg-muted p-3"
                >
                  <Users className="size-4 text-brand" />
                  {branch.agentCount?.toLocaleString("fa-IR") ?? "—"} کارشناس
                </Typography>
                {branch.phone && (
                  <Typography
                    as="a"
                    variant="small"
                    href={`tel:${branch.phone}`}
                    className="flex items-center gap-2 rounded-lg bg-muted p-3 hover:text-brand"
                  >
                    <Phone className="size-4 text-brand" />
                    {branch.phone}
                  </Typography>
                )}
              </div>
              <Button
                className="w-full"
                variant="outline"
                nativeButton={false}
                render={<Link href={branch.href} />}
              >
                مشاهده اطلاعات شعبه
                <ChevronLeft data-icon="inline-end" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
