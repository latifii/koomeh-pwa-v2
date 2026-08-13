import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { crmConversations } from "@/app/panel/_data/crm";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { Avatar,AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card,CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/lib/routes";
export const metadata:Metadata={title:"گفت‌وگوها | پنل کومه"};
export default function ConversationsPage(){return <div><PanelPageHeader title="گفت‌وگوها" description="پیام‌های متقاضیان، مالکان و کارشناسان را دنبال کنید." /><Card><CardContent className="divide-y p-0">{crmConversations.map((item)=><Link key={item.id} href={routes.panel.conversation(item.id)} className="flex items-center gap-3 p-4 transition-colors hover:bg-muted/50"><span className="relative"><Avatar className="size-12"><AvatarFallback>{item.name.charAt(0)}</AvatarFallback></Avatar>{item.online&&<span className="absolute bottom-0 end-0 size-3 rounded-full border-2 border-background bg-emerald-500" />}</span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><Typography as="h2" variant="h4">{item.name}</Typography><Typography variant="small">{item.context}</Typography></div><Typography variant="muted" className="mt-1 truncate">{item.lastMessage}</Typography></div><div className="flex flex-col items-end gap-2"><Typography variant="small">{item.time}</Typography>{item.unread>0&&<Badge>{item.unread.toLocaleString("fa-IR")}</Badge>}</div></Link>)}</CardContent></Card><div className="sr-only"><MessageCircle />گفت‌وگوها</div></div>}

