"use client";
import { useState } from "react";
import { Activity, FileText, Home, MessageCircle, Phone, Plus, UserRound, Users } from "lucide-react";
import { crmActivities,type ActivityKind } from "@/app/panel/_data/crm";
import { Button } from "@/components/ui/button";
import { Card,CardContent } from "@/components/ui/card";
import { Tabs,TabsList,TabsTrigger } from "@/components/ui/tabs";
import { Typography } from "@/components/ui/typography";
const icons:Record<ActivityKind,typeof Activity>={call:Phone,visit:Users,message:MessageCircle,note:FileText,status:Activity};
export function ActivityTimeline(){const [filter,setFilter]=useState<"all"|"property"|"request">("all");const items=crmActivities.filter((item)=>filter==="all"||item.subjectType===filter);return <div><div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><Tabs value={filter} onValueChange={(value)=>setFilter(value as typeof filter)}><TabsList><TabsTrigger value="all">همه</TabsTrigger><TabsTrigger value="property"><Home />ملک</TabsTrigger><TabsTrigger value="request"><UserRound />متقاضی</TabsTrigger></TabsList></Tabs><Button size="sm"><Plus />ثبت فعالیت</Button></div><Card><CardContent className="p-4 sm:p-5"><div className="relative space-y-0 before:absolute before:inset-y-4 before:start-5 before:w-px before:bg-border">{items.map((item)=>{const Icon=icons[item.kind];return <div key={item.id} className="relative flex gap-4 pb-6 last:pb-0"><span className="z-10 flex size-10 shrink-0 items-center justify-center rounded-full border bg-background text-brand"><Icon className="size-4" /></span><div className="min-w-0 flex-1 rounded-xl border bg-card p-3"><div className="flex flex-wrap items-start justify-between gap-2"><div><Typography as="h2" variant="h4">{item.title}</Typography><Typography variant="small" className="mt-1">{item.subject}</Typography></div><Typography variant="small">{item.time}</Typography></div><Typography variant="muted" className="mt-2 leading-6">{item.description}</Typography><Typography variant="small" className="mt-2">ثبت‌شده توسط {item.actor}</Typography></div></div>})}</div></CardContent></Card></div>}

