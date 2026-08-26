import Image from "next/image";
import { Phone } from "lucide-react";

import { AgentCard } from "@/app/agents/_components/agent-card";
import type { AgentDto } from "@/app/agents/_schemas/agents.schema";
import { Typography } from "@/components/ui/typography";
import { defaultAvatars } from "@/data/avatars";
import { cn } from "@/lib/utils";

export function BranchExperts({ experts }: { experts: AgentDto[] }) {
  return (
    <div className="-mx-page flex snap-x snap-mandatory gap-3 overflow-x-auto px-page pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
      {experts.map((expert) => (
        <AgentCard
          key={expert.id}
          agent={expert}
          className="w-[78vw] shrink-0 snap-start sm:w-auto"
        />
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
  gender?: AgentDto["gender"];
  phone?: string;
  className?: string;
}) {
  const avatar = defaultAvatars[gender === "female" ? "female" : "male"];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src={avatar}
        alt={name}
        width={44}
        height={44}
        className="size-11 rounded-full object-cover ring-2 ring-secondary/40"
      />
      <div className="min-w-0 flex-1">
        <Typography variant="h4" as="p" className="truncate">
          {name}
        </Typography>
        <Typography variant="small">مدیر شعبه</Typography>
      </div>
      {phone && (
        <a
          href={`tel:${phone}`}
          aria-label={`تماس با ${name}`}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand transition-colors hover:bg-brand hover:text-white"
        >
          <Phone className="size-4" />
        </a>
      )}
    </div>
  );
}
