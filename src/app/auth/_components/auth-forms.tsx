"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, KeyRound, LogIn, Mail, Phone, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Typography } from "@/components/ui/typography";
import { routes } from "@/lib/routes";

function useStaticSubmit() {
  const [submitted, setSubmitted] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };
  return { submitted, submit };
}

function SuccessNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
      <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
      {children}
    </div>
  );
}

export function LoginForm() {
  const { submitted, submit } = useStaticSubmit();
  return (
    <form onSubmit={submit} className="space-y-4">
      <FieldGroup>
        <Field><FieldLabel htmlFor="login-mobile">شماره همراه</FieldLabel><Input id="login-mobile" type="tel" inputMode="numeric" placeholder="۰۹۱۲ ۰۰۰ ۰۰۰۰" required /></Field>
        <Field><FieldLabel htmlFor="login-password">رمز عبور</FieldLabel><Input id="login-password" type="password" placeholder="رمز عبور" required /></Field>
      </FieldGroup>
      <div className="flex justify-end"><Link href={routes.auth.forgotPassword} className="text-xs text-brand hover:underline">رمز عبور را فراموش کرده‌اید؟</Link></div>
      <Button className="w-full" size="lg"><LogIn />ورود به حساب</Button>
      {submitted && <SuccessNotice>فرم ورود آماده اتصال به سرویس احراز هویت است.</SuccessNotice>}
    </form>
  );
}

export function RegisterForm() {
  const { submitted, submit } = useStaticSubmit();
  return (
    <form onSubmit={submit} className="space-y-4">
      <FieldGroup>
        <Field><FieldLabel htmlFor="register-name">نام و نام خانوادگی</FieldLabel><Input id="register-name" placeholder="نام کامل" required /></Field>
        <Field><FieldLabel htmlFor="register-mobile">شماره همراه</FieldLabel><Input id="register-mobile" type="tel" inputMode="numeric" placeholder="۰۹۱۲ ۰۰۰ ۰۰۰۰" required /></Field>
        <Field><FieldLabel htmlFor="register-password">رمز عبور</FieldLabel><Input id="register-password" type="password" placeholder="حداقل ۸ کاراکتر" minLength={8} required /></Field>
      </FieldGroup>
      <Button className="w-full" size="lg"><UserRound />ساخت حساب کاربری</Button>
      {submitted && <SuccessNotice>اطلاعات ثبت شد؛ در نسخه متصل به API کد تأیید ارسال می‌شود.</SuccessNotice>}
    </form>
  );
}

export function VerifyForm() {
  const { submitted, submit } = useStaticSubmit();
  return (
    <form onSubmit={submit} className="space-y-5">
      <Field><FieldLabel>کد شش‌رقمی</FieldLabel><InputOTP maxLength={6} required containerClassName="justify-center" inputMode="numeric"><InputOTPGroup>{Array.from({ length: 6 }, (_, index) => <InputOTPSlot key={index} index={index} className="size-11" />)}</InputOTPGroup></InputOTP></Field>
      <Button className="w-full" size="lg"><Phone />تأیید شماره همراه</Button>
      {submitted && <SuccessNotice>شماره همراه با موفقیت تأیید شد.</SuccessNotice>}
      <button type="button" className="mx-auto block text-xs text-brand hover:underline">ارسال دوباره کد</button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const { submitted, submit } = useStaticSubmit();
  return (
    <form onSubmit={submit} className="space-y-4">
      <Field><FieldLabel htmlFor="forgot-mobile">شماره همراه</FieldLabel><Input id="forgot-mobile" type="tel" inputMode="numeric" placeholder="۰۹۱۲ ۰۰۰ ۰۰۰۰" required /></Field>
      <Button className="w-full" size="lg"><Mail />ارسال کد بازیابی</Button>
      {submitted && <SuccessNotice>کد بازیابی برای شماره واردشده آماده ارسال است.</SuccessNotice>}
    </form>
  );
}

export function ResetPasswordForm() {
  const { submitted, submit } = useStaticSubmit();
  return (
    <form onSubmit={submit} className="space-y-4">
      <FieldGroup>
        <Field><FieldLabel htmlFor="reset-code">کد بازیابی</FieldLabel><Input id="reset-code" inputMode="numeric" placeholder="کد شش‌رقمی" required /></Field>
        <Field><FieldLabel htmlFor="reset-password">رمز عبور جدید</FieldLabel><Input id="reset-password" type="password" minLength={8} placeholder="حداقل ۸ کاراکتر" required /></Field>
      </FieldGroup>
      <Button className="w-full" size="lg"><KeyRound />تغییر رمز عبور</Button>
      {submitted && <SuccessNotice>رمز عبور جدید با موفقیت ثبت شد.</SuccessNotice>}
    </form>
  );
}

export function AuthSwitch({ prompt, label, href }: { prompt: string; label: string; href: string }) {
  return <Typography variant="small">{prompt} <Link href={href} className="inline-flex items-center gap-1 font-medium text-brand hover:underline">{label}<ArrowLeft className="size-3" /></Link></Typography>;
}

