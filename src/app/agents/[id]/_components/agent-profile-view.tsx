import Link from "next/link";
import { Award, Building2, Home, Languages, MapPin } from "lucide-react";

import type { AgentDto, AgentProfileResponse } from "@/app/agents/_schemas/agents.schema";
import { AgentCard } from "@/app/agents/_components/agent-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PropertyCard } from "@/components/features/property/property-card";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { Typography } from "@/components/ui/typography";
import type { Listing } from "@/data/search";
import { routes } from "@/lib/routes";

import { AgentContactCard } from "./agent-contact-card";
import { AgentProfileHero } from "./agent-profile-hero";

type Contact = AgentProfileResponse["result"]["contact"];

export function AgentProfileView({
  agent,
  contact,
  estateCounts,
  listings,
  otherAgents,
}: {
  agent: AgentDto;
  contact: Contact;
  estateCounts: { all: number; sale: number; rent: number };
  listings: Listing[];
  otherAgents: AgentDto[];
}) {
  return (
    <div className="pb-16">
      <Breadcrumb
        items={[
          { label: "خانه", href: routes.home },
          { label: "کارشناسان", href: routes.agents },
          { label: agent.name },
        ]}
      />

      <AgentProfileHero agent={agent} contact={contact} />

      <Container className="mt-5">
        <div className="grid items-start gap-5 lg:grid-cols-3">
          <main className="grid min-w-0 gap-5 lg:col-span-2">
            <Expertise agent={agent} />
            <Listings agent={agent} counts={estateCounts} listings={listings} />
          </main>
          <aside className="grid gap-4 lg:sticky lg:top-20">
            <AgentContactCard agent={agent} contact={contact} />
            {otherAgents.length > 0 && (
              <section className="rounded-2xl border bg-card p-4">
                <Typography variant="h4" as="h2" className="mb-3 flex items-center gap-1.5"><Award className="size-4 text-brand" />کارشناسان دیگر</Typography>
                <div className="grid gap-3">{otherAgents.map((item) => <AgentCard key={item.id} agent={item} />)}</div>
              </section>
            )}
          </aside>
        </div>
      </Container>
    </div>
  );
}

function Expertise({ agent }: { agent: AgentDto }) {
  if (!agent.estate_types.length && !agent.districts.length && !agent.languages.length) return null;
  return (
    <section className="rounded-2xl border bg-card p-4 sm:p-5">
      <Typography variant="h4" as="h2" className="mb-4 flex items-center gap-2"><Building2 className="size-5 text-brand" />حوزه فعالیت</Typography>
      <div className="grid gap-4 sm:grid-cols-2">
        {agent.estate_types.length > 0 && <TagGroup title="نوع ملک" icon={Building2} items={agent.estate_types.map((item) => item.label)} />}
        {agent.districts.length > 0 && <TagGroup title="محله‌های فعالیت" icon={MapPin} items={agent.districts} />}
        {agent.languages.length > 0 && <TagGroup title="زبان‌های ارتباطی" icon={Languages} items={agent.languages} />}
      </div>
    </section>
  );
}

function TagGroup({ title, icon: Icon, items }: { title: string; icon: typeof Building2; items: string[] }) {
  return <div><Typography variant="small" className="mb-2 font-medium text-foreground">{title}</Typography><div className="flex flex-wrap gap-2">{items.map((item) => <Typography as="span" variant="small" key={item} className="flex items-center gap-1.5 rounded-lg bg-muted/60 px-3 py-1.5"><Icon className="size-3.5 text-brand/70" />{item}</Typography>)}</div></div>;
}

function Listings({ agent, counts, listings }: { agent: AgentDto; counts: { all: number; sale: number; rent: number }; listings: Listing[] }) {
  return (
    <section className="min-w-0">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div><Typography variant="h3" as="h2">فایل‌های فعال</Typography><Typography variant="small" className="mt-0.5">{counts.all.toLocaleString("fa-IR")} فایل در دست {agent.name}</Typography></div>
        <div className="flex gap-1.5"><Typography as="span" variant="small" className="rounded-full bg-brand/10 px-2.5 py-1 text-brand">فروش {counts.sale.toLocaleString("fa-IR")}</Typography><Typography as="span" variant="small" className="rounded-full bg-secondary/15 px-2.5 py-1 text-foreground">اجاره {counts.rent.toLocaleString("fa-IR")}</Typography></div>
      </div>
      {listings.length ? (
        <div className="-mx-page flex gap-3 overflow-x-auto overflow-y-hidden px-page pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0">{listings.map((listing) => <PropertyCard key={listing.id} estate={listing} className="w-[70vw] shrink-0 sm:w-auto" />)}</div>
      ) : (
        <EmptyState icon={Home} title="در حال حاضر فایل فعالی ندارد" description="برای دریافت فایل‌های جدید با این کارشناس در تماس باشید." />
      )}
    </section>
  );
}
