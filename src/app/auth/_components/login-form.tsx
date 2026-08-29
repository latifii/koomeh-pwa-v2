"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, LogIn } from "lucide-react";

import { signInAction } from "@/app/auth/_actions/auth-actions";
import {
  signInSchema,
  type SignInValues,
} from "@/app/auth/_schemas/auth.schema";
import { useSessionStore } from "@/app/auth/_stores/auth.store";
import { FieldMessage } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { AFTER_SIGN_IN, CALLBACK_PARAM, safeCallbackUrl } from "@/lib/auth/routes";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refreshSession = useSessionStore((state) => state.refreshSession);

  const [error, setError] = useState<string>();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { username: "", password: "" },
  });

  const errors = form.formState.errors;

  const onSubmit = (values: SignInValues) => {
    setError(undefined);

    startTransition(async () => {
      const result = await signInAction(values);

      if (!result.ok) {
        setError(result.message);
        form.setValue("password", "");
        form.setFocus("password");
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="username">شماره همراه</Label>
        <InputGroup className="h-12 rounded-xl px-1">
          {/*
           * Chromium forces `direction: ltr` on `input[type=tel]` from its own
           * stylesheet, which is right — a phone number is a left-to-right run
           * of digits. Left alone though, that strands the digits at the far
           * end of the field from the label that names them. `text-end`
           * resolves against the input's own direction, so it seats them at
           * the right edge, beside the label, while they still read and type
           * left to right.
           *
           * The placeholder is in Latin digits because that is what the
           * keyboard produces; the font renders them as Persian either way.
           */}
          <InputGroupInput
            id="username"
            type="tel"
            className="text-end"
            inputMode="numeric"
            autoComplete="username"
            placeholder="09121234567"
            autoFocus
            aria-invalid={Boolean(errors.username)}
            {...form.register("username")}
          />
        </InputGroup>
        <FieldMessage message={errors.username?.message} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">رمز عبور</Label>
        <InputGroup className="h-12 rounded-xl px-1">
          <InputGroupInput
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            {...form.register("password")}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "پنهان کردن رمز" : "نمایش رمز"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <FieldMessage message={errors.password?.message} />
      </div>

      {error && (
        <Typography
          variant="small"
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 leading-6 text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </Typography>
      )}

      <Button
        type="submit"
        size="lg"
        className="mt-1 h-12 w-full rounded-xl text-base"
        disabled={isPending}
      >
        {isPending ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <LogIn data-icon="inline-start" />
        )}
        {isPending ? "در حال ورود…" : "ورود به حساب"}
      </Button>
    </form>
  );
}
