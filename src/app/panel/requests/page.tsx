import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { panelRequests } from "@/app/panel/_data/panel";
import { routes } from "@/lib/routes";
import { RequestCard } from "./_components/request-card";
export const metadata: Metadata = { title: "تقاضاهای ملکی | پنل کومه" };
export default function RequestsPage() { return <div><PanelPageHeader title="تقاضاهای ملکی" description="تقاضاهای ثبت‌شده و فایل‌های متناسب با هر متقاضی را مدیریت کنید." action={<Button nativeButton={false} render={<Link href={routes.panel.newRequest} />}><Plus />ثبت تقاضا</Button>} /><div className="mb-4 flex items-center justify-between rounded-lg border bg-card p-3"><Typography variant="small" className="flex items-center gap-2"><ClipboardList className="size-4 text-brand" />{panelRequests.length.toLocaleString("fa-IR")} تقاضای نمونه</Typography><div className="flex gap-1"><Button size="sm" variant="secondary">همه</Button><Button size="sm" variant="ghost">جدید</Button><Button size="sm" variant="ghost">پیگیری</Button></div></div><div className="grid gap-3">{panelRequests.map((request)=><RequestCard key={request.id} request={request} />)}</div></div>; }

