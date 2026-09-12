"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AtSign,
  Clock,
  KeyRound,
  MonitorSmartphone,
  Save,
  Share2,
  Undo2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { syncSessionUserAction } from "@/app/auth/_actions/auth-actions";
import { useSessionStore } from "@/app/auth/_stores/auth.store";
import {
  removeProfilePhoto,
  updateProfile,
  uploadProfilePhoto,
} from "@/app/panel/profile/_api/profile.service";
import { profileQueryKeys } from "@/app/panel/profile/_constants/profile-query-keys";
import { profileQueryOptions } from "@/app/panel/profile/_queries/profile.query";
import {
  profileFormSchema,
  type ProfileFormValues,
} from "@/app/panel/profile/_schemas/profile.schema";
import {
  IconEitaa,
  IconInstagram,
  IconTelegram,
  IconWhatsapp,
} from "@/components/icons/social-icons";
import { AvatarUploader } from "@/components/shared/avatar-uploader";
import {
  FieldMessage,
  FormDateField,
  FormTextField,
  FormTextareaField,
  type FormContext,
} from "@/components/shared/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { toAbsoluteMediaUrl } from "@/lib/api/config";
import { cn } from "@/lib/utils";

import { ProfileSecurity } from "./profile-security";

/** The four networks the old form had, with the icon and prefix each expects. */
const SOCIALS: ReadonlyArray<{
  name: "telegram" | "whatsapp" | "instagram" | "eitaa";
  label: string;
  icon: typeof IconTelegram;
  prefix: string;
  placeholder: string;
  hint: string;
}> = [
  {
    name: "telegram",
    label: "تلگرام",
    icon: IconTelegram,
    prefix: "@",
    placeholder: "koomeh",
    hint: "نام کاربری، بدون @",
  },
  {
    name: "whatsapp",
    label: "واتساپ",
    icon: IconWhatsapp,
    prefix: "+98",
    placeholder: "9121234567",
    hint: "شماره‌ای که واتساپ رویش فعال است",
  },
  {
    name: "instagram",
    label: "اینستاگرام",
    icon: IconInstagram,
    prefix: "@",
    placeholder: "koomeh.ir",
    hint: "نام کاربری صفحه",
  },
  {
    name: "eitaa",
    label: "ایتا",
    icon: IconEitaa,
    prefix: "@",
    placeholder: "koomeh",
    hint: "نام کاربری، بدون @",
  },
];

const empty: ProfileFormValues = {
  name: "",
  last_name: "",
  email: "",
  phone: "",
  birthday: "",
  alias: "",
  bio: "",
  telegram: "",
  whatsapp: "",
  instagram: "",
  eitaa: "",
};

/**
 * «ویرایش مشخصات» — the old /profile/info_v2, laid out as the page it should
 * have been: the picture and who you are on one side, the details, the social
 * networks and the security cards on the other, with the section links up top
 * so the long page reads as four short ones.
 *
 * One form covers the details and the networks, saved together — the API
 * takes them in one PUT and changes only what is sent. The photo has its own
 * round trip because it is a file, and the password its own form because it
 * is not a profile field. What waits for an administrator (the display name,
 * the bio, a new photo) is said where it is edited and again in the summary,
 * so a change that has not shown up yet is not mistaken for one that failed.
 */
