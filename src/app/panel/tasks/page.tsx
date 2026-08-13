import type { Metadata } from "next";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { TaskList } from "./_components/task-list";
export const metadata:Metadata={title:"وظایف | پنل کومه"};
export default function TasksPage(){return <div><PanelPageHeader title="وظایف" description="پیگیری‌های روزانه و کارهای مرتبط با ملک‌ها و متقاضیان را مدیریت کنید." /><TaskList /></div>}

