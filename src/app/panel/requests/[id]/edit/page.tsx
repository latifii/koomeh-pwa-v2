import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPanelRequest, panelRequests } from "@/app/panel/_data/panel";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { CustomerRequestForm } from "../../_components/customer-request-form";
export const metadata: Metadata = { title: "ویرایش تقاضا | پنل کومه" };
export function generateStaticParams() { return panelRequests.map(({ id }) => ({ id })); }
export default async function EditRequestPage({ params }: { params: Promise<{id:string}> }) { const request=getPanelRequest((await params).id); if(!request) notFound(); return <div><PanelPageHeader title={`ویرایش تقاضای ${request.values.name}`} description={`شماره پیگیری ${request.id.replace("r-","")}`} /><CustomerRequestForm defaultValues={request.values} submitLabel="ذخیره تغییرات" successMessage="تغییرات تقاضا با موفقیت ذخیره شد." /></div>; }

