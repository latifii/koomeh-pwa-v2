import type { Metadata } from "next";
import Link from "next/link";
import { Building2, ChevronLeft, MapPin, Phone, Users } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { getBranchDetail } from "@/data/branch-detail";
import { branches } from "@/data/home";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "شعب املاک کومه در قم", description: "نشانی، شماره تماس و کارشناسان شعب گروه املاک کومه در قم." };

export default function BranchesPage() {
  return (
    <div className="pb-16">
      <Container className="py-section-sm">
        <header className="mb-7 max-w-2xl">
          <Typography variant="eyebrow" className="text-brand">نزدیک‌ترین دفتر به شما</Typography>
          <Typography as="h1" variant="h2" className="mt-2">شعب املاک کومه</Typography>
          <Typography variant="lead" className="mt-2 leading-7">برای مشاوره حضوری، بررسی فایل‌ها و هماهنگی بازدید می‌توانید با نزدیک‌ترین شعبه در تماس باشید.</Typography>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {branches.map((branch) => {
            const detail = getBranchDetail(branch.id);
            return (
              <Card key={branch.id} className="overflow-hidden border-border/80">
                <CardContent className="p-0">
                  <div className="relative bg-primary p-5 text-primary-foreground">
                    <Building2 className="mb-4 size-8 text-secondary" />
                    <Typography as="h2" variant="h3" light>{branch.name}</Typography>
                    <Typography variant="small" light className="mt-2 flex items-start gap-1.5 text-white/70"><MapPin className="mt-0.5 size-4 shrink-0" />{branch.address}</Typography>
                  </div>
                  <div className="space-y-4 p-5">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <span className="flex items-center gap-2 rounded-lg bg-muted p-3"><Users className="size-4 text-brand" />{detail?.experts.length.toLocaleString("fa-IR")} کارشناس</span>
                      <a href={`tel:${branch.phone}`} className="flex items-center gap-2 rounded-lg bg-muted p-3 hover:text-brand"><Phone className="size-4 text-brand" />{branch.phone}</a>
                    </div>
                    <Button className="w-full" variant="outline" nativeButton={false} render={<Link href={routes.branch(branch.id)} />}>
                      مشاهده اطلاعات شعبه<ChevronLeft data-icon="inline-end" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Container>
    </div>
  );
}

