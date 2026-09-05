"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { KeyRound, Save, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";

import {
  citiesQueryOptions,
  districtsQueryOptions,
  estateTypesQueryOptions,
} from "@/app/_lookups/_queries/lookups.query";
import {
  createMember,
  updateMember,
} from "@/app/panel/members/_api/members.service";
import {
  emptyMemberForm,
  memberFormDefaults,
  memberRequestBody,
} from "@/app/panel/members/_mappers/member-form.mapper";
import { memberFormOptionsQueryOptions } from "@/app/panel/members/_queries/members.query";
import {
  memberFormSchema,
  type MemberDetail,
  type MemberFormValues,
} from "@/app/panel/members/_schemas/members.schema";
import {
  FormTextField,
  FormTextareaField,
  LookupSelect,
  MultiSelectField,
  type FormContext,
} from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { roleTitle } from "@/lib/auth/permissions";
import { routes } from "@/lib/routes";

const GENDERS = [
  { value: "male", title: "مرد" },
  { value: "female", title: "زن" },
];

/**
 * The member form, for both adding one and editing one.
 *
 * Roles are the point of the page: an account with none is a visitor, and the
 * whole panel decides what to show from what is chosen here. The list offered
 * is already filtered by the backend to the roles this administrator may hand
 * out, so a secretary cannot promote themselves through it.
 */
export function MemberForm({ member }: { member?: MemberDetail }) {
  const router = useRouter();
  const [isNavigating, startNavigation] = useTransition();
  const options = useQuery(memberFormOptionsQueryOptions());
  const estateTypes = useQuery(estateTypesQueryOptions());
  const seeded = useRef(false);

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: member ? memberFormDefaults(member) : emptyMemberForm,
  });

  useEffect(() => {
    if (!member || seeded.current) return;
    seeded.current = true;
    form.reset(memberFormDefaults(member));
  }, [member, form]);

  const cities = useQuery(citiesQueryOptions());
  const cityId = useWatch({ control: form.control, name: "city_id" });
  const districts = useQuery({
    ...districtsQueryOptions(cityId ? Number(cityId) : undefined),
    enabled: Boolean(cityId),
  });

  const mutation = useMutation({
    mutationFn: (values: MemberFormValues) => {
      const body = memberRequestBody(values);
      return member ? updateMember(member.id, body) : createMember(body);
    },
    onSuccess: () => {
      toast.success(member ? "تغییرهای عضو ذخیره شد." : "عضو تازه ثبت شد.");
      startNavigation(() => {
        router.push(routes.panel.members);
        router.refresh();
      });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const context: FormContext<MemberFormValues> = {
    control: form.control,
    register: form.register,
    errors: form.formState.errors,
  };

  if (options.isPending) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (options.isError || !options.data) {
    return (
      <Typography variant="small" className="text-destructive">
        {getApiErrorMessage(options.error)}
      </Typography>
    );
  }

  const roleOptions = options.data.roles.map((role) => ({
    value: role.value,
    title: roleTitle(role.value),
  }));

  return (
    <form
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      className="grid grid-cols-1 gap-4"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="size-4 text-brand" />
            هویت
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormTextField
              {...context}
              name="name"
              label="نام"
              required={!member}
            />
            <FormTextField
              {...context}
              name="last_name"
              label="نام خانوادگی"
              required={!member}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <FormTextField
              {...context}
              name="username"
              label="نام کاربری (شماره همراه)"
              type="tel"
              inputMode="numeric"
              autoComplete="username"
              required
            />
            <FormTextField
              {...context}
              name="phone"
              label="تلفن"
              type="tel"
              inputMode="numeric"
            />
            <FormTextField
              {...context}
              name="other_phones"
              label="شماره‌های دیگر"
              hint="با ویرگول از هم جدا کنید"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <FormTextField {...context} name="email" label="ایمیل" type="email" />
            <LookupSelect
              control={form.control}
              name="gender"
              label="جنسیت"
              options={GENDERS}
              allowEmpty
            />
            <LookupSelect
              control={form.control}
              name="status"
              label="وضعیت"
              options={options.data.statuses}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-brand" />
            نقش و دسترسی
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5">
          {/* Only the roles this administrator is allowed to grant. */}
          <MultiSelectField
            control={form.control}
            name="roles"
            label="نقش‌ها"
            options={roleOptions}
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <LookupSelect
              control={form.control}
              name="branch_id"
              label="شعبه"
              options={options.data.branches}
              allowEmpty
            />
            <FormTextField {...context} name="title" label="عنوان شغلی" />
          </div>

          <div className="grid grid-cols-1 gap-5">
            <FormTextField
              {...context}
              name="password"
              label={member ? "رمز تازه" : "رمز عبور"}
              type="password"
              autoComplete="new-password"
              required={!member}
              hint={
                member
                  ? "خالی بگذارید تا رمز فعلی دست‌نخورده بماند"
                  : "دست‌کم ۶ نویسه"
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-4 text-brand" />
            حوزه‌ی کاری
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* The membership code the backend generates is tied to the city,
                so changing this regenerates it. */}
            <LookupSelect
              control={form.control}
              name="city_id"
              label="شهر"
              options={cities.data?.result.items ?? []}
              allowEmpty
            />
            <MultiSelectField
              control={form.control}
              name="activity_estate_type"
              label="نوع ملک‌های کاری"
              options={estateTypes.data?.result.items ?? []}
            />
          </div>

          {cityId ? (
            <MultiSelectField
              control={form.control}
              name="districts"
              label="محله‌های فعالیت"
              options={districts.data?.result.items ?? []}
            />
          ) : (
            <Typography variant="small">
              محله‌های فعالیت پس از انتخاب شهر در دسترس است.
            </Typography>
          )}

          <FormTextareaField
            {...context}
            name="description"
            label="توضیحات"
            rows={3}
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        {/* Base UI's button is `type="button"` unless told otherwise. */}
        <Button
          type="submit"
          size="lg"
          disabled={mutation.isPending || isNavigating}
        >
          {mutation.isPending || isNavigating ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Save data-icon="inline-start" />
          )}
          {member ? "ذخیره تغییرها" : "ثبت عضو"}
        </Button>
        <Typography variant="small">
          {member
            ? "نام کاربری و نقش‌ها الزامی‌اند؛ بقیه اختیاری."
            : "عضو تازه با همین رمز وارد می‌شود، پس آن را به او بدهید."}
        </Typography>
      </div>
    </form>
  );
}
