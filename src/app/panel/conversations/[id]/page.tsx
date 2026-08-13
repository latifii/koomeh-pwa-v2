import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { crmConversations,getConversation } from "@/app/panel/_data/crm";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { Card,CardContent } from "@/components/ui/card";
import { ChatThread } from "./_components/chat-thread";
export function generateStaticParams(){return crmConversations.map(({id})=>({id}))}
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{const item=getConversation((await params).id);return{title:item?`گفت‌وگو با ${item.name}`:"گفت‌وگو یافت نشد"}}
export default async function ConversationPage({params}:{params:Promise<{id:string}>}){const item=getConversation((await params).id);if(!item)notFound();return <div><PanelPageHeader title={item.name} description={item.context} /><Card><CardContent className="p-4"><ChatThread conversation={item} /></CardContent></Card></div>}

