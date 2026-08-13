import type { Metadata } from "next";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { AppointmentBoard } from "./_components/appointment-board";
export const metadata:Metadata={title:"قرارهای بازدید | پنل کومه"};
export default function AppointmentsPage(){return <div><PanelPageHeader title="قرارها و بازدیدها" description="جلسات مشاوره، بازدید ملک و کارشناسی قیمت را زمان‌بندی کنید." /><AppointmentBoard /></div>}

