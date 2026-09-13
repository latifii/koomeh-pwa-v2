import Image from "next/image";
import {
  Award,
  BriefcaseBusiness,
  Building2,
  Home,
  KeyRound,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

import { AgentFavoriteButton } from "@/app/agents/_components/agent-favorite-button";
import type {
  AgentDto,
  AgentProfileResponse,
} from "@/app/agents/_schemas/agents.schema";
import { Container } from "@/components/layout/container";
import { ApiImage } from "@/components/shared/api-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { defaultAvatars } from "@/data/avatars";
import { toAbsoluteMediaUrl } from "@/lib/api/config";
import { cn } from "@/lib/utils";

type Contact = AgentProfileResponse["result"]["contact"];

/**
 * The top of a consultant's page: a brand band with the portrait breaking
 * out of it, the name and role, where they work, and the two ways to reach
 * them; under it, the figures — files, sales, rentals, years — as tiles.
 */
export function AgentProfileHero({
  agent,
  contact,
}: {
  agent: AgentDto;
  contact: Contact;
}) {
  const avatar = defaultAvatars[agent.gender === "female" ? "female" : "male"];
  const photo = toAbsoluteMediaUrl(agent.photo ?? null);
  const phone = contact?.phone ?? agent.phone;
  const imageClass =
    "size-28 rounded-full object-cover ring-4 ring-card shadow-lg sm:size-32";

  return (
    <Container>
      <section className="overflow-hidden rounded-3xl border bg-card">
        <div className="h-28 bg-linear-to-l from-primary via-primary-deep to-primary sm:h-32">
          <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_40%)]" />
        </div>

        <div className="-mt-14 flex flex-col gap-4 px-5 pb-5 sm:-mt-16 sm:flex-row sm:items-end sm:px-6">
          {photo ? (
            <ApiImage
              src={photo}
              fallbackSrc={avatar}
              alt={agent.name}
              width={128}
              height={128}
              priority
              className={imageClass}
            />
          ) : (
            <Image
              src={avatar}
              alt={agent.name}
              width={128}
              height={128}
              priority
              className={imageClass}
            />
          )}

          <div className="min-w-0 flex-1 sm:pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <Typography variant="h2" as="h1" className="leading-tight">
                {agent.name}
              </Typography>
              {agent.code && (
                <Badge variant="outline" className="tabular-nums">
                  کد {agent.code}
                </Badge>
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              {agent.activity_label && (
                <Badge variant="secondary" className="gap-1">
                  <BriefcaseBusiness className="size-3" />
                  {agent.activity_label}
                </Badge>
              )}
              {agent.title && (
                <Typography as="span" variant="small">
                  {agent.title}
                </Typography>
              )}
              {agent.branch?.name && (
                <Typography
                  as="span"
                  variant="small"
                  className="flex items-center gap-1"
                >
                  <MapPin className="size-3.5 text-brand/70" />
                  شعبه {agent.branch.name}
                  {agent.city?.name ? `، ${agent.city.name}` : ""}
                </Typography>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:pb-1">
            {phone && (
              <Button
                nativeButton={false}
                render={<a href={contact?.tel_url ?? `tel:${phone}`} />}
              >
                <Phone data-icon="inline-start" />
                تماس
              </Button>
            )}
            {contact?.whatsapp_url && (
              <Button
                variant="outline"
                nativeButton={false}
                render={
                  <a
                    href={contact.whatsapp_url}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              >
                <MessageCircle data-icon="inline-start" />
                واتساپ
              </Button>
            )}
            <AgentFavoriteButton agentId={agent.id} variant="labelled" />
          </div>
        </div>

        {/* The years only when the profile has them: a «—» tile says nothing. */}
        <dl
          className={cn(
            "grid grid-cols-2 gap-px border-t bg-border",
            agent.experience_years ? "sm:grid-cols-4" : "sm:grid-cols-3",
          )}
        >
          <Stat icon={Home} value={agent.estate_count} label="فایل فعال" />
          <Stat icon={Building2} value={agent.sale_count} label="فایل فروش" />
          <Stat icon={KeyRound} value={agent.rent_count} label="فایل اجاره" />
          {agent.experience_years ? (
            <Stat
              icon={Award}
              value={agent.experience_years}
              label="سال سابقه"
            />
          ) : null}
        </dl>
      </section>
    </Container>
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
    <div className="flex items-center gap-3 bg-card px-4 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <dd className="m-0 font-heading text-lg font-bold leading-none tabular-nums">
          {value === null || value === undefined
            ? "—"
            : value.toLocaleString("fa-IR")}
        </dd>
        <dt className="mt-1 text-[11px] text-muted-foreground">{label}</dt>
      </span>
    </div>
  );
}
