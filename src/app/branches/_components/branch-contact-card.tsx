import { Clock, Mail, MapPin, Phone, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import type { BranchProfile } from "@/app/branches/_types/branch.types";
import { cn } from "@/lib/utils";

import { BranchManager } from "./branch-experts";

/**
 */
export function BranchContactCard({ branch }: { branch: BranchProfile }) {
  const manager = branch.agents[0];

  return (
    <div className="rounded-2xl border bg-card p-4">
      <Typography variant="h4" as="h2">
        راه‌های ارتباطی
      </Typography>

      <div className="mt-3 grid gap-2">
        {branch.phone && (
          <Button
            size="lg"
            nativeButton={false}
            render={<a href={branch.telUrl ?? `tel:${branch.phone}`} />}
            className="w-full font-heading tracking-wide"
          >
            <Phone data-icon="inline-start" />
            {branch.phone}
          </Button>
        )}
        {manager?.phone && manager.phone !== branch.phone && (
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={<a href={`tel:${manager.phone}`} />}
            className="w-full font-heading tracking-wide"
          >
            <Smartphone data-icon="inline-start" />
            {manager.phone}
          </Button>
        )}
      </div>

      <ul className="mt-3 grid gap-2.5">
        {branch.address && (
          <li className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-brand/70" />
            <Typography as="span" variant="small" className="leading-6">
              {branch.address}
            </Typography>
          </li>
        )}
        <li className="flex items-center gap-2">
          <Mail className="size-4 shrink-0 text-brand/70" />
          <Typography as="span" variant="small">
            info@koomeh.com
          </Typography>
        </li>
      </ul>

      <Separator className="my-3.5" />

      {branch.workingHours.length > 0 && (
        <div>
        <Typography
          variant="h4"
          as="h3"
          className="flex items-center gap-1.5"
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
      )}

      {manager && (
        <>
          <Separator className="my-3.5" />
          <BranchManager
            name={manager.name}
            gender={manager.gender}
            phone={manager.phone ?? branch.phone}
          />
        </>
      )}
    </div>
  );
}
