"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BriefcaseBusiness,
  CalendarCheck,
  ClipboardList,
  History,
  Home,
  ShieldCheck,
  Users,
} from "lucide-react";

import { useSessionStore } from "@/app/auth/_stores/auth.store";
import { createEstateOperation } from "@/app/properties/_api/estate-staff.service";
import { estateStaffQueryKeys } from "@/app/properties/_constants/estate-staff-query-keys";
import {
  estateAppointmentsQueryOptions,
  estateEditHistoryQueryOptions,
  estateManagementQueryOptions,
  estateOperationTypesQueryOptions,
  estateOperationsQueryOptions,
  matchedCustomersQueryOptions,
  ownerEstatesQueryOptions,
} from "@/app/properties/_queries/estate-staff.query";
import {
  estateOperationFormSchema,
  type EstateOperationFormValues,
} from "@/app/properties/_schemas/estate-staff.schema";
import { DetailSection } from "@/app/properties/_components/detail-section";
import {
  FormSelectField,
  FormTextareaField,
  type FormContext,
} from "@/components/shared/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { formatToman } from "@/lib/persian-number";

type EstateStaffPanelProps = { estateId: number };

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex items-start justify-between gap-3 border-b py-2 last:border-b-0">
      <Typography as="span" variant="small" className="text-muted-foreground">
        {label}
      </Typography>
      <Typography as="span" variant="small" className="text-end font-medium">
        {value}
      </Typography>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <Typography variant="small" className="py-6 text-center text-muted-foreground">
      {text}
    </Typography>
  );
}

/**
 * The management side of an estate page, shown only to staff.
 *
 * Everything under here is a separate staff-only endpoint that answers 403 to
 * anyone else, so the whole block renders nothing at all unless the session
 * says the viewer is an expert or an admin — no requests, no empty cards.
 */
