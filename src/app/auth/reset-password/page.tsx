import type { Metadata } from "next";

import { AuthShell } from "../_components/auth-shell";
import { AuthUnavailable } from "../_components/auth-unavailable";

export const metadata: Metadata = { title: "تغییر رمز عبور | کومه" };

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="انتخاب رمز عبور جدید"
      description="بازنشانی رمز با کد بازیابی هنوز فعال نشده است."
    >
      <AuthUnavailable note="تغییر رمز عبور در حال حاضر فقط از بخش «امنیت حساب» و پس از ورود به حساب امکان‌پذیر است." />
    </AuthShell>
  );
}
