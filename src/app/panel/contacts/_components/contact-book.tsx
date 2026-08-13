"use client";
import { useMemo,useState } from "react";
import { Building2,Phone,Search,UserRound,Users } from "lucide-react";
import { crmContacts } from "@/app/panel/_data/crm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card,CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";
const typeMeta={customer:{label:"متقاضی",icon:Users},owner:{label:"مالک",icon:Building2},agent:{label:"کارشناس",icon:UserRound}};
export function ContactBook(){const [query,setQuery]=useState("");const items=useMemo(()=>crmContacts.filter((item)=>`${item.name} ${item.mobile}`.includes(query)),[query]);return <div><div className="relative mb-4"><Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="جست‌وجوی نام یا شماره همراه" className="ps-9" /></div><div className="grid gap-3 sm:grid-cols-2">{items.map((contact)=>{const meta=typeMeta[contact.type];return <Card key={contact.id}><CardContent className="flex items-center gap-3 p-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand"><meta.icon /></span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><Typography as="h2" variant="h4">{contact.name}</Typography><Badge variant="outline">{meta.label}</Badge></div><Typography variant="small" className="mt-1">{contact.description}</Typography><Typography variant="small" className="mt-1">آخرین تماس: {contact.lastContact}</Typography></div><Button size="icon" variant="outline" nativeButton={false} render={<a href={`tel:${contact.mobile}`} aria-label={`تماس با ${contact.name}`} />}><Phone /></Button></CardContent></Card>})}</div></div>}

