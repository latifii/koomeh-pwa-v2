import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Eye, MapPin } from "lucide-react";
import { getPanelProperty,panelProperties } from "@/app/panel/_data/panel";
import { PropertyCard } from "@/components/features/property/property-card";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card,CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/lib/routes";
export const metadata:Metadata={title:"پیش‌نمایش آگهی | پنل کومه"};
export function generateStaticParams(){return panelProperties.map((item)=>({id:item.listing.id}))}
export default async function PropertyPreviewPage({params}:{params:Promise<{id:string}>}){const item=getPanelProperty((await params).id);if(!item)notFound();const listing=item.listing;return <div><PanelPageHeader title="پیش‌نمایش آگهی" description="نمای تقریبی فایل پیش از انتشار عمومی." action={<Button variant="outline" nativeButton={false} render={<Link href={routes.panel.adManagement(listing.id)} />}><ArrowRight />بازگشت به مدیریت</Button>} /><div className="grid gap-5 lg:grid-cols-[340px_1fr]"><PropertyCard estate={listing} /><Card><CardContent className="p-5"><div className="flex items-center gap-2"><Badge variant="secondary">پیش‌نمایش</Badge><Typography variant="small">این صفحه برای کاربران عمومی قابل مشاهده نیست.</Typography></div><Typography as="h2" variant="h2" className="mt-5">{listing.title}</Typography><Typography variant="lead" className="mt-2 flex items-center gap-1"><MapPin className="size-4 text-brand" />{listing.district}، قم</Typography><div className="mt-6 grid gap-3 sm:grid-cols-3">{[["متراژ",`${listing.area} متر`],["تعداد خواب",`${listing.rooms} خواب`],["قیمت",listing.price]].map(([label,value])=><div key={label} className="rounded-xl bg-muted p-4"><Typography variant="small">{label}</Typography><Typography variant="h4" className="mt-1">{value}</Typography></div>)}</div><div className="mt-6 rounded-xl border border-dashed p-5"><Typography variant="h4" className="flex items-center gap-2"><Eye className="size-4 text-brand" />کنترل نهایی</Typography><Typography variant="muted" className="mt-2 leading-7">عنوان، قیمت، محله و مشخصات اصلی را بررسی کنید. تصاویر و اطلاعات تماس پس از اتصال به سرویس بک‌اند از پرونده ملک دریافت می‌شوند.</Typography></div></CardContent></Card></div></div>}

