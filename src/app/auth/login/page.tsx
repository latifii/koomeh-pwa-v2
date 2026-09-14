import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/lib/routes";

import { AuthShell } from "../_components/auth-shell";
import { LoginForm } from "../_components/login-form";

export const metadata: Metadata = {
  title: "ورود یا ثبت‌نام | کومه",
  description: "ورود به حساب کاربری گروه املاک کومه با شماره همراه.",
  // Nothing here should be indexed or followed into.
  robots: { index: false, follow: false },
};

/**
 * Sign-in and sign-up are one door: the number first, then the password or
 * a texted code, and a number the site has never seen gets an account on
 * the spot. `?forgot=1` — where the old «فراموشی رمز» page sends — starts
 * the same flow with a recovery code instead of the password.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ forgot?: string }>;
}) {
  const forgotPassword = (await searchParams).forgot === "1";

  return (
    <AuthShell
      title={forgotPassword ? "بازیابی رمز عبور" : "ورود یا ثبت‌نام"}
      description={
        forgotPassword
          ? "شماره همراه را وارد کنید تا کد بازیابی پیامک شود؛ بعد از ورود رمز تازه‌ای می‌گذارید."
          : "شماره همراه را وارد کنید؛ با رمز عبور یا کد پیامکی وارد می‌شوید."
      }
      footer={
        <Typography variant="small" className="leading-6">
          مشکلی در ورود دارید؟{" "}
          <Link
            href={routes.contact}
            className="font-medium text-brand hover:underline"
          >
            با ما تماس بگیرید
          </Link>
        </Typography>
      }
    >
      {/* The form reads `callbackUrl` from the query string. */}
      <Suspense fallback={<Skeleton className="h-56 w-full rounded-xl" />}>
        <LoginForm forgotPassword={forgotPassword} />
      </Suspense>
    </AuthShell>
  );
}
