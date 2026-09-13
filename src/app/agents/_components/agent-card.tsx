import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  Home,
  KeyRound,
  MapPin,
  Phone,
} from "lucide-react";

import { AgentFavoriteButton } from "@/app/agents/_components/agent-favorite-button";
import type { AgentDto } from "@/app/agents/_schemas/agents.schema";
import { ApiImage } from "@/components/shared/api-image";
import { Badge } from "@/components/ui/badge";
import { Typography } from "@/components/ui/typography";
import { defaultAvatars } from "@/data/avatars";
import { toAbsoluteMediaUrl } from "@/lib/api/config";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

/**
 * A consultant, as a card: the photo large and round over a soft band, the
 * name and what they do under it, their branch, their specialities, then
 * the three counts and a way to call. The whole card opens the profile;
 * the phone and the save button are siblings of that link, since a button
 * inside an anchor is neither valid nor operable.
 */
export function AgentCard({
  agent,
  className,
}: {
  agent: AgentDto;
  className?: string;
}) {
  const avatar = defaultAvatars[agent.gender === "female" ? "female" : "male"];
  const photo = toAbsoluteMediaUrl(agent.photo ?? null);
  const href = agent.url || routes.agent(agent.id);
  const specialties = agent.estate_types.slice(0, 3);
  const remaining = agent.estate_types.length - specialties.length;
  const imageClass =
    "size-20 rounded-full object-cover ring-4 ring-card shadow-md";

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-lg hover:shadow-black/5 focus-within:ring-2 focus-within:ring-brand/40",
        className,
      )}
    >
      <Link
        href={href}
        aria-label={agent.name}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none"
      />

      {/* A band behind the portrait, so the round photo has something to
          sit on instead of floating in white space. */}
      <div className="h-14 bg-linear-to-l from-brand/15 via-brand/5 to-secondary/20" />

      <div className="absolute top-3 inset-e-3 z-20 flex items-center gap-1.5">
        <AgentFavoriteButton agentId={agent.id} />
      </div>

      <div className="-mt-10 flex flex-1 flex-col items-center px-4 pb-4 text-center">
        {photo ? (
          <ApiImage
            src={photo}
            fallbackSrc={avatar}
            alt={agent.name}
            width={80}
            height={80}
            className={imageClass}
          />
        ) : (
          <Image
            src={avatar}
            alt={agent.name}
            width={80}
            height={80}
            className={imageClass}
          />
        )}

        <Typography
          variant="h4"
          as="h3"
          className="mt-2.5 line-clamp-1 transition-colors group-hover:text-brand"
        >
          {agent.name}
        </Typography>

        <span className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5">
          {agent.activity_label && (
            <Badge variant="secondary" className="gap-1">
              <BriefcaseBusiness className="size-3" />
              {agent.activity_label}
            </Badge>
          )}
          {agent.code && (
            <Badge variant="outline" className="tabular-nums">
              کد {agent.code}
            </Badge>
          )}
        </span>

        {agent.branch?.name && (
          <Typography
            as="span"
            variant="small"
            className="mt-2 flex items-center gap-1"
          >
            <MapPin className="size-3.5 text-brand/70" />
            شعبه {agent.branch.name}
          </Typography>
        )}

        {specialties.length > 0 && (
          <span className="mt-2.5 flex flex-wrap items-center justify-center gap-1">
            {specialties.map((type) => (
              <Typography
                key={type.id}
                as="span"
                variant="small"
                className="rounded-md bg-muted px-2 py-0.5 text-[11px]"
              >
                {type.label}
              </Typography>
            ))}
            {remaining > 0 && (
              <Typography
                as="span"
                variant="small"
                className="rounded-md bg-muted px-2 py-0.5 text-[11px]"
              >
                +{remaining.toLocaleString("fa-IR")}
              </Typography>
            )}
          </span>
        )}

        <dl className="mt-4 grid w-full grid-cols-3 divide-x divide-x-reverse divide-border rounded-xl border bg-muted/40 py-2">
          <Stat icon={Home} value={agent.estate_count} label="فایل فعال" />
          <Stat icon={Building2} value={agent.sale_count} label="فروش" />
          <Stat icon={KeyRound} value={agent.rent_count} label="اجاره" />
        </dl>

        <div className="mt-3 flex w-full items-center gap-2">
          <span className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-brand/10 py-2 text-xs font-medium text-brand transition-colors group-hover:bg-brand group-hover:text-white">
            مشاهده پروفایل
            <ArrowLeft className="size-3.5" />
          </span>
          {agent.phone && (
            <a
              href={`tel:${agent.phone}`}
              aria-label={`تماس با ${agent.name}`}
              className="relative z-20 flex size-9 shrink-0 items-center justify-center rounded-lg border bg-card text-brand transition-colors hover:border-brand hover:bg-brand hover:text-white"
            >
              <Phone className="size-4" />
            </a>
          )}
        </div>
      </div>
    </article>
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
    <div className="flex flex-col items-center gap-0.5 px-1">
      <dd className="m-0 flex items-center gap-1 font-heading text-sm font-bold tabular-nums">
        <Icon className="size-3.5 text-brand/70" />
        {value === null || value === undefined
          ? "—"
          : value.toLocaleString("fa-IR")}
      </dd>
      <dt className="text-[10px] text-muted-foreground">{label}</dt>
    </div>
  );
}

/** A slim row for lists beside a profile — the photo, the name, the branch. */
export function AgentRow({ agent }: { agent: AgentDto }) {
  const avatar = defaultAvatars[agent.gender === "female" ? "female" : "male"];
  const photo = toAbsoluteMediaUrl(agent.photo ?? null);
  const imageClass =
    "size-11 shrink-0 rounded-full object-cover ring-1 ring-border";

  return (
    <Link
      href={agent.url || routes.agent(agent.id)}
      className="group flex items-center gap-3 rounded-xl border border-transparent p-2 transition-colors hover:border-border hover:bg-muted/50"
    >
      {photo ? (
        <ApiImage
          src={photo}
          fallbackSrc={avatar}
          alt={agent.name}
          width={44}
          height={44}
          className={imageClass}
        />
      ) : (
        <Image
          src={avatar}
          alt={agent.name}
          width={44}
          height={44}
          className={imageClass}
        />
      )}
      <span className="min-w-0 flex-1">
        <Typography
          as="span"
          variant="small"
          className="block truncate font-semibold text-foreground transition-colors group-hover:text-brand"
        >
          {agent.name}
        </Typography>
        <Typography
          as="span"
          variant="small"
          className="block truncate text-[11px]"
        >
          {[
            agent.activity_label,
            agent.branch?.name && `شعبه ${agent.branch.name}`,
          ]
            .filter(Boolean)
            .join(" · ")}
        </Typography>
      </span>
      <ArrowLeft className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  );
}
