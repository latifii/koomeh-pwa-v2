import { Clock, Mail, MapPin, Phone, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import type { BranchDetail } from "@/data/branch-detail";
import { cn } from "@/lib/utils";

import { BranchManager } from "./branch-experts";

/**
 * The sidebar's contact hub: how to reach the branch, when it's open, and who
 * runs it. A branch phone is public, so — unlike a listing's agent — it shows
 * directly with no reveal gate.
 */
export function BranchContactCard({ branch }: { branch: BranchDetail }) {
  const manager = branch.experts.find((expert) => expert.isManager);

  return (
    <div className="rounded-2xl border bg-card p-4">
      <Typography variant="h4" as="h2" className="sm:text-sm">
        راه‌های ارتباطی
      </Typography>

      <div className="mt-3 grid gap-2">
        <Button
          size="lg"
          nativeButton={false}
          render={<a href={`tel:${branch.phone}`} />}
          className="w-full font-heading tracking-wide"
        >
          <Phone data-icon="inline-start" />
          {branch.phone}
        </Button>
        <Button
          variant="outline"
          size="lg"
          nativeButton={false}
          render={<a href={`tel:${branch.secondaryPhone}`} />}
          className="w-full font-heading tracking-wide"
        >
          <Smartphone data-icon="inline-start" />
          {branch.secondaryPhone}
        </Button>
      </div>

      <ul className="mt-3 grid gap-2.5">
        <li className="flex items-start gap-2">
          <MapPin className="mt-0.5 size-4 shrink-0 text-brand/70" />
          <Typography as="span" variant="small" className="leading-6">
            {branch.address}
          </Typography>
        </li>
        <li className="flex items-center gap-2">
          <Mail className="size-4 shrink-0 text-brand/70" />
          <Typography as="span" variant="small">
            info@koomeh.com
          </Typography>
        </li>
      </ul>

      <Separator className="my-3.5" />

      <div>
        <Typography
          variant="h4"
          as="h3"
          className="flex items-center gap-1.5 text-xs sm:text-xs"
        >
          <Clock className="size-3.5 text-brand" />
          ساعات کاری
        </Typography>
        <ul className="mt-2 grid gap-1.5">
          {branch.workingHours.map((slot) => (
            <li
              key={slot.days}
              className="flex items-center justify-between gap-2"
            >
              <Typography as="span" variant="small">
                {slot.days}
              </Typography>
              <Typography
                as="span"
                variant="small"
                className={cn(
                  "font-medium",
                  slot.closed ? "text-destructive" : "text-foreground"
                )}
              >
                {slot.hours}
              </Typography>
            </li>
          ))}
        </ul>
      </div>

      {manager && (
        <>
          <Separator className="my-3.5" />
          <BranchManager
            name={manager.name}
            gender={manager.gender}
            phone={branch.secondaryPhone}
          />
        </>
      )}
    </div>
  );
}
