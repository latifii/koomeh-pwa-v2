"use client";

import { useState } from "react";
import Link from "next/link";
import { BellRing, Search, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Typography } from "@/components/ui/typography";
import { savedSearches as initialSearches } from "@/app/panel/_data/panel";
import { routes } from "@/lib/routes";

export function SavedSearchList() {
  const [items, setItems] = useState(initialSearches);
  return <div className="grid gap-3">{items.map((item)=><Card key={item.id}><CardContent className="p-4"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand"><Search /></span><div className="min-w-0 flex-1"><Typography as="h2" variant="h4">{item.title}</Typography><Typography variant="small" className="mt-1">{item.summary} · {item.resultCount.toLocaleString("fa-IR")} نتیجه · ذخیره {item.createdAt}</Typography></div><label className="flex items-center gap-2 text-xs"><BellRing className="size-4 text-brand" />اعلان فایل جدید<Switch checked={item.alertsEnabled} onCheckedChange={(checked)=>setItems((current)=>current.map((entry)=>entry.id===item.id?{...entry,alertsEnabled:checked}:entry))} /></label><Button size="sm" variant="outline" nativeButton={false} render={<Link href={routes.properties(item.query)} />}>مشاهده نتایج</Button><Button size="icon-sm" variant="ghost" aria-label="حذف جست‌وجو" onClick={()=>setItems((current)=>current.filter((entry)=>entry.id!==item.id))}><Trash2 /></Button></div></CardContent></Card>)}</div>;
}

