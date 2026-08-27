"use client";

import { CalendarDays, Phone } from "lucide-react";

import { useEstateContact } from "@/app/properties/_hooks/use-estate-contact";
import type { EstateDetailView } from "@/app/properties/_types/estate-detail.types";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";

/**
 * Phones lose the sticky sidebar, so the two actions that matter follow the
 * scroll instead. It parks directly above the global bottom nav — hence the
 * hard-coded offset, which matches that bar's height.
 */
export function EstateMobileBar({ detail }: { detail: EstateDetailView }) {
  const { data, isLoading, reveal } = useEstateContact(detail.id);
  const phone = data?.[0];
  const requestVisitHref = detail.links.request_visit;

  return (
    <div className="fixed inset-x-0 bottom-[60px] z-30 border-t bg-background/95 px-page py-2.5 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-content items-center gap-3">
        <div className="min-w-0 flex-1">
          <Typography as="span" variant="small" className="text-[10px]">
            {detail.rent ? "ودیعه / اجاره" : "قیمت کل"}
          </Typography>
          <Typography
            variant="h4"
            as="p"
            className="truncate text-brand dark:text-white sm:text-sm"
          >
            {detail.rent
              ? `${detail.rent.mortgageLabel} / ${detail.rent.rentLabel}`
              : (detail.price?.label ?? "توافقی")}
          </Typography>
        </div>

        {requestVisitHref && (
          <Button
            variant="outline"
            size="icon-lg"
            aria-label="درخواست بازدید"
            nativeButton={false}
            render={
              <a
                href={requestVisitHref}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <CalendarDays />
          </Button>
        )}

        {detail.contact?.hasPhone &&
          (phone ? (
            <Button size="lg" nativeButton={false} render={<a href={phone.telUrl} />}>
              <Phone data-icon="inline-start" />
              {phone.phone}
            </Button>
          ) : (
            <Button size="lg" onClick={reveal} disabled={isLoading}>
              {isLoading ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Phone data-icon="inline-start" />
              )}
              {detail.agent ? "تماس با کارشناس" : "تماس با مالک"}
            </Button>
          ))}
      </div>
    </div>
  );
}
