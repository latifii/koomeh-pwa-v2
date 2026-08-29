import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/lib/routes";

import { AuthShell } from "../_components/auth-shell";
import { LoginForm } from "../_components/login-form";

export const metadata: Metadata = {
  title: "ورود به حساب | کومه",
  description: "ورود به حساب کاربری گروه املاک کومه.",
  // Nothing here should be indexed or followed into.
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <AuthShell
      title="ورود به حساب کومه"
      description="با شماره همراه و رمزی که از دفتر کومه گرفته‌اید وارد شوید."
      footer={
        <Typography variant="small" className="leading-6">
          حساب ندارید؟{" "}
          <Link
            href={routes.contact}
            className="font-medium text-brand hover:underline"
          >
            با ما تماس بگیرید
          </Link>{" "}
          — حساب‌ها توسط دفاتر کومه ساخته می‌شوند.
        </Typography>
      }
    >
      {/* The form reads `callbackUrl` from the query string. */}
      <Suspense fallback={<Skeleton className="h-56 w-full rounded-xl" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
