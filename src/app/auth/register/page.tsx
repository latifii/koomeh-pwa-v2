import type { Metadata } from "next";

import { AuthShell } from "../_components/auth-shell";
import { AuthUnavailable } from "../_components/auth-unavailable";

export const metadata: Metadata = { title: "ثبت‌نام | کومه" };

export default function RegisterPage() {
  return (
    <AuthShell
      title="ساخت حساب کاربری"
      description="ثبت‌نام آنلاین هنوز فعال نشده است."
    >
      <AuthUnavailable note="در حال حاضر حساب کاربری توسط دفاتر کومه ساخته می‌شود. برای دریافت حساب با شعبه تماس بگیرید و سپس با شماره همراه و رمز خود وارد شوید." />
    </AuthShell>
  );
}
