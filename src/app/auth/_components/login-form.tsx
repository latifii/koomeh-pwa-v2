"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  MessageSquareText,
  Pencil,
  Smartphone,
} from "lucide-react";

import {
  completeSignInAction,
  startSignInAction,
} from "@/app/auth/_actions/auth-actions";
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
import {
  AFTER_SIGN_IN,
  CALLBACK_PARAM,
  safeCallbackUrl,
} from "@/lib/auth/routes";
import { toEnglishDigits } from "@/lib/persian-number";
import { routes } from "@/lib/routes";

const MOBILE_PATTERN = /^09\d{9}$/;
const CODE_LENGTH = 5;
/** How long before a code may be asked for again. */
const RESEND_SECONDS = 60;

type Step =
  | { kind: "mobile" }
  | { kind: "password"; mobile: string }
  | {
      kind: "code";
      mobile: string;
      forgetPass: boolean;
      isNewAccount: boolean;
    };

/**
 * Sign-in and sign-up as one flow, the way the old /login did it and the
 * API's two steps expect:
 *
 * 1. The mobile number. The API answers with what comes next — and creates
 *    the account on the spot for a number it has never seen.
 * 2. The password, when the account has one and did not ask for a code;
 *    otherwise a five-digit code that has just been texted. From the
 *    password step a code can be asked for instead («ورود با کد پیامکی»),
 *    or for a forgotten password, which lands in the panel to set a new one.
 *
 * The number stays visible above step two with a way back to change it,
 * and the code step keeps a resend timer so a lost text is one tap away.
 */
