import type { Metadata } from "next";
import { KeyRound } from "lucide-react";
import { AuthShell } from "../_components/auth-shell";
import { ResetPasswordForm } from "../_components/auth-forms";
export const metadata: Metadata = { title: "تغییر رمز عبور | کومه" };
export default function ResetPasswordPage() { return <AuthShell icon={KeyRound} title="انتخاب رمز عبور جدید" description="کد بازیابی و رمز عبور جدید خود را وارد کنید."><ResetPasswordForm /></AuthShell>; }
