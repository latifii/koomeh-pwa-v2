import type { Metadata } from "next";
import { KeyRound } from "lucide-react";
import { AuthShell } from "../_components/auth-shell";
import { AuthSwitch, ForgotPasswordForm } from "../_components/auth-forms";
import { routes } from "@/lib/routes";
export const metadata: Metadata = { title: "بازیابی رمز عبور | کومه" };
export default function ForgotPasswordPage() { return <AuthShell icon={KeyRound} title="بازیابی رمز عبور" description="شماره همراه حساب خود را وارد کنید تا کد بازیابی ارسال شود." footer={<AuthSwitch prompt="رمز عبور را به خاطر آوردید؟" label="بازگشت به ورود" href={routes.auth.login} />}><ForgotPasswordForm /></AuthShell>; }