export function LoginForm({
  forgotPassword = false,
}: {
  forgotPassword?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refreshSession = useSessionStore((state) => state.refreshSession);

  const [step, setStep] = useState<Step>({ kind: "mobile" });
  const [mobile, setMobile] = useState("");
  const [secret, setSecret] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [resendIn, setResendIn] = useState(0);
  const [isPending, startTransition] = useTransition();
  const secretRef = useRef<HTMLInputElement>(null);

  // The resend countdown, one tick a second while it is above zero.
  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn(resendIn - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  const normalizedMobile = toEnglishDigits(mobile).replace(/[\s-]/g, "");
  const mobileError =
    mobile && !MOBILE_PATTERN.test(normalizedMobile)
      ? "شماره همراه باید ۱۱ رقم و با ۰۹ شروع شود"
      : undefined;

  const finish = async (mustChangePassword: boolean) => {
    // The cookie now exists; pull it into the store before navigating so the
    // panel renders with a token already attached to axios.
    await refreshSession();
    const callbackUrl =
      safeCallbackUrl(searchParams.get(CALLBACK_PARAM)) ?? AFTER_SIGN_IN;
    router.replace(
      mustChangePassword ? `${routes.panel.profile}#password` : callbackUrl,
    );
    router.refresh();
  };

  /** Step one, or a fresh code from step two. */
  const start = (options: { loginType?: 1 | 2; forgetPass?: boolean }) => {
    setError(undefined);
    setNotice(undefined);
    startTransition(async () => {
      const result = await startSignInAction({ username: mobile }, options);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSecret("");
      if (result.loginType === 1) {
        setStep({ kind: "password", mobile: result.mobile });
      } else {
        setStep({
          kind: "code",
          mobile: result.mobile,
          forgetPass: Boolean(options.forgetPass),
          isNewAccount: result.isNewAccount,
        });
        setResendIn(RESEND_SECONDS);
        setNotice(
          result.isNewAccount
            ? "حساب شما ساخته شد؛ کد تأیید پیامک شد."
            : (result.message ?? "کد تأیید پیامک شد."),
        );
      }
      window.setTimeout(() => secretRef.current?.focus(), 50);
    });
  };

  const complete = (code = secret) => {
    if (step.kind === "mobile") return;
    setError(undefined);
    startTransition(async () => {
      const result = await completeSignInAction({
        mobile: step.mobile,
        code,
        loginType: step.kind === "password" ? 1 : 2,
        forgetPass: step.kind === "code" && step.forgetPass,
      });
      if (!result.ok) {
        setError(result.message);
        setSecret("");
        secretRef.current?.focus();
        return;
      }
      await finish(result.mustChangePassword);
    });
  };

  const backToMobile = () => {
    setStep({ kind: "mobile" });
    setSecret("");
    setError(undefined);
    setNotice(undefined);
  };

  /* ----------------------------------------------------------- step one */
  if (step.kind === "mobile") {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (mobileError || !mobile) {
            setError(mobileError ?? "شماره همراه را وارد کنید");
            return;
          }
          start({ loginType: 1, forgetPass: forgotPassword });
        }}
        className="grid gap-5"
        noValidate
      >
        <div className="grid gap-2">
          <Label htmlFor="mobile">شماره همراه</Label>
          <InputGroup className="h-12 rounded-xl px-1">
            <InputGroupAddon>
              <Smartphone className="text-muted-foreground" />
            </InputGroupAddon>
            {/* `text-end` seats the LTR digits beside the label; see the
                earlier note on Chromium's `input[type=tel]` direction. */}
            <InputGroupInput
              id="mobile"
              type="tel"
              className="text-end"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="09121234567"
              autoFocus
              value={mobile}
              onChange={(event) => {
                setMobile(event.target.value);
                setError(undefined);
              }}
              aria-invalid={Boolean(error)}
            />
          </InputGroup>
          <FieldMessage message={mobileError} />
        </div>

        <Alert message={error} />

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full rounded-xl text-base"
          disabled={isPending}
        >
          {isPending ? <Spinner data-icon="inline-start" /> : null}
          {isPending ? "در حال بررسی…" : "ادامه"}
          {!isPending && <ArrowLeft data-icon="inline-end" />}
        </Button>

        <Typography variant="small" className="text-center leading-6">
          {forgotPassword
            ? "کد بازیابی به همین شماره پیامک می‌شود."
            : "اگر حساب ندارید، با همین شماره ساخته می‌شود."}
        </Typography>
      </form>
    );
  }

  /* ----------------------------------------------------------- step two */
  const isCode = step.kind === "code";

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!secret) {
          setError(isCode ? "کد تأیید را وارد کنید" : "رمز عبور را وارد کنید");
          return;
        }
        complete();
      }}
      className="grid gap-5"
      noValidate
    >
      <MobileLine mobile={step.mobile} onChange={backToMobile} />

      {isCode ? (
        <div className="grid gap-2">
          <Label htmlFor="code">کد تأیید</Label>
          <InputGroup className="h-14 rounded-xl px-1">
            <InputGroupAddon>
              <MessageSquareText className="text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              ref={secretRef}
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={CODE_LENGTH}
              placeholder="— — — — —"
              dir="ltr"
              className="text-center font-heading text-2xl tracking-[0.5em]"
              value={secret}
              onChange={(event) => {
                const digits = toEnglishDigits(event.target.value)
                  .replace(/\D/g, "")
                  .slice(0, CODE_LENGTH);
                setSecret(digits);
                setError(undefined);
                // Five digits is the whole code: submit without a tap.
                if (digits.length === CODE_LENGTH) complete(digits);
              }}
              aria-invalid={Boolean(error)}
            />
          </InputGroup>
          {notice && (
            <Typography variant="small" className="text-success">
              {notice}
            </Typography>
          )}
        </div>
      ) : (
        <div className="grid gap-2">
          <Label htmlFor="password">رمز عبور</Label>
          <InputGroup className="h-12 rounded-xl px-1">
            <InputGroupAddon>
              <KeyRound className="text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              ref={secretRef}
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={secret}
              onChange={(event) => {
                setSecret(event.target.value);
                setError(undefined);
              }}
              aria-invalid={Boolean(error)}
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
        </div>
      )}

      <Alert message={error} />

      <Button
        type="submit"
        size="lg"
        className="h-12 w-full rounded-xl text-base"
        disabled={isPending}
      >
        {isPending && <Spinner data-icon="inline-start" />}
        {isPending ? "در حال ورود…" : "ورود به حساب"}
      </Button>

      {isCode ? (
        <div className="flex items-center justify-center gap-1 text-center">
          <Typography variant="small">کد را دریافت نکردید؟</Typography>
          <Button
            type="button"
            variant="link"
            size="sm"
            disabled={isPending || resendIn > 0}
            onClick={() => start({ loginType: 2, forgetPass: step.forgetPass })}
            className="h-auto p-0 text-brand"
          >
            {resendIn > 0
              ? `ارسال دوباره تا ${resendIn.toLocaleString("fa-IR")} ثانیه دیگر`
              : "ارسال دوباره"}
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Button
            type="button"
            variant="link"
            size="sm"
            disabled={isPending}
            onClick={() => start({ loginType: 2 })}
            className="h-auto p-0 text-brand"
          >
            <MessageSquareText data-icon="inline-start" />
            ورود با کد پیامکی
          </Button>
          <Button
            type="button"
            variant="link"
            size="sm"
            disabled={isPending}
            onClick={() => start({ loginType: 2, forgetPass: true })}
            className="h-auto p-0 text-muted-foreground"
          >
            رمز را فراموش کرده‌ام
          </Button>
        </div>
      )}
    </form>
  );
}

/** The number step two is about, with a way back to change it. */
function MobileLine({
  mobile,
  onChange,
}: {
  mobile: string;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border bg-muted/40 px-3 py-2">
      <Typography as="span" variant="small" className="flex items-center gap-2">
        <Smartphone className="size-4 text-brand" />
        <span className="font-medium text-foreground tabular-nums" dir="ltr">
          {mobile}
        </span>
      </Typography>
      <Button
        type="button"
        variant="ghost"
        size="xs"
        onClick={onChange}
        className="text-brand"
      >
        <Pencil data-icon="inline-start" />
        تغییر شماره
      </Button>
    </div>
  );
}

function Alert({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <Typography
      variant="small"
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 leading-6 text-destructive"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      {message}
    </Typography>
  );
}
