"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Save, UserRound } from "lucide-react";
import { toast } from "sonner";

import { updateProfile } from "@/app/panel/profile/_api/profile.service";
import { profileQueryKeys } from "@/app/panel/profile/_constants/profile-query-keys";
import { profileQueryOptions } from "@/app/panel/profile/_queries/profile.query";
import {
  profileFormSchema,
  type ProfileFormValues,
} from "@/app/panel/profile/_schemas/profile.schema";
import { syncSessionUserAction } from "@/app/auth/_actions/auth-actions";
import { useSessionStore } from "@/app/auth/_stores/auth.store";
import {
  FormTextField,
  FormTextareaField,
  type FormContext,
} from "@/components/shared/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { toAbsoluteMediaUrl } from "@/lib/api/config";

/**
 * Account details. Only changed fields are sent — the API leaves everything
 * else alone — and the display name and bio go to an approval queue rather
 * than publishing straight away, which the form says out loud.
 */
export function ProfileForm() {
  const queryClient = useQueryClient();
  const profile = useQuery(profileQueryOptions());
  const applySession = useSessionStore((state) => state.applySession);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      last_name: "",
      email: "",
      phone: "",
      alias: "",
      bio: "",
    },
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
      alias: data.alias?.value ?? "",
      bio: data.bio?.pending_value ?? data.bio?.value ?? "",
    });
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (values: ProfileFormValues) =>
      updateProfile({
        name: values.name || null,
        last_name: values.last_name || null,
        email: values.email || null,
        phone: values.phone || null,
        alias: values.alias || null,
        bio: values.bio || null,
      }),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: profileQueryKeys.detail() });
      // The header shows the user's name, and that name lives in the session
      // cookie — so the cookie has to be re-minted, not merely re-read.
      applySession(await syncSessionUserAction());

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
      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (profile.isError) {
    return (
      <Typography variant="small" className="text-destructive">
        {getApiErrorMessage(profile.error)}
      </Typography>
    );
  }

  const fullName =
    [data?.name, data?.last_name].filter(Boolean).join(" ") || "کاربر کومه";
  const photo = toAbsoluteMediaUrl(data?.photo ?? null);

  return (
    <form
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      className="grid gap-4 lg:grid-cols-[220px_1fr]"
    >
      <Card className="h-fit">
        <CardContent className="flex flex-col items-center p-5 text-center">
          <Avatar className="size-24">
            {photo && <AvatarImage src={photo} alt={fullName} />}
            <AvatarFallback className="bg-brand/10 text-brand">
              <UserRound className="size-10" />
            </AvatarFallback>
          </Avatar>

          <Typography variant="h4" className="mt-3">
            {fullName}
          </Typography>
          <Typography variant="small">{data?.username}</Typography>

          {data?.is_expert && (
            <Badge variant="secondary" className="mt-2">
              کارشناس
            </Badge>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>اطلاعات شخصی</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormTextField {...context} name="name" label="نام" />
            <FormTextField {...context} name="last_name" label="نام خانوادگی" />
            <FormTextField
              {...context}
              name="phone"
              label="شماره تماس"
              type="tel"
              inputMode="numeric"
            />
            <FormTextField
              {...context}
              name="email"
              label="ایمیل"
              type="email"
              autoComplete="email"
            />
            <FormTextField
              {...context}
              name="alias"
              label="نام مستعار"
              hint="پس از تأیید مدیر نمایش داده می‌شود"
            />
          </div>

          <FormTextareaField
            {...context}
            name="bio"
            label="معرفی"
            rows={4}
            placeholder="خودتان را کوتاه معرفی کنید"
          />

          {(data?.alias?.pending || data?.bio?.pending) && (
            <Typography
              variant="small"
              className="flex items-center gap-2 rounded-lg border border-dashed bg-muted/40 p-3"
            >
              <Clock className="size-4 shrink-0 text-brand" />
              تغییرات نام مستعار یا معرفی شما در انتظار تأیید مدیر است.
            </Typography>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Save data-icon="inline-start" />
              )}
              ذخیره تغییرات
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
