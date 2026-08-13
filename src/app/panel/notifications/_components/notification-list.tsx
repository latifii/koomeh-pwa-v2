"use client";
import { useState } from "react";
import Link from "next/link";
import { Bell, Building2, CheckCheck, Home, MessageCircle } from "lucide-react";
import { panelNotifications as initialNotifications, type NotificationKind } from "@/app/panel/_data/panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
const icons: Record<NotificationKind, typeof Bell> = { match: Home, property: Building2, account: Bell, message: MessageCircle };
export function NotificationList(){const [items,setItems]=useState(initialNotifications);return <div><div className="mb-4 flex justify-end"><Button variant="ghost" size="sm" onClick={()=>setItems((current)=>current.map((item)=>({...item,read:true})))}><CheckCheck />خواندن همه</Button></div><div className="grid gap-2">{items.map((item)=>{const Icon=icons[item.kind];const content=<Card className={cn("transition-colors",!item.read&&"border-brand/30 bg-brand/5")}><CardContent className="flex items-start gap-3 p-4"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-brand"><Icon className="size-5" /></span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><Typography as="h2" variant="h4">{item.title}</Typography>{!item.read&&<span className="size-2 rounded-full bg-brand" />}</div><Typography variant="small" className="mt-1 leading-5">{item.description}</Typography><Typography variant="small" className="mt-2 text-[11px]">{item.time}</Typography></div></CardContent></Card>;return item.href?<Link key={item.id} href={item.href} onClick={()=>setItems((current)=>current.map((entry)=>entry.id===item.id?{...entry,read:true}:entry))}>{content}</Link>:<div key={item.id}>{content}</div>})}</div></div>}

