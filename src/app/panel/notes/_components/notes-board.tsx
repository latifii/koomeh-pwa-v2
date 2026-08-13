"use client";
import { useState } from "react";
import { Plus, StickyNote, Trash2 } from "lucide-react";
import { panelNotes as initialNotes, type PanelNote } from "@/app/panel/_data/panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
const colors:Record<PanelNote["color"],string>={amber:"border-amber-400/30 bg-amber-400/10",blue:"border-blue-400/30 bg-blue-400/10",green:"border-emerald-400/30 bg-emerald-400/10"};
export function NotesBoard(){const [notes,setNotes]=useState(initialNotes);const [title,setTitle]=useState("");const [body,setBody]=useState("");const add=()=>{if(!title.trim()||!body.trim())return;setNotes((current)=>[{id:`note-${Date.now()}`,title,body,relatedTo:"یادداشت عمومی",updatedAt:"اکنون",color:"amber"},...current]);setTitle("");setBody("")};return <div className="grid gap-5 lg:grid-cols-[320px_1fr]"><Card className="h-fit"><CardContent className="space-y-3 p-4"><Typography variant="h4" className="flex items-center gap-2"><Plus className="size-4 text-brand" />یادداشت جدید</Typography><Input value={title} onChange={(event)=>setTitle(event.target.value)} placeholder="عنوان یادداشت" /><Textarea value={body} onChange={(event)=>setBody(event.target.value)} placeholder="متن یادداشت..." rows={5} /><Button className="w-full" onClick={add}>ذخیره یادداشت</Button></CardContent></Card><div className="grid gap-3 sm:grid-cols-2">{notes.map((note)=><Card key={note.id} className={cn("h-fit",colors[note.color])}><CardContent className="p-4"><div className="flex items-start justify-between"><StickyNote className="size-5 text-brand" /><Button size="icon-sm" variant="ghost" onClick={()=>setNotes((current)=>current.filter((item)=>item.id!==note.id))}><Trash2 /></Button></div><Typography as="h2" variant="h4" className="mt-3">{note.title}</Typography><Typography variant="muted" className="mt-2 leading-6">{note.body}</Typography><div className="mt-4 flex justify-between border-t pt-3"><Typography variant="small">{note.relatedTo}</Typography><Typography variant="small">{note.updatedAt}</Typography></div></CardContent></Card>)}</div></div>}

