import type { Metadata } from "next";
import Link from "next/link";
import { Check, Scale, X } from "lucide-react";

import { comparedProperties } from "@/app/panel/_data/panel";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { amenityLabels } from "@/data/search";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "مقایسه املاک | پنل کومه" };
const rows = [
  { label: "قیمت", value: (i: typeof comparedProperties[number]) => i.price },
  { label: "محله", value: (i: typeof comparedProperties[number]) => i.district },
  { label: "متراژ", value: (i: typeof comparedProperties[number]) => `${i.area.toLocaleString("fa-IR")} متر` },
  { label: "تعداد خواب", value: (i: typeof comparedProperties[number]) => i.rooms.toLocaleString("fa-IR") },
  { label: "سن بنا", value: (i: typeof comparedProperties[number]) => `${i.buildingAge.toLocaleString("fa-IR")} سال` },
];
export default function ComparePage() { return <div><PanelPageHeader title="مقایسه املاک" description="مشخصات فایل‌های منتخب را کنار یکدیگر بررسی کنید." />
  <div className="overflow-x-auto pb-2"><div className="min-w-[760px]"><div className="grid grid-cols-[150px_repeat(3,1fr)] gap-2"><div className="flex items-center justify-center rounded-xl bg-muted"><Scale className="size-7 text-brand" /></div>{comparedProperties.map((item)=><Card key={item.id}><CardContent className="p-4"><Typography as="h2" variant="h4" className="line-clamp-2 min-h-10">{item.title}</Typography><Typography variant="small" className="mt-1">کد {item.code}</Typography><Button className="mt-3 w-full" size="sm" variant="outline" nativeButton={false} render={<Link href={routes.property(item.id)} />}>مشاهده فایل</Button></CardContent></Card>)}
  {rows.map((row)=><div key={row.label} className="contents"><div className="flex items-center rounded-lg bg-muted px-3 text-sm font-medium">{row.label}</div>{comparedProperties.map((item)=><div key={`${row.label}-${item.id}`} className="rounded-lg border bg-card p-3 text-center text-sm">{row.value(item)}</div>)}</div>)}
  <div className="flex items-center rounded-lg bg-muted px-3 text-sm font-medium">امکانات</div>{comparedProperties.map((item)=><div key={`amenities-${item.id}`} className="space-y-2 rounded-lg border bg-card p-3">{Object.entries(amenityLabels).slice(0,5).map(([key,label])=><span key={key} className="flex items-center gap-2 text-xs">{item.amenities.includes(key as keyof typeof amenityLabels)?<Check className="size-3.5 text-emerald-600" />:<X className="size-3.5 text-muted-foreground" />}{label}</span>)}</div>)}</div></div></div></div>;
}
