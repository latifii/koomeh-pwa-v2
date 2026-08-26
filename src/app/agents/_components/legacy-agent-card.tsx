import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";

import { Typography } from "@/components/ui/typography";
import { defaultAvatars } from "@/data/avatars";
import type { Agent } from "@/data/agents";
import { routes } from "@/lib/routes";

/** فقط برای داده‌های نمونه‌ی بخش علاقه‌مندی‌ها؛ صفحات agents از این مدل استفاده نمی‌کنند. */
export function LegacyAgentCard({ agent }: { agent: Agent }) {
  return (
    <Link href={routes.agent(agent.id)} className="flex items-center gap-3 rounded-2xl border bg-card p-4 hover:border-brand/30">
      <Image src={defaultAvatars[agent.gender]} alt={agent.name} width={56} height={56} className="size-14 rounded-xl object-cover" />
      <span className="min-w-0 flex-1">
        <Typography variant="h4" as="h3" className="truncate">{agent.name}</Typography>
        <Typography variant="small" className="mt-1 flex items-center gap-1"><MapPin className="size-3" />{agent.branch}</Typography>
      </span>
      <ArrowLeft className="size-4 text-brand" />
    </Link>
  );
}
