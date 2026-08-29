"use client";

import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Eye, ShieldAlert, UserRound, Users } from "lucide-react";
import Link from "next/link";

import { useSessionStore } from "@/app/auth/_stores/auth.store";
import { estateManagementQueryOptions } from "@/app/properties/_queries/estate-staff.query";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { routes } from "@/lib/routes";

/**
 * The management view for one listing, on real data.
 *
 * It reads `/estates/{id}/management`, which is the same call the estate page's
 * staff panel makes — so the two never disagree. The status actions
 * (archive, publish, ladder…) deliberately live on the list at
 * `/panel/properties`, where the API hands back a `permissions` object per row
 * saying which are allowed; that flag is not on this endpoint, and guessing it
 * here would mean offering buttons the API will refuse.
 */
export function AdManagement({ estateId }: { estateId: number }) {
  const user = useSessionStore((state) => state.session?.user);
  const isStaff = Boolean(user?.isExpert || user?.isAdmin);

  const management = useQuery(estateManagementQueryOptions(estateId, isStaff));

  if (!isStaff) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="این بخش برای کارشناسان است"
        description="مدیریت آگهی به دسترسی کارشناس یا مدیر نیاز دارد."
      />
    );
  }

  if (management.isPending) {
    return <Skeleton className="h-72 rounded-2xl" />;
  }

  if (management.isError) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="اطلاعات مدیریتی بارگذاری نشد"
        description={getApiErrorMessage(management.error)}
        action={
          <Button
            type="button"
            variant="outline"
            onClick={() => management.refetch()}
          >
            تلاش دوباره
          </Button>
        }
      />
    );
  }

  const data = management.data;

  const stats = [
    { icon: Eye, value: data.stats?.visit_count ?? 0, label: "بازدید کاربران" },
    {
      icon: Users,
      value: data.stats?.agent_visit_count ?? 0,
      label: "بازدید کارشناسان",
    },
  ];

  const rows: [string, string | null | undefined][] = [
    ["ثبت", data.dates?.created_at],
    ["آخرین بروزرسانی", data.dates?.updated_at],
    ["آخرین نمایش", data.dates?.show_date],
    [
      "آخرین ویرایشگر",
      data.last_editor?.name
        ? `${data.last_editor.name}${data.last_editor.date ? ` · ${data.last_editor.date}` : ""}`
        : null,
    ],
    [
      "سهم کارشناس",
      data.percent_expert === null || data.percent_expert === undefined
        ? null
        : `${data.percent_expert}٪`,
    ],
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{`فایل ${data.estate_id.toLocaleString("fa-IR")}`}</CardTitle>
            {data.confirmation_label && (
              <Badge>{data.confirmation_label}</Badge>
            )}
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl bg-muted p-4 text-center">
                <stat.icon className="mx-auto mb-2 size-5 text-brand" />
                <Typography as="p" variant="h3">
                  {stat.value.toLocaleString("fa-IR")}
                </Typography>
                <Typography variant="small">{stat.label}</Typography>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>وضعیت پرونده</CardTitle>
          </CardHeader>
          <CardContent>
            {rows.map(([label, value]) =>
              value ? (
                <div
                  key={label}
                  className="flex items-center justify-between gap-3 border-b py-2 last:border-b-0"
                >
                  <Typography as="span" variant="small" className="text-muted-foreground">
                    {label}
                  </Typography>
                  <Typography as="span" variant="small" className="font-medium">
                    {value}
                  </Typography>
                </div>
              ) : null,
            )}
          </CardContent>
        </Card>

        {data.owner && (
          <Card>
            <CardHeader>
              <CardTitle>مالک</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <UserRound className="size-5 text-brand" />
              <Typography as="span" variant="body" className="font-medium">
                {data.owner.name}
              </Typography>
              {data.owner.username && (
                <Typography as="span" variant="small" className="text-muted-foreground">
                  {data.owner.username}
                </Typography>
              )}
              {data.owner.is_bongah && <Badge variant="secondary">بنگاه</Badge>}
            </CardContent>
          </Card>
        )}
      </div>

      <aside className="grid grid-cols-1 h-fit gap-3 lg:sticky lg:top-24">
        <Button
          nativeButton={false}
          render={<Link href={routes.panel.propertyPreview(data.estate_id)} />}
        >
          <Eye />
          پیش‌نمایش آگهی
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={routes.property(data.estate_id)} />}
        >
          <ExternalLink />
          صفحه عمومی ملک
        </Button>
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href={routes.panel.properties} />}
        >
          تغییر وضعیت در فهرست آگهی‌ها
        </Button>
        <Card>
          <CardContent className="p-4">
            <Typography variant="h4">آرشیو، نردبان و تأیید نمایش</Typography>
            <Typography variant="small" className="mt-2 leading-6">
              این عملیات در فهرست آگهی‌ها انجام می‌شوند، چون سرویس آنجا برای هر
              ردیف می‌گوید کدام‌یک برای شما مجاز است.
            </Typography>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
