import Link from "next/link";
import {
  Building2,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import type { Agent } from "@/data/agents";

/**
 * The sidebar contact hub. An advisor's line is public, so — like a branch —
 * the number shows directly with no reveal gate.
 */
export function AgentContactCard({ agent }: { agent: Agent }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <Typography variant="h4" as="h2" className="sm:text-sm">
        ارتباط با {agent.name}
      </Typography>

      <div className="mt-3 grid gap-2">
        <Button
          size="lg"
          nativeButton={false}
          render={<a href={`tel:${agent.phone}`} />}
          className="w-full font-heading tracking-wide"
        >
          <Phone data-icon="inline-start" />
          {agent.phone}
        </Button>

        <div className="grid grid-cols-2 gap-2">
          {agent.social.whatsapp && (
            <Button variant="outline" size="sm">
              <MessageCircle data-icon="inline-start" />
              واتساپ
            </Button>
          )}
          {agent.social.telegram && (
            <Button variant="outline" size="sm">
              <Send data-icon="inline-start" />
              تلگرام
            </Button>
          )}
        </div>
      </div>

      <Separator className="my-3.5" />

      <Button
        variant="ghost"
        size="sm"
        nativeButton={false}
        render={<Link href="/#branches" />}
        className="w-full justify-between text-foreground"
      >
        <span className="flex items-center gap-1.5">
          <Building2 className="size-4 text-brand" />
          شعبه {agent.branch}
        </span>
      </Button>

      <Typography
        variant="small"
        className="mt-2 text-center text-[11px] leading-5"
      >
        هنگام تماس اعلام کنید شماره را در کومه دیده‌اید.
      </Typography>
    </div>
  );
}
