import Link from "next/link";
import { ArrowLeft, Building2, CalendarClock, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import type { PanelRequest } from "@/app/panel/_data/panel";
import { routes } from "@/lib/routes";
import { RequestStatusBadge } from "./request-status-badge";
export function RequestCard({ request }: { request: PanelRequest }) { const v=request.values; return <Card className="border-border/80"><CardContent className="p-4"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><Typography as="h2" variant="h4">{v.name}</Typography><RequestStatusBadge status={request.status} /><Typography variant="small">#{request.id.replace("r-","")}</Typography></div><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"><span className="flex items-center gap-1"><Phone className="size-3.5" />{v.mobile}</span><span className="flex items-center gap-1"><Building2 className="size-3.5" />{v.requestType === "buy" ? "خرید" : "اجاره"} {v.estateType}</span><span className="flex items-center gap-1"><MapPin className="size-3.5" />{v.districts.join("، ") || "قم"}</span><span className="flex items-center gap-1"><CalendarClock className="size-3.5" />پیگیری {request.lastFollowUp}</span></div></div><div className="rounded-lg bg-muted px-3 py-2 text-center"><Typography as="span" variant="h4" className="block text-brand">{request.matches.toLocaleString("fa-IR")}</Typography><Typography variant="small">فایل مناسب</Typography></div><Button variant="outline" nativeButton={false} render={<Link href={routes.panel.request(request.id)} />}>جزئیات<ArrowLeft data-icon="inline-end" /></Button></div></CardContent></Card>; }

