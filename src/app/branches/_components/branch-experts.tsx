import Image from "next/image";
import { Phone } from "lucide-react";

import { AgentCard } from "@/app/agents/_components/agent-card";
import type { AgentDto } from "@/app/agents/_schemas/agents.schema";
import { Typography } from "@/components/ui/typography";
import { defaultAvatars } from "@/data/avatars";
import { cn } from "@/lib/utils";

/**
 * A swipeable rail of the branch's agents on phones, a grid from `sm` up.
 *
 * `overflow-y` has to be pinned, here and in every other rail on the site. Left
 * alone it is `visible`, and CSS computes `visible` to `auto` when the other
 * axis is not visible — so a rail meant to move sideways was quietly a vertical
 * scroller too. It needs only a sub-pixel of slack to matter, and a card sized
 * in `vw` with an `aspect-*` image almost never lands on a whole pixel: the
 * rail then swallowed the vertical drag meant for the page, and the page would
 * not move while a finger was on a card. `hidden` changes nothing visually —
 * an `auto` axis already clipped what overflowed it.
 */
export function BranchExperts({ experts }: { experts: AgentDto[] }) {
  return (
    <div className="-mx-page flex snap-x snap-mandatory gap-3 overflow-x-auto overflow-y-hidden px-page pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
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
