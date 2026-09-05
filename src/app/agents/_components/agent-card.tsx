import Image from "next/image";
import Link from "next/link";
import {
  BriefcaseBusiness,
  Building2,
  Home,
  KeyRound,
  MapPin,
} from "lucide-react";

import { AgentFavoriteButton } from "@/app/agents/_components/agent-favorite-button";
import type { AgentDto } from "@/app/agents/_schemas/agents.schema";
import { ApiImage } from "@/components/shared/api-image";
import { Typography } from "@/components/ui/typography";
import { defaultAvatars } from "@/data/avatars";
import { toAbsoluteMediaUrl } from "@/lib/api/config";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function AgentCard({
  agent,
  className,
}: {
  agent: AgentDto;
  className?: string;
}) {
  const avatar = defaultAvatars[agent.gender === "female" ? "female" : "male"];
  const photo = toAbsoluteMediaUrl(agent.photo ?? null);
  const location = [agent.branch?.name, agent.city?.name]
    .filter(Boolean)
    .join("، ");
  const specialties = agent.estate_types.slice(0, 2);
  const specialtyLabel = specialties.map((type) => type.label).join("، ");
  const remainingSpecialties = agent.estate_types.length - specialties.length;

  return (
    // Not one big anchor any more: the save button has to be a sibling of the
    // link rather than a child of it, so the link is stretched behind the card
    // instead. A button inside an anchor is neither valid nor operable.
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-xl border bg-card p-4 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:border-brand/35 hover:shadow-md focus-within:ring-2 focus-within:ring-brand/40",
        className,
      )}
    >
      <Link
        href={agent.url || `/agents/${agent.id}`}
        aria-label={agent.name}
        className="absolute inset-0 rounded-xl focus-visible:outline-none"
      />

      <div className="flex items-start gap-3">
        {photo ? (
          <ApiImage
            src={photo}
            fallbackSrc={avatar}
            alt={agent.name}
            width={64}
            height={64}
            className="size-16 shrink-0 rounded-lg object-cover ring-1 ring-border"
          />
        ) : (
          <Image
            src={avatar}
            alt={agent.name}
            width={64}
            height={64}
            className="size-16 shrink-0 rounded-lg object-cover ring-1 ring-border"
          />
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Typography
                variant="h4"
                as="h3"
                className="truncate transition-colors group-hover:text-brand"
              >
                {agent.name}
              </Typography>
              {(agent.title || agent.activity_label) && (
                <Typography
                  variant="small"
                  className="mt-0.5 truncate"
                >
                  {agent.title || agent.activity_label}
                </Typography>
              )}
            </div>
            <span className="flex shrink-0 items-center gap-1.5">
              {agent.code && (
                <Badge>
                  <Typography as="span" variant="small" className="text-current">
                    کد {agent.code}
                  </Typography>
                </Badge>
              )}
              <AgentFavoriteButton agentId={agent.id} />
            </span>
          </div>

          <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            {agent.title && agent.activity_label && (
              <Meta icon={BriefcaseBusiness}>{agent.activity_label}</Meta>
            )}
            {location && <Meta icon={MapPin}>شعبه {location}</Meta>}
            {specialtyLabel && (
              <Meta icon={Building2}>
                تخصص: {specialtyLabel}
                {remainingSpecialties > 0 &&
                  ` و ${remainingSpecialties.toLocaleString("fa-IR")} مورد دیگر`}
              </Meta>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto pt-3">
        <div className="grid grid-cols-3 border-t pt-3">
          <Stat icon={Home} value={agent.estate_count} label="فایل فعال" />
          <Stat icon={Building2} value={agent.sale_count} label="فروش" />
          <Stat icon={KeyRound} value={agent.rent_count} label="اجاره" />
        </div>
      </div>
    </article>
  );
}

function Meta({
  icon: Icon,
  children,
}: {
  icon: typeof MapPin;
  children: React.ReactNode;
}) {
  return (
    <Typography as="span" variant="small" className="flex min-w-0 items-center gap-1">
      <Icon className="size-3 shrink-0 text-brand/70" />
      <span className="truncate">{children}</span>
    </Typography>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Home;
  value: number | null | undefined;
  label: string;
}) {
  return (
    <span className="flex min-w-0 items-center justify-center gap-1.5 border-s px-2 first:border-s-0">
      <Icon className="size-3.5 shrink-0 text-brand/70" />
      <span className="min-w-0">
        <Typography as="strong" variant="h4" className="block leading-none">
          {value === null || value === undefined
            ? "—"
            : value.toLocaleString("fa-IR")}
        </Typography>
        <Typography as="small" variant="small" className="mt-1 block truncate">
          {label}
        </Typography>
      </span>
    </span>
  );
}
