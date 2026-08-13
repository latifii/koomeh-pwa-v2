"use client";
import { useState } from "react";
import { Send } from "lucide-react";
import type { Conversation } from "@/app/panel/_data/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
export function ChatThread({conversation}:{conversation:Conversation}){const [messages,setMessages]=useState(conversation.messages);const [text,setText]=useState("");const send=()=>{if(!text.trim())return;setMessages((current)=>[...current,{id:String(Date.now()),sender:"me",text:text.trim(),time:"اکنون"}]);setText("")};return <div className="flex min-h-[520px] flex-col"><div className="flex-1 space-y-3 overflow-y-auto rounded-xl bg-muted/40 p-4">{messages.map((message)=><div key={message.id} className={cn("flex",message.sender==="me"?"justify-start":"justify-end")}><div className={cn("max-w-[80%] rounded-2xl px-4 py-2.5",message.sender==="me"?"bg-brand text-white":"border bg-background")}><Typography variant="body" className={cn("leading-6",message.sender==="me"&&"text-white")}>{message.text}</Typography><span className={cn("mt-1 block text-[10px]",message.sender==="me"?"text-white/70":"text-muted-foreground")}>{message.time}</span></div></div>)}</div><form onSubmit={(event)=>{event.preventDefault();send()}} className="mt-3 flex gap-2"><Input value={text} onChange={(event)=>setText(event.target.value)} placeholder="پیام خود را بنویسید..." /><Button size="icon" aria-label="ارسال پیام"><Send /></Button></form></div>}

