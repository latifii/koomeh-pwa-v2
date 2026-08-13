import type { Metadata } from "next";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { ActivityTimeline } from "./_components/activity-timeline";
export const metadata:Metadata={title:"فعالیت‌ها و پیگیری‌ها | پنل کومه"};
export default function ActivitiesPage(){return <div><PanelPageHeader title="فعالیت‌ها و پیگیری‌ها" description="تماس‌ها، بازدیدها، پیام‌ها و تغییرات پرونده‌های ملک و متقاضی را یکجا ببینید." /><ActivityTimeline /></div>}

