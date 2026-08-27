import type { Metadata } from "next";
import { Suspense } from "react";
import { LogIn } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

import { AuthShell } from "../_components/auth-shell";
import { LoginForm } from "../_components/login-form";

export const metadata: Metadata = { title: "ورود به حساب | کومه" };

export default function LoginPage() {
  return (
    <AuthShell
      icon={LogIn}
      title="ورود به حساب کومه"
      description="برای مدیریت ملک‌ها و درخواست‌های خود وارد شوید."
    >
      {/* The form reads `callbackUrl` from the query string. */}
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
