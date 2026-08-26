import Link from "next/link";
import { Building2, MapPin, MessageCircle, Phone } from "lucide-react";

import type { AgentDto, AgentProfileResponse } from "@/app/agents/_schemas/agents.schema";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";

type Contact = AgentProfileResponse["result"]["contact"];

export function AgentContactCard({ agent, contact }: { agent: AgentDto; contact: Contact }) {
  const phone = contact?.phone ?? agent.phone ?? contact?.branch_phone;
  return (
    <section className="rounded-2xl border bg-card p-4">
      <Typography variant="h4" as="h2">ارتباط با {agent.name}</Typography>
      <div className="mt-3 grid gap-2">
        {phone && <Button size="lg" nativeButton={false} render={<a href={contact?.tel_url ?? `tel:${phone}`} />} className="w-full"><Phone data-icon="inline-start" />{phone}</Button>}
        {contact?.whatsapp_url && <Button variant="outline" nativeButton={false} render={<a href={contact.whatsapp_url} target="_blank" rel="noreferrer" />}><MessageCircle data-icon="inline-start" />واتساپ</Button>}
      </div>
      {agent.branch && <><Separator className="my-3.5" /><Button variant="ghost" size="sm" nativeButton={false} render={<Link href={agent.branch.url || "/#branches"} />} className="w-full justify-between"><span className="flex items-center gap-1.5"><Building2 className="size-4 text-brand" />{agent.branch.name}</span></Button></>}
      {agent.branch?.address && <Typography variant="small" className="mt-2 flex items-start gap-1.5 leading-5"><MapPin className="mt-0.5 size-3.5 shrink-0 text-brand" />{agent.branch.address}</Typography>}
      {contact?.branch_phone && contact.branch_phone !== phone && <Typography as="a" variant="small" href={`tel:${contact.branch_phone}`} className="mt-2 flex items-center gap-1.5 hover:text-brand"><Phone className="size-3.5" />تلفن شعبه: {contact.branch_phone}</Typography>}
    </section>
  );
}
