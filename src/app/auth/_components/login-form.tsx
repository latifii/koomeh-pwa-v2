"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, LogIn } from "lucide-react";

import { signInAction } from "@/app/auth/_actions/auth-actions";
import {
  signInSchema,
  type SignInValues,
} from "@/app/auth/_schemas/auth.schema";
import { useSessionStore } from "@/app/auth/_stores/auth.store";
import { FormTextField, type FormContext } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { AFTER_SIGN_IN, CALLBACK_PARAM, safeCallbackUrl } from "@/lib/auth/routes";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refreshSession = useSessionStore((state) => state.refreshSession);

  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { username: "", password: "" },
  });

  const context: FormContext<SignInValues> = {
    control: form.control,
    register: form.register,
    errors: form.formState.errors,
  };

  const onSubmit = (values: SignInValues) => {
    setError(undefined);

    startTransition(async () => {
      const result = await signInAction(values);

      if (!result.ok) {
        setError(result.message);
        form.setValue("password", "");
        return;
      }

      // The cookie now exists; pull it into the store before navigating so the
      // panel renders with a token already attached to axios.
      await refreshSession();

      const callbackUrl =
        safeCallbackUrl(searchParams.get(CALLBACK_PARAM)) ?? AFTER_SIGN_IN;

      router.replace(callbackUrl);
      router.refresh();
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid gap-5">
        <FormTextField
          {...context}
          name="username"
          label="شماره همراه"
          type="tel"
          inputMode="numeric"
          autoComplete="username"
          placeholder="۰۹۱۲۰۰۰۰۰۰۰"
          required
        />
        <FormTextField
          {...context}
          name="password"
          label="رمز عبور"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>

      {error && (
        <Typography
          variant="small"
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </Typography>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? <Spinner data-icon="inline-start" /> : <LogIn data-icon="inline-start" />}
        ورود به حساب
      </Button>
    </form>
  );
}
