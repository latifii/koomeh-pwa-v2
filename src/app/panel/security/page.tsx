import type { Metadata } from "next";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { SecuritySettings } from "./_components/security-form";
export const metadata:Metadata={title:"امنیت حساب | پنل کومه"};
export default function SecurityPage(){return <div><PanelPageHeader title="امنیت حساب" description="رمز عبور، ورود دومرحله‌ای و دستگاه‌های فعال را مدیریت کنید." /><SecuritySettings /></div>}

