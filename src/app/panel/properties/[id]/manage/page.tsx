import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPanelProperty,panelProperties } from "@/app/panel/_data/panel";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { AdManagement } from "./_components/ad-management";
export const metadata:Metadata={title:"مدیریت آگهی | پنل کومه"};
export function generateStaticParams(){return panelProperties.map((item)=>({id:item.listing.id}))}
export default async function ManageAdPage({params}:{params:Promise<{id:string}>}){const item=getPanelProperty((await params).id);if(!item)notFound();return <div><PanelPageHeader title="مدیریت آگهی" description="وضعیت انتشار، عملکرد و ارتقای فایل را مدیریت کنید." /><AdManagement item={item} /></div>}

