import type { Metadata } from "next";
import { BadgeCheck } from "lucide-react";
import { AuthShell } from "../_components/auth-shell";
import { VerifyForm } from "../_components/auth-forms";
export const metadata: Metadata = { title: "تأیید شماره همراه | کومه" };
export default function VerifyPage() { return <AuthShell icon={BadgeCheck} title="تأیید شماره همراه" description="کد ارسال‌شده به شماره همراه خود را وارد کنید."><VerifyForm /></AuthShell>; }
