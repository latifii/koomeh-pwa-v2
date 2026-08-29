import type { Metadata } from "next";

import { AuthShell } from "../_components/auth-shell";
import { AuthUnavailable } from "../_components/auth-unavailable";

export const metadata: Metadata = { title: "بازیابی رمز عبور | کومه" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="بازیابی رمز عبور"
      description="بازیابی خودکار رمز عبور هنوز فعال نشده است."
    >
      <AuthUnavailable note="برای بازنشانی رمز عبور با کارشناس شعبه خود تماس بگیرید. اگر وارد حساب هستید، می‌توانید رمز را از بخش «امنیت حساب» در پنل تغییر دهید." />
    </AuthShell>
  );
}
