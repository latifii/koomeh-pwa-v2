import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarClock,CheckCircle2,Link2,UserRound } from "lucide-react";
import { crmTasks,getCrmTask } from "@/app/panel/_data/crm";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card,CardContent,CardHeader,CardTitle } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
export function generateStaticParams(){return crmTasks.map(({id})=>({id}))}
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{const task=getCrmTask((await params).id);return{title:task?`${task.title} | وظایف`:"وظیفه یافت نشد"}}
export default async function TaskDetailPage({params}:{params:Promise<{id:string}>}){const task=getCrmTask((await params).id);if(!task)notFound();return <div><PanelPageHeader title={task.title} description={`شناسه ${task.id.replace("t-","")}`} action={<Button><CheckCircle2 />علامت‌گذاری انجام‌شده</Button>} /><Card><CardHeader className="flex-row items-center justify-between"><CardTitle>جزئیات وظیفه</CardTitle><Badge variant={task.priority==="high"?"destructive":"secondary"}>{task.priority==="high"?"فوری":"عادی"}</Badge></CardHeader><CardContent><Typography variant="muted" className="leading-7">{task.description}</Typography><div className="mt-6 grid gap-3 sm:grid-cols-3">{[{icon:CalendarClock,label:"مهلت انجام",value:task.dueAt},{icon:UserRound,label:"مسئول",value:task.assignee},{icon:Link2,label:"مرتبط با",value:task.relatedTo}].map((item)=><div key={item.label} className="flex gap-3 rounded-lg bg-muted p-3"><item.icon className="size-4 text-brand" /><span><Typography variant="small">{item.label}</Typography><Typography variant="body" className="mt-1 font-medium">{item.value}</Typography></span></div>)}</div></CardContent></Card></div>}

