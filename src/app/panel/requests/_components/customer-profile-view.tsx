"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Activity,
  Banknote,
  CalendarClock,
  Copy,
  LoaderCircle,
  MapPin,
  Phone,
  Ruler,
  Send,
  StickyNote,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { addCustomerNote } from "@/app/panel/requests/_api/customer-profile.service";
import {
  removeRelation,
  setRelationStatus,
} from "@/app/panel/requests/_api/customer-actions.service";
import { useCustomerActions } from "@/app/panel/requests/_hooks/use-customer-actions";
import { CustomerActionsMenu } from "./customer-actions-menu";
import {
  customerAppointmentsQueryOptions,
  customerEstatesInfiniteQueryOptions,
  customerNotesQueryOptions,
  customerOperationsQueryOptions,
  customerProfileKey,
  customerProfileQueryOptions,
} from "@/app/panel/requests/_queries/customer-profile.query";
import {
  addNoteFormSchema,
  type AddNoteValues,
} from "@/app/panel/requests/_schemas/customer-profile.schema";
import { mapHomeEstate } from "@/app/_home/_mappers/home-estates.mapper";
import { PropertyCard } from "@/components/features/property/property-card";
import { FormTextareaField, type FormContext } from "@/components/shared/form";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { toAbsoluteSiteUrl } from "@/lib/api/config";

const moneyFormatter = new Intl.NumberFormat("fa-IR", {
  maximumFractionDigits: 0,
});

function range(
  min: number | null | undefined,
  max: number | null | undefined,
  unit: string,
): string | undefined {
  const from = min ? moneyFormatter.format(min) : undefined;
  const to = max ? moneyFormatter.format(max) : undefined;
  if (from && to) return `${from} تا ${to} ${unit}`;
  if (from) return `از ${from} ${unit}`;
  if (to) return `تا ${to} ${unit}`;
  return undefined;
}

/**
 * One customer's demand: what they are looking for, the files already
 * suggested to them, notes and the activity log. Every section is gated on the
 * `permissions` the API returns for this caller.
 */
