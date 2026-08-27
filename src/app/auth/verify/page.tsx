import type { Metadata } from "next";
import { BadgeCheck } from "lucide-react";

import { AuthShell } from "../_components/auth-shell";
import { AuthUnavailable } from "../_components/auth-unavailable";

export const metadata: Metadata = { title: "تأیید شماره همراه | کومه" };

export default function VerifyPage() {
  return (
    <AuthShell
      icon={BadgeCheck}
      title="تأیید شماره همراه"
      description="تأیید شماره با کد پیامکی هنوز فعال نشده است."
    >
      <AuthUnavailable note="ورود در حال حاضر با شماره همراه و رمز عبور انجام می‌شود و به کد تأیید نیازی ندارد." />
    </AuthShell>
  );
}
