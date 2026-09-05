"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

/**
 * Previous / current / next, for the admin lists that are too deep to scroll.
 *
 * Deliberately not numbered pages: several of these tables run to hundreds of
 * thousands of rows — relations alone is two million — so a row of page numbers
 * would be a row of numbers nobody can aim at. Getting to a particular record
 * is the filters' job; this is only for stepping.
 */
export function Pagination({
  page,
  lastPage,
  busy,
  onChange,
}: {
  page: number;
  lastPage: number;
  busy?: boolean;
  onChange: (page: number) => void;
}) {
  if (lastPage <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl border bg-card p-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page <= 1 || busy}
        onClick={() => onChange(Math.max(1, page - 1))}
      >
        <ChevronRight />
        صفحه قبل
      </Button>

      <Typography variant="small" className="tabular-nums">
        صفحه {page.toLocaleString("fa-IR")} از {lastPage.toLocaleString("fa-IR")}
      </Typography>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page >= lastPage || busy}
        onClick={() => onChange(page + 1)}
      >
        صفحه بعد
        <ChevronLeft />
      </Button>
    </div>
  );
}
