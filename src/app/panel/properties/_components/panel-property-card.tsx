import Link from "next/link";
import { BarChart3, Eye, MessageSquare, MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import type { PanelProperty, PanelPropertyStatus } from "@/app/panel/_data/panel";
import { routes } from "@/lib/routes";

const statusMeta: Record<PanelPropertyStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  published: { label: "منتشرشده", variant: "default" },
  review: { label: "در انتظار بررسی", variant: "secondary" },
  draft: { label: "پیش‌نویس", variant: "outline" },
  expired: { label: "منقضی", variant: "destructive" },
};

export function PanelPropertyCard({ item }: { item: PanelProperty }) {
  const { listing } = item;
  const status = statusMeta[item.status];
  return (
    <Card className="border-border/80"><CardContent className="p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand"><BarChart3 className="size-6" /></div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2"><Typography as="h2" variant="h4" className="truncate">{listing.title}</Typography><Badge variant={status.variant}>{status.label}</Badge></div>
          <Typography variant="small">{listing.district} · کد {listing.code} · بروزرسانی {item.updatedAt}</Typography>
          <Typography variant="body" className="mt-1 font-semibold text-brand">{listing.price}</Typography>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:w-40">
          <span className="rounded-lg bg-muted p-2 text-center text-xs"><Eye className="mx-auto mb-1 size-4 text-brand" />{item.views.toLocaleString("fa-IR")} بازدید</span>
          <span className="rounded-lg bg-muted p-2 text-center text-xs"><MessageSquare className="mx-auto mb-1 size-4 text-brand" />{item.inquiries.toLocaleString("fa-IR")} درخواست</span>
        </div>
        <Button variant="outline" size="icon" nativeButton={false} render={<Link href={routes.property(listing.id)} aria-label="مشاهده ملک" />}><MoreHorizontal /></Button>
      </div>
    </CardContent></Card>
  );
}

