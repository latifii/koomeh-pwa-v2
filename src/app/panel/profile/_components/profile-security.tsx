"use client";

import { useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { KeyRound, LogOut, MonitorSmartphone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { signOutAction } from "@/app/auth/_actions/auth-actions";
import { useSessionStore } from "@/app/auth/_stores/auth.store";
import { changePassword } from "@/app/panel/profile/_api/profile.service";
import {
  changePasswordFormSchema,
  type ChangePasswordValues,
} from "@/app/panel/profile/_schemas/profile.schema";
import { FormPasswordField, type FormContext } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * Four coarse steps, not a score: length, then letters and digits, then
 * mixed case or a symbol. Enough to nudge «123456» toward something better
 * without pretending to measure entropy.
 */
function strength(password: string): {
  level: 0 | 1 | 2 | 3 | 4;
  label: string;
} {
  if (!password) return { level: 0, label: "" };
  let level = 0;
  if (password.length >= 6) level++;
  if (password.length >= 10) level++;
  if (/\d/.test(password) && /[a-zA-Z؀-ۿ]/.test(password)) level++;
  if (
    /[^a-zA-Z0-9؀-ۿ]/.test(password) ||
    (/[a-z]/.test(password) && /[A-Z]/.test(password))
  )
    level++;
  const labels = ["", "ضعیف", "متوسط", "خوب", "قوی"] as const;
  return { level: level as 0 | 1 | 2 | 3 | 4, label: labels[level] };
}

/**
 * Password and sessions — the second half of the old «ویرایش مشخصات» form.
 * Both fields show what is typed on request (the eye), and the new one says
 * how strong it is as it is typed. Signing out everywhere revokes every token
 * the account holds, including this one, so it ends on the home page.
 */
export function ProfileSecurity() {
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: { password: "", password_confirmation: "" },
  });

  const password = useWatch({ control: form.control, name: "password" });
  const meter = useMemo(() => strength(password ?? ""), [password]);

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
    <div className="grid grid-cols-1 gap-4">
      <Card id="password">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-4 text-brand" />
            تغییر رمز عبور
          </CardTitle>
          <CardDescription>
            رمز تازه دست‌کم ۶ نویسه باشد؛ ترکیب حروف و عدد آن را قوی‌تر می‌کند.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <FormPasswordField
                  {...context}
                  name="password"
                  label="رمز عبور جدید"
                  autoComplete="new-password"
                  required
                />
                {/* The meter: four cells that fill left to right in the
                    reading direction, with the word beside them. */}
                <div className="flex items-center gap-2" aria-live="polite">
                  <span className="grid flex-1 grid-cols-4 gap-1" aria-hidden>
                    {[1, 2, 3, 4].map((step) => (
                      <span
                        key={step}
                        className={cn(
                          "h-1.5 rounded-full bg-muted transition-colors",
                          meter.level >= step &&
                            (meter.level <= 1
                              ? "bg-destructive"
                              : meter.level === 2
                                ? "bg-secondary"
                                : "bg-success"),
                        )}
                      />
                    ))}
                  </span>
                  <Typography
                    as="span"
                    variant="small"
                    className="w-12 text-end"
                  >
                    {meter.label}
                  </Typography>
                </div>
              </div>
              <FormPasswordField
                {...context}
                name="password_confirmation"
                label="تکرار رمز عبور جدید"
                autoComplete="new-password"
                required
              />
            </div>

            <Button type="submit" disabled={mutation.isPending}>
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
    <Card id="sessions">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MonitorSmartphone className="size-4 text-brand" />
          دستگاه‌ها و نشست‌ها
        </CardTitle>
        <CardDescription>
          اگر رمز عبورتان را با کسی به اشتراک گذاشته‌اید یا دستگاهی را از دست
          داده‌اید، همه‌ی نشست‌های فعال — از جمله همین یکی — بسته می‌شوند و باید
          دوباره وارد شوید.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