export function EstateStaffPanel({ estateId }: EstateStaffPanelProps) {
  const user = useSessionStore((state) => state.session?.user);
  const isStaff = Boolean(user?.isExpert || user?.isAdmin);
  const queryClient = useQueryClient();

  const management = useQuery(estateManagementQueryOptions(estateId, isStaff));
  const operations = useQuery(estateOperationsQueryOptions(estateId, 1, isStaff));
  const operationTypes = useQuery(estateOperationTypesQueryOptions(isStaff));
  const matched = useQuery(matchedCustomersQueryOptions(estateId, 1, isStaff));
  const appointments = useQuery(
    estateAppointmentsQueryOptions(estateId, 1, isStaff),
  );
  const ownerEstates = useQuery(ownerEstatesQueryOptions(estateId, 1, isStaff));
  const editHistory = useQuery(estateEditHistoryQueryOptions(estateId, isStaff));

  const form = useForm<EstateOperationFormValues>({
    resolver: zodResolver(estateOperationFormSchema),
    defaultValues: { type: "", comment: "" },
  });

  const logOperation = useMutation({
    mutationFn: (values: EstateOperationFormValues) =>
      createEstateOperation(estateId, values),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: estateStaffQueryKeys.all,
      });
      form.reset({ type: "", comment: "" });
      toast.success(response.result.message ?? "عملکرد ثبت شد.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const [tab, setTab] = useState("operations");

  if (!isStaff) return null;

  const context: FormContext<EstateOperationFormValues> = {
    control: form.control,
    register: form.register,
    errors: form.formState.errors,
  };

  return (
    <DetailSection
      id="staff"
      title="پنل مدیریت آگهی"
      icon={ShieldCheck}
      action={<Badge variant="secondary">فقط کارشناسان</Badge>}
    >
      {management.isPending && <Skeleton className="h-40 rounded-xl" />}

      {management.isError && (
        <Typography variant="small" className="text-destructive">
          {getApiErrorMessage(management.error)}
        </Typography>
      )}

      {management.isSuccess && (
        <div className="mb-5 grid gap-x-6 sm:grid-cols-2">
          <Row label="وضعیت تأیید" value={management.data.confirmation_label} />
          <Row label="سهم کارشناس" value={
            management.data.percent_expert === null ||
            management.data.percent_expert === undefined
              ? null
              : `${management.data.percent_expert}٪`
          } />
          <Row label="ثبت" value={management.data.dates?.created_at} />
          <Row label="آخرین بروزرسانی" value={management.data.dates?.updated_at} />
          <Row
            label="آخرین ویرایشگر"
            value={
              management.data.last_editor?.name
                ? `${management.data.last_editor.name} · ${management.data.last_editor.date ?? ""}`
                : null
            }
          />
          <Row
            label="مالک"
            value={
              management.data.owner?.name
                ? `${management.data.owner.name} · ${management.data.owner.username ?? ""}`
                : null
            }
          />
          <Row
            label="بازدید کاربران"
            value={management.data.stats?.visit_count}
          />
          <Row
            label="بازدید کارشناسان"
            value={management.data.stats?.agent_visit_count}
          />
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="operations">
            <ClipboardList className="size-4" />
            عملکردها
          </TabsTrigger>
          <TabsTrigger value="matched">
            <Users className="size-4" />
            خریداران متناسب
          </TabsTrigger>
          <TabsTrigger value="appointments">
            <CalendarCheck className="size-4" />
            قرارهای بازدید
          </TabsTrigger>
          <TabsTrigger value="owner">
            <Home className="size-4" />
            فایل‌های همین مالک
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="size-4" />
            تاریخچه ویرایش
          </TabsTrigger>
        </TabsList>

        <TabsContent value="operations" className="space-y-4">
          <form
            onSubmit={form.handleSubmit((values) => logOperation.mutate(values))}
            className="space-y-3 rounded-xl border p-3"
          >
            <FormSelectField
              {...context}
              name="type"
              label="نوع عملکرد"
              placeholder="انتخاب کنید"
              required
              options={(operationTypes.data ?? []).map((type) => ({
                value: type.value,
                label: type.title,
              }))}
            />
            <FormTextareaField
              {...context}
              name="comment"
              label="شرح"
              required
            />
            {/* Worth saying out loud: this write has a side effect on ranking. */}
            <Typography variant="small" className="text-muted-foreground">
              ثبت عملکرد، نردبان خودکار این فایل را هم فعال می‌کند.
            </Typography>
            <Button type="submit" disabled={logOperation.isPending}>
              {logOperation.isPending && <Spinner className="size-4" />}
              ثبت عملکرد
            </Button>
          </form>

          {operations.isPending && <Skeleton className="h-24 rounded-xl" />}
          {operations.isSuccess && operations.data.items.length === 0 && (
            <Empty text="هنوز عملکردی روی این فایل ثبت نشده است." />
          )}
          <div className="space-y-2">
            {operations.data?.items.map((item) => (
              <article key={item.id} className="rounded-xl border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{item.type_label}</Badge>
                  <Typography as="span" variant="small">
                    {item.expert?.name}
                  </Typography>
                  <Typography
                    as="span"
                    variant="small"
                    className="text-muted-foreground"
                  >
                    {item.created_at_jalali}
                  </Typography>
                </div>
                {item.comment && (
                  <Typography variant="small" className="mt-2 leading-6">
                    {item.comment}
                  </Typography>
                )}
                {item.audio_url && (
                  <audio controls src={item.audio_url} className="mt-2 w-full">
                    <track kind="captions" />
                  </audio>
                )}
              </article>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="matched" className="space-y-2">
          {matched.isPending && <Skeleton className="h-24 rounded-xl" />}
          {matched.isSuccess && matched.data.items.length === 0 && (
            <Empty text="متقاضی متناسبی برای این فایل پیدا نشد." />
          )}
          {matched.data?.items.map((item) => (
            <article key={item.id} className="rounded-xl border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Typography as="span" variant="body" className="font-medium">
                  {item.name}
                </Typography>
                {item.is_name_masked && <Badge variant="outline">محدودشده</Badge>}
                {item.request_type_label && (
                  <Badge variant="secondary">{item.request_type_label}</Badge>
                )}
              </div>
              <Typography variant="small" className="mt-1 text-muted-foreground">
                {[
                  item.estate_type_label,
                  item.districts.length ? item.districts.join("، ") : null,
                  item.area_min ? `از ${item.area_min} متر` : null,
                  item.price_max ? `تا ${formatToman(item.price_max)}` : null,
                  item.rent_max ? `اجاره تا ${formatToman(item.rent_max)}` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </Typography>
            </article>
          ))}
        </TabsContent>

        <TabsContent value="appointments" className="space-y-2">
          {appointments.isPending && <Skeleton className="h-24 rounded-xl" />}
          {appointments.isSuccess && appointments.data.items.length === 0 && (
            <Empty text="قرار بازدیدی روی این فایل ثبت نشده است." />
          )}
          {appointments.data?.items.map((item) => (
            <article
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3"
            >
              <div>
                <Typography as="span" variant="body" className="font-medium">
                  {item.name}
                </Typography>
                <Typography variant="small" className="text-muted-foreground">
                  {[item.mobile, item.date].filter(Boolean).join(" · ")}
                </Typography>
              </div>
              {item.status_label && (
                <Badge variant="secondary">{item.status_label}</Badge>
              )}
            </article>
          ))}
        </TabsContent>

        <TabsContent value="owner" className="space-y-2">
          {ownerEstates.isPending && <Skeleton className="h-24 rounded-xl" />}
          {ownerEstates.isSuccess && ownerEstates.data.items.length === 0 && (
            <Empty text="این مالک فایل دیگری ندارد." />
          )}
          {ownerEstates.data?.items.map((item) => (
            <article
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3"
            >
              <div className="min-w-0">
                <Typography as="span" variant="body" className="font-medium">
                  {item.title || `فایل ${item.id}`}
                </Typography>
                <Typography variant="small" className="text-muted-foreground">
                  {[
                    item.deal_type_label,
                    item.estate_type_label,
                    item.area ? `${item.area} متر` : null,
                    item.location_label,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </Typography>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                render={<a href={`/properties/${item.id}`} />}
                nativeButton={false}
              >
                مشاهده
              </Button>
            </article>
          ))}
        </TabsContent>

        <TabsContent value="history" className="space-y-2">
          {editHistory.isPending && <Skeleton className="h-24 rounded-xl" />}
          {editHistory.isSuccess && editHistory.data.items.length === 0 && (
            <Empty text="تغییری برای این فایل ثبت نشده است." />
          )}
          {editHistory.data?.items.map((item, index) => (
            <article
              key={`${item.field}-${index}`}
              className="rounded-xl border p-3"
            >
              <Typography as="span" variant="small" className="font-medium">
                {item.field}
              </Typography>
              <Typography variant="small" className="mt-1 text-muted-foreground">
                {`${item.from ?? "—"} ← ${item.to ?? "—"}`}
              </Typography>
              <Typography variant="small" className="text-muted-foreground">
                {[item.user, item.date].filter(Boolean).join(" · ")}
              </Typography>
            </article>
          ))}
        </TabsContent>
      </Tabs>

      <div className="mt-4 flex items-center gap-2 text-muted-foreground">
        <BriefcaseBusiness className="size-4" />
        <Typography as="span" variant="small">
          این بخش برای بازدیدکنندگان عادی نمایش داده نمی‌شود.
        </Typography>
      </div>
    </DetailSection>
  );
}
