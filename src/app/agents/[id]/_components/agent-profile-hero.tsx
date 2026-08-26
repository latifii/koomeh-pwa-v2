import Image from "next/image";
import { BriefcaseBusiness, Building2, Home, KeyRound, MapPin, MessageCircle, Phone } from "lucide-react";

import type { AgentDto, AgentProfileResponse } from "@/app/agents/_schemas/agents.schema";
import { Container } from "@/components/layout/container";
import { ApiImage } from "@/components/shared/api-image";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { defaultAvatars } from "@/data/avatars";
import { toAbsoluteMediaUrl } from "@/lib/api/config";

type Contact = AgentProfileResponse["result"]["contact"];

export function AgentProfileHero({ agent, contact }: { agent: AgentDto; contact: Contact }) {
  const avatar = defaultAvatars[agent.gender === "female" ? "female" : "male"];
  const photo = toAbsoluteMediaUrl(agent.photo ?? null);
  const phone = contact?.phone ?? agent.phone;
  const location = [agent.branch?.name, agent.city?.name].filter(Boolean).join("، ");

  return (
    <Container>
      <section className="overflow-hidden rounded-xl border border-primary bg-primary text-primary-foreground">
        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
          {photo ? (
            <ApiImage src={photo} fallbackSrc={avatar} alt={agent.name} width={112} height={112} priority className="size-24 shrink-0 rounded-lg object-cover ring-1 ring-border sm:size-28" />
          ) : (
            <Image src={avatar} alt={agent.name} width={112} height={112} priority className="size-24 shrink-0 rounded-lg object-cover ring-1 ring-border sm:size-28" />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {agent.activity_label && <Typography as="span" variant="small" light className="flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 font-medium text-white"><BriefcaseBusiness className="size-3.5 text-secondary" />{agent.activity_label}</Typography>}
              {agent.code && <Typography as="span" variant="small" light className="rounded-full border border-white/15 px-2.5 py-1">کد {agent.code}</Typography>}
            </div>

            <Typography variant="h2" as="h1" light className="mt-2">{agent.name}</Typography>
            {agent.title && <Typography variant="small" light className="mt-1 text-white/70">{agent.title}</Typography>}
            {location && <Typography variant="small" light className="mt-2 flex items-center gap-1.5 text-white/75"><MapPin className="size-3.5 text-secondary" />{location}</Typography>}
            {agent.bio && <Typography variant="body" light className="mt-3 max-w-2xl">{agent.bio}</Typography>}
          </div>

          {(phone || contact?.whatsapp_url) && (
            <div className="flex shrink-0 gap-2 sm:flex-col">
              {phone && <Button variant="secondary" nativeButton={false} render={<a href={contact?.tel_url ?? `tel:${phone}`} />}><Phone data-icon="inline-start" />تماس مستقیم</Button>}
              {contact?.whatsapp_url && <Button variant="outline" nativeButton={false} render={<a href={contact.whatsapp_url} target="_blank" rel="noreferrer" />} className="border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white"><MessageCircle data-icon="inline-start" />واتساپ</Button>}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 border-t border-white/10 bg-white/5">
          <Stat icon={Home} value={agent.estate_count} label="فایل فعال" />
          <Stat icon={Building2} value={agent.sale_count} label="فایل فروش" />
          <Stat icon={KeyRound} value={agent.rent_count} label="فایل اجاره" />
        </div>
      </section>
    </Container>
  );
}

function Stat({ icon: Icon, value, label }: { icon: typeof Home; value: number | null | undefined; label: string }) {
  return <div className="flex items-center justify-center gap-2 border-s border-white/10 px-3 py-3.5 first:border-s-0"><Icon className="size-4 shrink-0 text-secondary" /><span><Typography as="strong" variant="h4" light className="block leading-none">{value === null || value === undefined ? "—" : value.toLocaleString("fa-IR")}</Typography><Typography as="small" variant="small" light className="mt-1 block">{label}</Typography></span></div>;
}
