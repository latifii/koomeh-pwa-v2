import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Plus } from "lucide-react";

import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { panelProperties } from "@/app/panel/_data/panel";
import { routes } from "@/lib/routes";
import { PanelPropertyCard } from "./_components/panel-property-card";

export const metadata: Metadata = { title: "املاک من | پنل کومه" };
export default function PanelPropertiesPage() {
  return <div><PanelPageHeader title="املاک من" description="وضعیت انتشار و عملکرد فایل‌های ثبت‌شده را مشاهده کنید." action={<Button nativeButton={false} render={<Link href={routes.panel.newProperty} />}><Plus />ثبت ملک جدید</Button>} />
    <div className="mb-4 flex items-center justify-between rounded-lg border bg-card p-3"><Typography variant="small" className="flex items-center gap-2"><Building2 className="size-4 text-brand" />{panelProperties.length.toLocaleString("fa-IR")} فایل نمونه</Typography><div className="flex gap-2"><Button size="sm" variant="secondary">همه</Button><Button size="sm" variant="ghost">منتشرشده</Button><Button size="sm" variant="ghost">پیش‌نویس</Button></div></div>
    <div className="grid gap-3">{panelProperties.map((item)=><PanelPropertyCard key={item.listing.id} item={item} />)}</div>
  </div>;
}

