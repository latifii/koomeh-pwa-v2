"use client";
import { useState } from "react";
import Link from "next/link";
import { CalendarClock, CheckCircle2, Circle, CircleDot, Plus } from "lucide-react";
import { crmTasks,type CrmTaskStatus } from "@/app/panel/_data/crm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card,CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/lib/routes";
const statusMeta:Record<CrmTaskStatus,{label:string;icon:typeof Circle}>={todo:{label:"برای انجام",icon:Circle},doing:{label:"در حال انجام",icon:CircleDot},done:{label:"انجام‌شده",icon:CheckCircle2}};
export function TaskList(){const [items,setItems]=useState(crmTasks);return <div><div className="mb-4 flex justify-end"><Button nativeButton={false} render={<Link href={routes.panel.newTask} />}><Plus />وظیفه جدید</Button></div><div className="grid gap-3">{items.map((task)=>{const meta=statusMeta[task.status];return <Card key={task.id}><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"><button onClick={()=>setItems((current)=>current.map((item)=>item.id===task.id?{...item,status:item.status==="done"?"todo":"done"}:item))} className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-brand" aria-label="تغییر وضعیت"><meta.icon /></button><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><Link href={routes.panel.task(task.id)}><Typography as="h2" variant="h4" className="hover:text-brand">{task.title}</Typography></Link><Badge variant={task.priority==="high"?"destructive":"outline"}>{task.priority==="high"?"فوری":task.priority==="normal"?"عادی":"کم"}</Badge></div><Typography variant="small" className="mt-1">{task.relatedTo} · مسئول: {task.assignee}</Typography></div><span className="flex items-center gap-1 text-xs text-muted-foreground"><CalendarClock className="size-4" />{task.dueAt}</span><Badge variant="secondary">{meta.label}</Badge></CardContent></Card>})}</div></div>}

