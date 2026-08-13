import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Award, Handshake, Home, MapPin, Star } from "lucide-react";

import { Typography } from "@/components/ui/typography";
import { defaultAvatars } from "@/data/avatars";
import {
  type Agent,
  activityShortLabels,
  getAgentListingCount,
} from "@/data/agents";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";

/** Top-rated ribbon, reused on the card and the profile hero. */
export function TopRatedBadge({ className }: { className?: string }) {
  return (
    <Typography
      as="span"
      variant="small"
      className={cn(
        "flex w-fit items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground",
        className
      )}
    >
      <Award className="size-3" />
      برترین
    </Typography>
  );
}

/**
 * The advisor card used across the search grid and the homepage. Photo, name,
 * activity, the two numbers a client scans for (rating and active files), and a
 * clear affordance into the profile.
 */
export function AgentCard({
  agent,
  className,
}: {
  agent: Agent;
  className?: string;
}) {
  const listingCount = getAgentListingCount(agent);

  return (
    <Link
      href={routes.agent(agent.id)}
      className={cn(
        "group flex flex-col gap-3 rounded-2xl border bg-card p-4 transition-colors hover:border-brand/30",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <span className="relative shrink-0">
          <Image
            src={defaultAvatars[agent.gender]}
            alt={agent.name}
            width={64}
            height={64}
            className="size-16 rounded-2xl object-cover ring-2 ring-border transition-transform duration-300 group-hover:scale-105"
          />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Typography
              variant="h4"
              as="h3"
              className="truncate transition-colors group-hover:text-brand sm:text-sm"
            >
              {agent.name}
            </Typography>
            {agent.isTopRated && (
              <Award className="size-4 shrink-0 text-secondary" />
            )}
          </div>
          <Typography variant="small" className="truncate">
            {activityShortLabels[agent.activity]}
          </Typography>
          <Typography
            as="span"
            variant="small"
            className="mt-0.5 flex items-center gap-1 text-[11px]"
          >
            <MapPin className="size-3 text-brand/70" />
            شعبه {agent.branch}
          </Typography>
        </div>

        <span className="flex size-7 shrink-0 items-center justify-center self-start rounded-full bg-muted text-brand transition-colors group-hover:bg-brand group-hover:text-white">
          <ArrowLeft className="size-3.5" />
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 border-t pt-3 text-center">
        <Stat
          icon={Star}
          value={agent.rating.toLocaleString("fa-IR")}
          label="امتیاز"
          iconClassName="fill-secondary text-secondary"
        />
        <Stat
          icon={Home}
          value={listingCount.toLocaleString("fa-IR")}
          label="فایل فعال"
        />
        <Stat
          icon={Handshake}
          value={agent.totalDeals.toLocaleString("fa-IR")}
          label="معامله"
        />
      </div>
    </Link>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
  iconClassName,
}: {
  icon: typeof Star;
  value: string;
  label: string;
  iconClassName?: string;
}) {
  return (
    <span className="flex flex-col items-center gap-0.5">
      <span className="flex items-center gap-1">
        <Icon className={cn("size-3.5 text-brand/70", iconClassName)} />
        <Typography as="span" variant="h4" className="text-[13px] sm:text-[13px]">
          {value}
        </Typography>
      </span>
      <Typography as="span" variant="small" className="text-[11px]">
        {label}
      </Typography>
    </span>
  );
}
