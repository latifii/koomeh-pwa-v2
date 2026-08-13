import Link from "next/link";
import { Bell, Building2, ChevronLeft, ClipboardList, Heart, SearchCheck } from "lucide-react";

import { panelNotifications, panelProperties, panelRequests, savedSearches } from "@/app/panel/_data/panel";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/lib/routes";

const stats = [
  { label: "ملک‌های من", value: panelProperties.length, icon: Building2, href: routes.panel.properties },
  { label: "تقاضاهای فعال", value: panelRequests.filter((item)=>item.status!=="closed").length, icon: ClipboardList, href: routes.panel.requests },
  { label: "جست‌وجوی ذخیره", value: savedSearches.length, icon: SearchCheck, href: routes.panel.savedSearches },
  { label: "اعلان خوانده‌نشده", value: panelNotifications.filter((item)=>!item.read).length, icon: Bell, href: routes.panel.notifications },
];

export default function PanelDashboardPage() {
  return <div><PanelPageHeader title="داشبورد" description="خلاصه فعالیت‌ها و دسترسی سریع به بخش‌های حساب کومه." />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat)=><Link key={stat.label} href={stat.href}><Card className="h-full transition-colors hover:border-brand/30"><CardContent className="flex items-center gap-3 p-4"><span className="flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand"><stat.icon /></span><span className="min-w-0 flex-1"><Typography as="span" variant="h3" className="block">{stat.value.toLocaleString("fa-IR")}</Typography><Typography variant="small">{stat.label}</Typography></span><ChevronLeft className="size-4 text-muted-foreground" /></CardContent></Card></Link>)}</div>
    <div className="mt-5 grid gap-4 lg:grid-cols-2"><Card><CardContent className="p-5"><Typography as="h2" variant="h4">آخرین تقاضاها</Typography><div className="mt-3 divide-y">{panelRequests.slice(0,3).map((request)=><Link key={request.id} href={routes.panel.request(request.id)} className="flex items-center justify-between py-3"><span><Typography variant="body" className="font-medium">{request.values.name}</Typography><Typography variant="small">{request.values.requestType==="buy"?"خرید":"اجاره"} · {request.values.districts[0]}</Typography></span><ChevronLeft className="size-4 text-brand" /></Link>)}</div></CardContent></Card><Card><CardContent className="p-5"><Typography as="h2" variant="h4">دسترسی سریع</Typography><div className="mt-3 grid grid-cols-2 gap-2">{[{label:"علاقه‌مندی‌ها",icon:Heart,href:routes.panel.favorites},{label:"اعلان‌ها",icon:Bell,href:routes.panel.notifications},{label:"ثبت ملک",icon:Building2,href:routes.panel.newProperty},{label:"ثبت تقاضا",icon:ClipboardList,href:routes.panel.newRequest}].map((item)=><Link key={item.label} href={item.href} className="flex items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors hover:border-brand/30 hover:text-brand"><item.icon className="size-4" />{item.label}</Link>)}</div></CardContent></Card></div>
  </div>;
}