export function CustomerProfileView({ id }: { id: string }) {
  const queryClient = useQueryClient();

  const actions = useCustomerActions(id);
  const profile = useQuery(customerProfileQueryOptions(id));
  const can = profile.data?.permissions;

  const notes = useQuery(customerNotesQueryOptions(id, Boolean(profile.data)));
  const operations = useQuery(
    customerOperationsQueryOptions(id, Boolean(can?.can_view_operations)),
  );
  const appointments = useQuery(customerAppointmentsQueryOptions(id));
  const estates = useInfiniteQuery(customerEstatesInfiniteQueryOptions(id));

  const form = useForm<AddNoteValues>({
    resolver: zodResolver(addNoteFormSchema),
    defaultValues: { note: "" },
  });

  /** Confirm, reject or drop one suggested file. */
  const relation = useMutation({
    mutationFn: ({
      id: relationId,
      kind,
    }: {
      id: number;
      kind: "confirm" | "reject" | "remove";
    }) =>
      kind === "remove"
        ? removeRelation(id, relationId)
        : setRelationStatus(id, relationId, kind),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: customerProfileKey(id, "estates"),
      });
      toast.success(
        variables.kind === "remove"
          ? "از فهرست پیشنهادها حذف شد"
          : variables.kind === "confirm"
            ? "ملک تأیید شد"
            : "ملک رد شد",
      );
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const addNote = useMutation({
    mutationFn: (values: AddNoteValues) => addCustomerNote(id, values.note),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: customerProfileKey(id, "notes"),
      });
      form.reset();
      toast.success("یادداشت ثبت شد");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  if (profile.isPending) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (profile.isError || !profile.data) {
    return (
      <EmptyState
        icon={UserRound}
        title="تقاضا بارگذاری نشد"
        description={getApiErrorMessage(profile.error)}
      />
    );
  }

  const customer = profile.data;
  const isRent = customer.request_type === 2;
  const budget = customer.budget;

  const wants = [
    isRent
      ? range(budget?.mortgage_min, budget?.mortgage_max, "تومان ودیعه")
      : range(budget?.price_min, budget?.price_max, "تومان"),
    isRent ? range(budget?.rent_min, budget?.rent_max, "تومان اجاره") : undefined,
    range(budget?.area_min, budget?.area_max, "متر"),
  ].filter(Boolean) as string[];

  const suggestUrl = toAbsoluteSiteUrl(customer.suggest_url ?? null);
  const context: FormContext<AddNoteValues> = {
    control: form.control,
    register: form.register,
    errors: form.formState.errors,
  };

  const rows = estates.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="grid gap-4">
      <Card>
        <CardContent className="grid gap-4 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <Typography variant="h3" as="h2" className="text-lg sm:text-xl">
                {customer.name?.trim() || `تقاضای ${customer.id.toLocaleString("fa-IR")}`}
              </Typography>
              <Typography variant="small" className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>کد {customer.id.toLocaleString("fa-IR")}</span>
                {customer.request_type_label && <span>{customer.request_type_label}</span>}
                {customer.estate_type_label && <span>{customer.estate_type_label}</span>}
                {customer.dates?.created_at_jalali && (
                  <span>ثبت: {customer.dates.created_at_jalali}</span>
                )}
              </Typography>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {customer.status_label && (
                <Badge variant="secondary">{customer.status_label}</Badge>
              )}
              {customer.is_bongah && <Badge variant="secondary">بنگاهی</Badge>}
              <CustomerActionsMenu
                customerId={id}
                permissions={customer.permissions}
                hasAgent={Boolean(customer.agent?.id)}
                actions={actions}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {can?.can_view_mobile && customer.mobile && (
              <InfoTile icon={Phone} label="موبایل" value={customer.mobile} href={`tel:${customer.mobile}`} />
            )}
            {wants.length > 0 && (
              <InfoTile icon={Banknote} label="بودجه" value={wants[0]} />
            )}
            {wants[1] && <InfoTile icon={Ruler} label="خواسته" value={wants[1]} />}
            {customer.agent?.name && (
              <InfoTile icon={UserRound} label="مشاور پرونده" value={customer.agent.name} />
            )}
          </div>

          {customer.districts.length > 0 && (
            <Typography variant="small" className="flex items-start gap-1.5">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-brand/70" />
              محله‌های موردنظر: {customer.districts.map((d) => d.name).join("، ")}
            </Typography>
          )}

          {customer.description && (
            <Typography variant="muted" className="leading-7">
              {customer.description}
            </Typography>
          )}

          {suggestUrl && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed bg-muted/40 p-3">
              <Send className="size-4 shrink-0 text-brand" />
              <Typography variant="small" className="min-w-0 flex-1 truncate">
                لینک اختصاصی پیشنهاد فایل به این مشتری
              </Typography>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  void navigator.clipboard
                    .writeText(suggestUrl)
                    .then(() => toast.success("لینک کپی شد"))
                    .catch(() => toast.error("کپی لینک ممکن نشد"));
                }}
              >
                <Copy data-icon="inline-start" />
                کپی لینک
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {customer.criteria.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>شرایط درخواستی</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-x-6 sm:grid-cols-2">
              {customer.criteria.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between gap-3 border-b border-dashed py-2.5 last:border-b-0"
                >
                  <Typography as="dt" variant="muted">
                    {item.label}
                  </Typography>
                  <Typography as="dd" variant="body" className="font-medium">
                    {Array.isArray(item.value)
                      ? item.value.join("، ")
                      : (item.value ?? "—")}
                  </Typography>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="size-4 text-brand" />
            فایل‌های پیشنهادی
            {estates.data?.pages[0]?.total ? (
              <Badge variant="secondary">
                {estates.data.pages[0].total.toLocaleString("fa-IR")}
              </Badge>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {estates.isPending ? (
            <Skeleton className="h-64 rounded-xl" />
          ) : rows.length === 0 ? (
            <Typography variant="small">
              هنوز فایلی به این مشتری پیشنهاد نشده است.
            </Typography>
          ) : (
            <div className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {rows.map((row) => (
                  <div key={row.relation_id} className="grid gap-2">
                    <div className="relative">
                      <PropertyCard estate={mapHomeEstate(row.estate)} />
                      {(row.seen || row.click_count > 0) && (
                        <Badge
                          variant="secondary"
                          className="absolute end-3 top-3 z-10 bg-black/55 text-white backdrop-blur-md"
                        >
                          {row.click_count > 0
                            ? `${row.click_count.toLocaleString("fa-IR")} بازدید`
                            : "دیده شد"}
                        </Badge>
                      )}
                    </div>

                    {/* Only the case's own agent or an administrator may judge
                        a suggestion, which is what `can_edit` already means. */}
                    {can?.can_edit && (
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant={row.relation_status === 2 ? "secondary" : "outline"}
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            relation.mutate({ id: row.relation_id, kind: "confirm" })
                          }
                          disabled={relation.isPending}
                        >
                          <ThumbsUp data-icon="inline-start" />
                          تأیید
                        </Button>
                        <Button
                          variant={row.relation_status === 1 ? "secondary" : "outline"}
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            relation.mutate({ id: row.relation_id, kind: "reject" })
                          }
                          disabled={relation.isPending}
                        >
                          <ThumbsDown data-icon="inline-start" />
                          رد
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="حذف از پیشنهادها"
                          className="text-destructive"
                          onClick={() =>
                            relation.mutate({ id: row.relation_id, kind: "remove" })
                          }
                          disabled={relation.isPending}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {estates.hasNextPage && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => estates.fetchNextPage()}
                    disabled={estates.isFetchingNextPage}
                  >
                    {estates.isFetchingNextPage && (
                      <LoaderCircle data-icon="inline-start" className="animate-spin" />
                    )}
                    فایل‌های بیشتر
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StickyNote className="size-4 text-brand" />
              یادداشت‌ها
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {can?.can_add_note && (
              <form
                onSubmit={form.handleSubmit((values) => addNote.mutate(values))}
                className="grid gap-2"
              >
                <FormTextareaField
                  {...context}
                  name="note"
                  label="یادداشت تازه"
                  rows={2}
                  placeholder="نتیجه‌ی تماس یا نکته‌ای درباره‌ی این مشتری"
                />
                <Button size="sm" className="w-fit" disabled={addNote.isPending}>
                  {addNote.isPending && <Spinner data-icon="inline-start" />}
                  ثبت یادداشت
                </Button>
              </form>
            )}

            {notes.isPending ? (
              <Skeleton className="h-24 rounded-lg" />
            ) : notes.data?.items.length ? (
              <ul className="grid gap-2">
                {notes.data.items.map((note) => (
                  <li key={note.id} className="rounded-lg border p-3">
                    <Typography variant="body" className="leading-6">
                      {note.note}
                    </Typography>
                    <Typography variant="small" className="mt-1 text-[11px]">
                      {note.author?.name}
                      {note.created_at_jalali ? ` · ${note.created_at_jalali}` : ""}
                    </Typography>
                  </li>
                ))}
              </ul>
            ) : (
              <Typography variant="small">یادداشتی ثبت نشده است.</Typography>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {can?.can_view_operations && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="size-4 text-brand" />
                  عملکردها
                </CardTitle>
              </CardHeader>
              <CardContent>
                {operations.isPending ? (
                  <Skeleton className="h-20 rounded-lg" />
                ) : operations.data?.items.length ? (
                  <ul className="grid gap-2">
                    {operations.data.items.map((item) => (
                      <li key={item.id} className="rounded-lg border p-3">
                        <Typography variant="h4" as="p" className="sm:text-sm">
                          {item.type_label ?? "عملکرد"}
                        </Typography>
                        {item.comment && (
                          <Typography variant="small" className="mt-1 leading-6">
                            {item.comment}
                          </Typography>
                        )}
                        <Typography variant="small" className="mt-1 text-[11px]">
                          {item.agent?.name}
                          {item.created_at_jalali ? ` · ${item.created_at_jalali}` : ""}
                        </Typography>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Typography variant="small">عملکردی ثبت نشده است.</Typography>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="size-4 text-brand" />
                قرارهای بازدید
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appointments.isPending ? (
                <Skeleton className="h-20 rounded-lg" />
              ) : appointments.data?.items.length ? (
                <ul className="grid gap-2">
                  {appointments.data.items.map((item) => (
                    <li key={item.id} className="rounded-lg border p-3">
                      <Typography variant="h4" as="p" className="sm:text-sm">
                        {item.title ?? "قرار بازدید"}
                      </Typography>
                      <Typography variant="small" className="mt-1">
                        {item.at_jalali}
                        {item.location ? ` · ${item.location}` : ""}
                      </Typography>
                    </li>
                  ))}
                </ul>
              ) : (
                <Typography variant="small">قراری ثبت نشده است.</Typography>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  href?: string;
}) {
  const body = (
    <>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <Typography as="span" variant="small" className="block text-[11px]">
          {label}
        </Typography>
        <Typography as="span" variant="h4" className="block truncate sm:text-sm">
          {value}
        </Typography>
      </span>
    </>
  );

  const className = "flex items-center gap-2.5 rounded-lg border bg-card/60 p-2.5";

  return href ? (
    <Link href={href} className={`${className} transition-colors hover:border-brand/30`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
