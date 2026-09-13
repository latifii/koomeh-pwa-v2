import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

import type {
  AgentDto,
  AgentProfileResponse,
} from "@/app/agents/_schemas/agents.schema";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

type Contact = AgentProfileResponse["result"]["contact"];

/**
 * How to reach the consultant: the number as the one big button, WhatsApp
 * beside it, and under a rule the branch — its name as a link, its address,
 * its own number when that is a different one.
 */
export function AgentContactCard({
  agent,
  contact,
}: {
  agent: AgentDto;
  contact: Contact;
}) {
  const phone = contact?.phone ?? agent.phone ?? contact?.branch_phone;
  const branchPhone =
    contact?.branch_phone && contact.branch_phone !== phone
      ? contact.branch_phone
      : null;

  return (
    <section className="overflow-hidden rounded-2xl border bg-card">
      <div className="p-4">
        <Typography variant="h4" as="h2">
          ارتباط با {agent.name}
        </Typography>
        <Typography variant="small" className="mt-0.5">
          برای مشاوره و بازدید، مستقیم تماس بگیرید.
        </Typography>

        <div className="mt-3 grid gap-2">
          {phone && (
            <Button
              size="lg"
              nativeButton={false}
              render={<a href={contact?.tel_url ?? `tel:${phone}`} />}
              className="w-full tabular-nums"
            >
              <Phone data-icon="inline-start" />
              <span dir="ltr">{phone}</span>
            </Button>
          )}
          {contact?.whatsapp_url && (
            <Button
              variant="outline"
              size="lg"
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
              گفتگو در واتساپ
            </Button>
          )}
        </div>
      </div>

      {agent.branch && (
        <div className="border-t bg-muted/30 p-4">
          <Link
            href={agent.branch.url || "/#branches"}
            className="group flex items-center justify-between gap-2"
          >
            <Typography
              as="span"
              variant="small"
              className="flex items-center gap-1.5 font-medium text-foreground group-hover:text-brand"
            >
              <Building2 className="size-4 text-brand" />
              شعبه {agent.branch.name}
            </Typography>
            <ArrowLeft className="size-4 text-muted-foreground" />
          </Link>
          {agent.branch.address && (
            <Typography
              variant="small"
              className="mt-2 flex items-start gap-1.5 leading-5"
            >
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-brand/70" />
              {agent.branch.address}
            </Typography>
          )}
          {branchPhone && (
            <Typography
              as="a"
              variant="small"
              href={`tel:${branchPhone}`}
              className="mt-2 flex items-center gap-1.5 hover:text-brand"
            >
              <Phone className="size-3.5 text-brand/70" />
              تلفن شعبه: <span dir="ltr">{branchPhone}</span>
            </Typography>
          )}
        </div>
      )}
    </section>
  );
}
