"use client";

import Link from "next/link";
import {
  BadgeCheck,
  CalendarDays,
  ChevronLeft,
  Phone,
  UserRound,
} from "lucide-react";

import { useEstateContact } from "@/app/properties/_hooks/use-estate-contact";
import type {
  EstateAgentView,
  EstateContactSummary,
} from "@/app/properties/_types/estate-detail.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";

/**
 * Contact is the conversion point of the page, so the number stays behind one
 * deliberate tap — which is also how the API serves it: `/estates/{id}/contact`
 * is a separate, rate-limited call that the page never makes on load.
 */
export function EstateContactCard({
  estateId,
  agent,
  contact,
  requestVisitHref,
}: {
  estateId: string;
  agent?: EstateAgentView;
  contact?: EstateContactSummary;
  requestVisitHref?: string;
}) {
  const { data, isLoading, isError, error, requested, reveal } =
    useEstateContact(estateId);

  const name = agent?.name ?? contact?.name;
  const subtitle = agent?.title ?? agent?.activityLabel;
  const hasPhone = contact?.hasPhone ?? false;

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center gap-3">
        <Avatar className="size-12 ring-2 ring-secondary/40">
          {agent?.photo && <AvatarImage src={agent.photo} alt={agent.name} />}
          <AvatarFallback className="font-semibold">
            {name ? name.charAt(0) : <UserRound className="size-5" />}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <Typography
            variant="h4"
            as="p"
            className="flex items-center gap-1 sm:text-sm"
          >
            {name ?? "تماس با مالک"}
            {agent && <BadgeCheck className="size-4 shrink-0 text-brand" />}
          </Typography>
          <Typography variant="small" className="truncate">
            {subtitle ?? (agent ? "مشاور کومه" : "آگهی شخصی")}
          </Typography>
        </div>

        {agent?.href && (
          <Link
            href={agent.href}
            aria-label={`پروفایل ${agent.name}`}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-brand"
          >
            <ChevronLeft className="size-4" />
          </Link>
        )}
      </div>

      {agent?.bio && (
        <Typography variant="small" className="mt-3 leading-6">
          {agent.bio}
        </Typography>
      )}

      <Separator className="my-3.5" />

      <div className="grid gap-2">
        {hasPhone &&
          (data && data.length > 0 ? (
            data.map((entry) => (
              <Button
                key={entry.phone}
                size="lg"
                nativeButton={false}
                render={<a href={entry.telUrl} />}
                className="w-full font-heading tracking-wide"
              >
                <Phone data-icon="inline-start" />
                {entry.phone}
              </Button>
            ))
          ) : (
            <Button
              size="lg"
              onClick={reveal}
              disabled={isLoading}
              className="w-full font-heading"
            >
              {isLoading ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Phone data-icon="inline-start" />
              )}
              نمایش شماره تماس
            </Button>
          ))}

        {requested && isError && (
          <Typography variant="small" className="text-destructive">
            {getApiErrorMessage(error)}
          </Typography>
        )}

        {requested && !isLoading && !isError && data?.length === 0 && (
          <Typography variant="small">
            شماره تماسی برای این آگهی ثبت نشده است.
          </Typography>
        )}

        {requestVisitHref && (
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            nativeButton={false}
            render={
              <a
                href={requestVisitHref}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <CalendarDays data-icon="inline-start" />
            درخواست بازدید حضوری
          </Button>
        )}
      </div>

      <Typography
        variant="small"
        className="mt-3 text-center text-[11px] leading-5"
      >
        هنگام تماس اعلام کنید ملک را در کومه دیده‌اید.
      </Typography>
    </div>
  );
}
