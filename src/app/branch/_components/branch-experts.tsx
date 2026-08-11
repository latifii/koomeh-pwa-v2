import Image from "next/image";
import Link from "next/link";
import { Crown, Handshake, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui/typography";
import { defaultAvatars } from "@/data/avatars";
import type { BranchExpert } from "@/data/branch-detail";
import { cn } from "@/lib/utils";

/**
 * The branch's advisors. A photo-forward card each — the manager is flagged so
 * a visitor knows who leads the office at a glance.
 */
export function BranchExperts({ experts }: { experts: BranchExpert[] }) {
  return (
    <div className="-mx-page flex snap-x snap-mandatory gap-3 overflow-x-auto px-page pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
      {experts.map((expert) => (
        <article
          key={expert.id}
          className="group relative w-[60%] shrink-0 snap-start overflow-hidden rounded-2xl border bg-card transition-colors hover:border-brand/30 sm:w-auto"
        >
          <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
              src={defaultAvatars[expert.gender]}
              alt={expert.name}
              fill
              sizes="(min-width: 1024px) 20vw, (min-width: 640px) 40vw, 60vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <span className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent" />

            {expert.isManager && (
              <Badge
                variant="secondary"
                className="absolute top-2.5 inset-s-2.5"
              >
                <Crown data-icon="inline-start" />
                مدیر شعبه
              </Badge>
            )}

            <Typography
              as="span"
              variant="small"
              className="absolute bottom-2.5 inset-s-2.5 flex items-center gap-1 rounded-full border border-white/20 bg-black/40 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-md"
            >
              <Handshake className="size-3 text-secondary" />
              {expert.deals.toLocaleString("fa-IR")} معامله
            </Typography>
          </div>

          <div className="flex flex-col gap-0.5 p-3">
            <Typography
              variant="h4"
              as="h3"
              className="transition-colors group-hover:text-brand sm:text-sm"
            >
              {expert.name}
            </Typography>
            <Typography as="span" variant="small">
              {expert.role}
            </Typography>
          </div>

          <Link
            href={`/agents/${expert.agentId}`}
            aria-label={expert.name}
            className="absolute inset-0"
          />
        </article>
      ))}
    </div>
  );
}

/** Compact manager row for the sidebar contact card. */
export function BranchManager({
  name,
  gender,
  phone,
  className,
}: {
  name: string;
  gender: BranchExpert["gender"];
  phone: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src={defaultAvatars[gender]}
        alt={name}
        width={44}
        height={44}
        className="size-11 rounded-full object-cover ring-2 ring-secondary/40"
      />
      <div className="min-w-0 flex-1">
        <Typography variant="h4" as="p" className="truncate sm:text-sm">
          {name}
        </Typography>
        <Typography variant="small">مدیر شعبه</Typography>
      </div>
      <a
        href={`tel:${phone}`}
        aria-label={`تماس با ${name}`}
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand transition-colors hover:bg-brand hover:text-white"
      >
        <Phone className="size-4" />
      </a>
    </div>
  );
}
