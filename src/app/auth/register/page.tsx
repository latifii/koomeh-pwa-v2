import type { Metadata } from "next";
import { UserPlus } from "lucide-react";
import { AuthShell } from "../_components/auth-shell";
import { AuthSwitch, RegisterForm } from "../_components/auth-forms";
import { routes } from "@/lib/routes";
export const metadata: Metadata = { title: "ثبت‌نام | کومه" };
export default function RegisterPage() { return <AuthShell icon={UserPlus} title="ساخت حساب کاربری" description="با یک حساب، فایل‌ها و تقاضاهای ملکی خود را یکجا مدیریت کنید." footer={<AuthSwitch prompt="قبلاً ثبت‌نام کرده‌اید؟" label="ورود" href={routes.auth.login} />}><RegisterForm /></AuthShell>; }
