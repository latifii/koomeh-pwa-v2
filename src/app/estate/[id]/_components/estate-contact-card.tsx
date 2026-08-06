"use client";

import { useState } from "react";
import { BadgeCheck, CalendarDays, MessageCircle, Phone, Send } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { defaultAvatars } from "@/data/avatars";
import type { EstateDetail } from "@/data/estate-detail";

/**
 * Contact is the conversion point of the page, so the number stays hidden
 * behind one deliberate tap: it keeps scrapers out and gives us a signal for
 * how many visitors actually intend to call.
 */
export function EstateContactCard({ agent }: { agent: EstateDetail["agent"] }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar className="size-12 ring-2 ring-secondary/40">
          <AvatarImage src={defaultAvatars[agent.gender].src} alt={agent.name} />
          <AvatarFallback className="font-semibold">
            {agent.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 font-heading text-sm font-semibold">
            {agent.name}
            <BadgeCheck className="size-4 shrink-0 text-brand" />
          </p>
          <p className="truncate text-xs text-muted-foreground">
            کارشناس شعبه {agent.branch}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <Stat value={agent.deals.toLocaleString("fa-IR")} label="معامله موفق" />
        <Stat
          value={`${agent.yearsActive.toLocaleString("fa-IR")} سال`}
          label="سابقه فعالیت"
        />
      </div>

      <Separator className="my-3.5" />

      <div className="grid gap-2">
        {revealed ? (
          <Button
            size="lg"
            nativeButton={false}
            render={<a href={`tel:${agent.phone}`} />}
            className="w-full font-heading tracking-wide"
          >
            <Phone data-icon="inline-start" />
            {agent.phone}
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={() => setRevealed(true)}
            className="w-full font-heading"
          >
            <Phone data-icon="inline-start" />
            نمایش شماره تماس
          </Button>
        )}

        <Button variant="outline" size="lg" className="w-full">
          <CalendarDays data-icon="inline-start" />
          درخواست بازدید حضوری
        </Button>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm">
            <MessageCircle data-icon="inline-start" />
            واتساپ
          </Button>
          <Button variant="outline" size="sm">
            <Send data-icon="inline-start" />
            تلگرام
          </Button>
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] leading-5 text-muted-foreground">
        هنگام تماس اعلام کنید ملک را در کومه دیده‌اید.
      </p>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-muted/60 px-2 py-2">
      <p className="font-heading text-sm font-bold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
