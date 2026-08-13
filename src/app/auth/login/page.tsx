import type { Metadata } from "next";
import { LogIn } from "lucide-react";
import { AuthShell } from "../_components/auth-shell";
import { AuthSwitch, LoginForm } from "../_components/auth-forms";
import { routes } from "@/lib/routes";
export const metadata: Metadata = { title: "ورود به حساب | کومه" };
export default function LoginPage() { return <AuthShell icon={LogIn} title="ورود به حساب کومه" description="برای مدیریت ملک‌ها و درخواست‌های خود وارد شوید." footer={<AuthSwitch prompt="حساب ندارید؟" label="ثبت‌نام" href={routes.auth.register} />}><LoginForm /></AuthShell>; }
