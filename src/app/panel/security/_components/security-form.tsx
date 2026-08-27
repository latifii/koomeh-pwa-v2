"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { KeyRound, LogOut, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { signOutAction } from "@/app/auth/_actions/auth-actions";
import { useSessionStore } from "@/app/auth/_stores/auth.store";
import { changePassword } from "@/app/panel/profile/_api/profile.service";
import {
  changePasswordFormSchema,
  type ChangePasswordValues,
} from "@/app/panel/profile/_schemas/profile.schema";
import { FormTextField, type FormContext } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { useRouter } from "next/navigation";
import { routes } from "@/lib/routes";
import { useTransition } from "react";

/**
 * Password and sessions. Signing out everywhere revokes every token the
 * account holds, including this one, so it ends on the home page.
 */
export function SecuritySettings() {
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: { password: "", password_confirmation: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: ChangePasswordValues) =>
      changePassword(values.password, values.password_confirmation),
    onSuccess: () => {
      form.reset();
      toast.success("رمز عبور شما تغییر کرد.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const context: FormContext<ChangePasswordValues> = {
    control: form.control,
    register: form.register,
    errors: form.formState.errors,
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-4 text-brand" />
            تغییر رمز عبور
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="space-y-5"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <FormTextField
                {...context}
                name="password"
                label="رمز عبور جدید"
                type="password"
                autoComplete="new-password"
                hint="دست‌کم ۶ نویسه"
                required
              />
              <FormTextField
                {...context}
                name="password_confirmation"
                label="تکرار رمز عبور جدید"
                type="password"
                autoComplete="new-password"
                required
              />
            </div>

            <Button disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <ShieldCheck data-icon="inline-start" />
              )}
              ثبت رمز جدید
            </Button>
          </form>
        </CardContent>
      </Card>

      <SignOutEverywhereCard />
    </div>
  );
}

function SignOutEverywhereCard() {
  const clearSession = useSessionStore((state) => state.clearSession);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const signOutEverywhere = () => {
    startTransition(async () => {
      await signOutAction(true);
      clearSession();
      router.replace(routes.home);
      router.refresh();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LogOut className="size-4 text-brand" />
          خروج از همه دستگاه‌ها
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-4">
        <Typography variant="small" className="max-w-md leading-6">
          اگر رمز عبورتان را با کسی به اشتراک گذاشته‌اید یا دستگاهی را از دست
          داده‌اید، با این کار همه‌ی نشست‌های فعال بسته می‌شوند و باید دوباره وارد
          شوید.
        </Typography>
        <Button
          variant="outline"
          className="text-destructive"
          onClick={signOutEverywhere}
          disabled={isPending}
        >
          {isPending ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <LogOut data-icon="inline-start" />
          )}
          خروج از همه دستگاه‌ها
        </Button>
      </CardContent>
    </Card>
  );
}
