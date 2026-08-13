import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { PanelPageHeader } from "@/components/layout/panel-page-header";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { ProfileForm } from "./_components/profile-form";
export const metadata:Metadata={title:"پروفایل من | پنل کومه"};
export default function ProfilePage(){return <div><PanelPageHeader title="پروفایل من" description="اطلاعات تماس و مشخصات حساب کاربری را مدیریت کنید." action={<Button variant="outline" nativeButton={false} render={<Link href={routes.panel.security} />}><ShieldCheck />امنیت حساب</Button>} /><ProfileForm /></div>}