export function ProfileForm() {
  const queryClient = useQueryClient();
  const profile = useQuery(profileQueryOptions());
  const applySession = useSessionStore((state) => state.applySession);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: empty,
  });

  const { reset } = form;
  const data = profile.data;

  // The form is only filled once the account has loaded.
  useEffect(() => {
    if (!data) return;
    reset({
      name: data.name ?? "",
      last_name: data.last_name ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      birthday: data.birthday_jalali ?? "",
      alias: data.alias?.value ?? "",
      bio: data.bio?.pending_value ?? data.bio?.value ?? "",
      telegram: data.telegram ?? "",
      whatsapp: data.whatsapp ?? "",
      instagram: data.instagram ?? "",
      eitaa: data.eitaa ?? "",
    });
  }, [data, reset]);

  const refreshEverywhere = async () => {
    await queryClient.invalidateQueries({
      queryKey: profileQueryKeys.detail(),
    });
    // The header shows the user's name and picture, and both live in the
    // session cookie — so the cookie has to be re-minted, not merely re-read.
    applySession(await syncSessionUserAction());
  };

  const mutation = useMutation({
    mutationFn: (values: ProfileFormValues) =>
      updateProfile({
        name: values.name || null,
        last_name: values.last_name || null,
        email: values.email || null,
        phone: values.phone || null,
        birthday: values.birthday || null,
        alias: values.alias || null,
        bio: values.bio || null,
        telegram: values.telegram || null,
        whatsapp: values.whatsapp || null,
        instagram: values.instagram || null,
        eitaa: values.eitaa || null,
      }),
    onSuccess: async (response) => {
      await refreshEverywhere();
      toast.success(response.result.message ?? "اطلاعات ذخیره شد.");
      if (response.result.pending.length > 0) {
        toast.info("نام مستعار و معرفی پس از تأیید مدیر نمایش داده می‌شوند.");
      }
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const context: FormContext<ProfileFormValues> = {
    control: form.control,
    register: form.register,
    errors: form.formState.errors,
  };

  if (profile.isPending) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
        <Skeleton className="h-80 rounded-xl" />
        <div className="grid gap-4">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
      </div>
    );
  }

  if (profile.isError || !data) {
    return (
      <Typography variant="small" className="text-destructive">
        {profile.error
          ? getApiErrorMessage(profile.error)
          : "مشخصات بارگذاری نشد."}
      </Typography>
    );
  }

  const fullName =
    [data.name, data.last_name].filter(Boolean).join(" ") || "کاربر کومه";
  // The API answers with the stock avatar when there is no photo; that is
  // not a photo to «change» or «remove».
  const rawPhoto = toAbsoluteMediaUrl(data.photo ?? null);
  const photo =
    rawPhoto && !/\/avatar_(?:man|women)\.png(?:[?#].*)?$/i.test(rawPhoto)
      ? rawPhoto
      : null;
  const pending = [
    data.alias?.pending && "نام مستعار",
    data.bio?.pending && "معرفی",
  ].filter(Boolean) as string[];
  const { isDirty } = form.formState;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_1fr]">
      {/* ------------------------------------------------------------ who */}
      <div className="grid content-start gap-4 lg:sticky lg:top-20">
        <Card>
          <CardContent className="grid gap-4 p-5">
            <AvatarUploader
              src={photo}
              name={fullName}
              upload={uploadProfilePhoto}
              remove={removeProfilePhoto}
              onChanged={() => void refreshEverywhere()}
            />

            <div className="text-center">
              <Typography variant="h4">{fullName}</Typography>
              {data.alias?.value && (
                <Typography variant="small">«{data.alias.value}»</Typography>
              )}
              <Typography variant="small" className="tabular-nums" dir="ltr">
                {data.username}
              </Typography>
              <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                {data.is_expert && <Badge variant="secondary">کارشناس</Badge>}
                {pending.length > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <Clock className="size-3" />
                    {pending.join(" و ")} در انتظار تأیید
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section links: the page is long, the way there should be short. */}
        <nav aria-label="بخش‌های صفحه" className="hidden lg:block">
          <ul className="grid gap-1 rounded-xl border bg-card p-2">
            {[
              { href: "#details", label: "اطلاعات شخصی", icon: UserRound },
              { href: "#social", label: "شبکه‌های اجتماعی", icon: Share2 },
              { href: "#password", label: "رمز عبور", icon: KeyRound },
              {
                href: "#sessions",
                label: "دستگاه‌ها و نشست‌ها",
                icon: MonitorSmartphone,
              },
            ].map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <item.icon className="size-4 text-brand/70" />
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* ----------------------------------------------------------- what */}
      <div className="grid content-start gap-4">
        <form
          id="profile-form"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          className="grid gap-4"
        >
          <Card id="details">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="size-4 text-brand" />
                اطلاعات شخصی
              </CardTitle>
              <CardDescription>
                نام و شماره‌ی تماس در کارت شما و فایل‌هایتان دیده می‌شود.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormTextField
                  {...context}
                  name="name"
                  label="نام"
                  autoComplete="given-name"
                />
                <FormTextField
                  {...context}
                  name="last_name"
                  label="نام خانوادگی"
                  autoComplete="family-name"
                />
                <FormTextField
                  {...context}
                  name="phone"
                  label="شماره تماس"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                />
                <FormTextField
                  {...context}
                  name="email"
                  label="ایمیل"
                  type="email"
                  autoComplete="email"
                />
                <FormDateField
                  {...context}
                  name="birthday"
                  label="تاریخ تولد"
                />
                <FormTextField
                  {...context}
                  name="alias"
                  label="نام مستعار"
                  hint="روی سایت به‌جای نام کامل می‌نشیند؛ پس از تأیید مدیر"
                />
              </div>

              <FormTextareaField
                {...context}
                name="bio"
                label="معرفی"
                rows={4}
                placeholder="خودتان را کوتاه معرفی کنید — تخصص، سابقه، محدوده‌ی کاری"
              />

              {pending.length > 0 && (
                <Typography
                  variant="small"
                  className="flex items-center gap-2 rounded-lg border border-dashed bg-muted/40 p-3"
                >
                  <Clock className="size-4 shrink-0 text-brand" />
                  تغییر {pending.join(" و ")} شما در انتظار تأیید مدیر است و تا
                  آن زمان نسخه‌ی قبلی نمایش داده می‌شود.
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card id="social">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="size-4 text-brand" />
                شبکه‌های اجتماعی
              </CardTitle>
              <CardDescription>
                راه‌های تماسی که کنار شماره‌تان روی صفحه‌ی کارشناس نشان داده
                می‌شود. خالی بگذارید تا نمایش داده نشود.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {SOCIALS.map((social) => {
                const error = form.formState.errors[social.name]?.message;
                return (
                  <div key={social.name} className="space-y-2">
                    <Label htmlFor={social.name}>{social.label}</Label>
                    <InputGroup
                      className="h-9 px-1"
                      aria-invalid={Boolean(error)}
                    >
                      <InputGroupAddon align="inline-start">
                        <InputGroupText>
                          <social.icon className="size-4 text-brand/70" />
                          <span className="tabular-nums" dir="ltr">
                            {social.prefix}
                          </span>
                        </InputGroupText>
                      </InputGroupAddon>
                      <InputGroupInput
                        id={social.name}
                        dir="ltr"
                        className="text-start"
                        placeholder={social.placeholder}
                        autoComplete="off"
                        inputMode={social.name === "whatsapp" ? "tel" : "text"}
                        aria-invalid={Boolean(error)}
                        {...form.register(social.name)}
                      />
                    </InputGroup>
                    {!error && (
                      <Typography variant="small">{social.hint}</Typography>
                    )}
                    <FieldMessage message={error} />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* The save bar: pinned while there is something to save, so the
              button is never a scroll away from the field that was changed. */}
          <div
            className={cn(
              "sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background/95 p-3 shadow-sm backdrop-blur transition-opacity",
              !isDirty && "opacity-80",
            )}
          >
            <Typography variant="small" className="flex items-center gap-2">
              {isDirty ? (
                <>
                  <AtSign className="size-4 text-brand" />
                  تغییرات ذخیره‌نشده دارید.
                </>
              ) : (
                "همه‌چیز ذخیره شده است."
              )}
            </Typography>
            <span className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={!isDirty || mutation.isPending}
                onClick={() => reset()}
              >
                <Undo2 data-icon="inline-start" />
                بازگردانی
              </Button>
              <Button
                type="submit"
                form="profile-form"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <Spinner data-icon="inline-start" />
                ) : (
                  <Save data-icon="inline-start" />
                )}
                ذخیره تغییرات
              </Button>
            </span>
          </div>
        </form>

        <ProfileSecurity />
      </div>
    </div>
  );
}
