import type { Metadata } from "next";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { TaskForm } from "../_components/task-form";
export const metadata:Metadata={title:"وظیفه جدید | پنل کومه"};
export default function NewTaskPage(){return <div><PanelPageHeader title="وظیفه جدید" description="یک پیگیری یا کار جدید برای خود یا اعضای تیم ایجاد کنید." /><TaskForm /></div>}

