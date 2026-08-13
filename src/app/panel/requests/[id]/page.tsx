import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Banknote, Building2, CalendarClock, Edit3, FileText, MapPin, Phone, Ruler } from "lucide-react";

import { getPanelRequest, panelRequests } from "@/app/panel/_data/panel";
import { PropertyCard } from "@/components/features/property/property-card";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { allListings } from "@/data/listings";
import { routes } from "@/lib/routes";
import { RequestStatusBadge } from "../_components/request-status-badge";

export function generateStaticParams() { return panelRequests.map(({ id }) => ({ id })); }
export async function generateMetadata({ params }: { params: Promise<{id:string}> }): Promise<Metadata> { const request=getPanelRequest((await params).id); return { title: request ? `${request.values.name} | تقاضای ملکی` : "تقاضا یافت نشد" }; }

export default async function RequestDetailPage({ params }: { params: Promise<{id:string}> }) {
  const request=getPanelRequest((await params).id); if(!request) notFound(); const v=request.values;
  const facts=[{icon:Phone,label:"شماره همراه",value:v.mobile},{icon:Building2,label:"نوع درخواست",value:`${v.requestType === "buy" ? "خرید" : "اجاره"} ${v.estateType}`},{icon:MapPin,label:"محدوده",value:v.districts.join("، ") || "قم"},{icon:Ruler,label:"متراژ",value:`${v.areaMin} تا ${v.areaMax || "بدون محدودیت"} متر`},{icon:Banknote,label:"حداکثر بودجه",value:formatBudget(v.priceMax || v.rentMax)},{icon:CalendarClock,label:"آخرین پیگیری",value:request.lastFollowUp}];
  return <div><PanelPageHeader title={v.name} description={`تقاضای شماره ${request.id.replace("r-","")} · ثبت ${request.createdAt}`} action={<Button nativeButton={false} render={<Link href={routes.panel.editRequest(request.id)} />}><Edit3 />ویرایش تقاضا</Button>} />
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]"><div className="grid gap-4"><Card><CardHeader className="flex-row items-center justify-between"><CardTitle>مشخصات تقاضا</CardTitle><RequestStatusBadge status={request.status} /></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-2">{facts.map((fact)=><div key={fact.label} className="flex gap-3 rounded-lg border p-3"><fact.icon className="mt-0.5 size-4 shrink-0 text-brand" /><span><Typography variant="small">{fact.label}</Typography><Typography variant="body" className="mt-0.5 font-medium">{fact.value}</Typography></span></div>)}</div></CardContent></Card><Card><CardHeader><CardTitle className="flex items-center gap-2"><FileText className="size-4 text-brand" />یادداشت مشاور</CardTitle></CardHeader><CardContent><Typography variant="muted" className="leading-7">{v.note}</Typography></CardContent></Card></div>
    <Card className="h-fit"><CardContent className="p-4"><Typography variant="h4">وضعیت تطبیق</Typography><div className="my-4 rounded-xl bg-brand/10 p-4 text-center"><Typography as="p" variant="h2" className="text-brand">{request.matches.toLocaleString("fa-IR")}</Typography><Typography variant="small">فایل متناسب پیدا شده</Typography></div><Button className="w-full" variant="outline" nativeButton={false} render={<Link href={routes.properties({ district: v.districts[0], deal: v.requestType === "buy" ? "sale" : "rent" })} />}>مشاهده در جست‌وجو</Button></CardContent></Card></div>
    <section className="mt-6"><Typography as="h2" variant="h3" className="mb-4">فایل‌های پیشنهادی</Typography><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{allListings.slice(0,3).map((listing)=><PropertyCard key={listing.id} estate={listing} />)}</div></section>
  </div>;
}
function formatBudget(value:string){ if(!value) return "توافقی"; return `${Number(value).toLocaleString("fa-IR")} تومان`; }

