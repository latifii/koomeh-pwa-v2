import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Award,
  Briefcase,
  Building2,
  CalendarClock,
  ChevronLeft,
  Handshake,
  Home,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
  Star,
} from "lucide-react";

import { PropertyCard } from "@/components/property/property-card";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { AgentCard, TopRatedBadge } from "@/components/agent/agent-card";
import { defaultAvatars } from "@/data/avatars";
import {
  type Agent,
  activityLabels,
  agents,
  getAgent,
  getAgentListings,
  getAllAgentIds,
} from "@/data/agents";
import { propertyTypeLabels } from "@/data/home";

import { AgentContactCard } from "./_components/agent-contact-card";

export function generateStaticParams() {
  return getAllAgentIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const agent = getAgent(id);

  if (!agent) return { title: "کارشناس یافت نشد | کومه" };

  return {
    title: `${agent.name} | ${activityLabels[agent.activity]} کومه`,
    description: agent.bio.slice(0, 150),
  };
}

export default async function AgentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = getAgent(id);

  if (!agent) notFound();

  const listings = getAgentListings(agent);
  const otherAgents = agents.filter((item) => item.id !== agent.id).slice(0, 3);

  const stats = [
    {
      icon: Home,
      value: listings.length.toLocaleString("fa-IR"),
      label: "فایل فعال",
    },
    {
      icon: Handshake,
      value: `${agent.totalDeals.toLocaleString("fa-IR")}`,
      label: "معامله موفق",
    },
    {
      icon: CalendarClock,
      value: `${agent.yearsActive.toLocaleString("fa-IR")} سال`,
      label: "سابقه فعالیت",
    },
    {
      icon: Star,
      value: agent.rating.toLocaleString("fa-IR"),
      label: `${agent.reviewsCount.toLocaleString("fa-IR")} نظر`,
    },
  ];

  return (
    <div className="pb-16">
      <Container className="py-3">
        <nav
          aria-label="مسیر صفحه"
          className="flex items-center gap-1 overflow-x-auto text-xs text-muted-foreground [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <Link href="/" className="shrink-0 hover:text-brand">
            خانه
          </Link>
          <ChevronLeft className="size-3.5 shrink-0" />
          <Link href="/agents/search" className="shrink-0 hover:text-brand">
            کارشناسان
          </Link>
          <ChevronLeft className="size-3.5 shrink-0" />
          <Typography
            as="span"
            variant="small"
            className="shrink-0 font-medium text-foreground"
          >
            {agent.name}
          </Typography>
        </nav>
      </Container>

      {/* Hero band */}
      <Container>
        <section className="relative overflow-hidden rounded-3xl bg-primary p-5 text-primary-foreground sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 inset-e-[-4rem] size-80 rounded-full bg-secondary/15 blur-[120px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-28 inset-s-[-6rem] size-80 rounded-full bg-white/5 blur-[120px]"
          />

          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-start">
            <Image
              src={defaultAvatars[agent.gender]}
              alt={agent.name}
              width={128}
              height={128}
              priority
              className="size-24 shrink-0 rounded-2xl object-cover ring-2 ring-white/20 sm:size-32"
            />

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Typography
                  as="span"
                  variant="small"
                  light
                  className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium backdrop-blur-md"
                >
                  <Briefcase className="size-3.5 text-secondary" />
                  {activityLabels[agent.activity]}
                </Typography>
                {agent.isTopRated && <TopRatedBadge />}
              </div>

              <Typography variant="h2" as="h1" light className="text-2xl sm:text-3xl">
                {agent.name}
              </Typography>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <Typography
                  as="span"
                  variant="small"
                  light
                  className="flex items-center gap-1 text-white/80"
                >
                  <Star className="size-3.5 fill-secondary text-secondary" />
                  {agent.rating.toLocaleString("fa-IR")} از ۵ ·{" "}
                  {agent.reviewsCount.toLocaleString("fa-IR")} نظر
                </Typography>
                <Typography
                  as="span"
                  variant="small"
                  light
                  className="flex items-center gap-1 text-white/80"
                >
                  <MapPin className="size-3.5 text-secondary" />
                  شعبه {agent.branch}
                </Typography>
              </div>

              <Typography
                as="p"
                variant="body"
                light
                className="mt-3 max-w-2xl leading-7 text-white/75"
              >
                {agent.bio}
              </Typography>

              <div className="mt-5 flex flex-wrap gap-2.5">
                <Button
                  size="lg"
                  variant="secondary"
                  nativeButton={false}
                  render={<a href={`tel:${agent.phone}`} />}
                  className="font-heading tracking-wide"
                >
                  <Phone data-icon="inline-start" />
                  {agent.phone}
                </Button>
                {agent.social.whatsapp && (
                  <Button
                    size="lg"
                    nativeButton={false}
                    render={<a href="#" />}
                    className="border border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  >
                    <MessageCircle data-icon="inline-start" />
                    واتساپ
                  </Button>
                )}
                {agent.social.telegram && (
                  <Button
                    size="lg"
                    nativeButton={false}
                    render={<a href="#" />}
                    className="border border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                  >
                    <Send data-icon="inline-start" />
                    تلگرام
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      </Container>

      {/* Stats strip */}
      <Container className="mt-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-2xl border bg-card p-3.5"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <stat.icon className="size-5" />
              </span>
              <span className="min-w-0">
                <Typography
                  as="span"
                  variant="h4"
                  className="block text-lg font-bold leading-tight sm:text-lg"
                >
                  {stat.value}
                </Typography>
                <Typography
                  as="span"
                  variant="small"
                  className="block truncate text-[11px]"
                >
                  {stat.label}
                </Typography>
              </span>
            </div>
          ))}
        </div>
      </Container>

      <Container className="mt-5">
        <div className="grid items-start gap-5 lg:grid-cols-3">
          <div className="grid min-w-0 gap-4 lg:col-span-2">
            {/* Specialties & districts */}
            <section className="rounded-2xl border bg-card p-4 sm:p-5">
              <Typography
                variant="h4"
                as="h2"
                className="mb-4 flex items-center gap-2 sm:text-base"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Sparkles className="size-4" />
                </span>
                حوزه تخصص
              </Typography>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Typography variant="small" className="mb-2 font-medium text-foreground">
                    نوع ملک
                  </Typography>
                  <div className="flex flex-wrap gap-2">
                    {agent.specialties.map((specialty) => (
                      <Typography
                        as="span"
                        variant="small"
                        key={specialty}
                        className="flex items-center gap-1.5 rounded-xl border border-brand/25 bg-brand/5 px-3 py-1.5 font-medium"
                      >
                        <Building2 className="size-3.5 text-brand" />
                        {propertyTypeLabels[specialty]}
                      </Typography>
                    ))}
                  </div>
                </div>

                <div>
                  <Typography variant="small" className="mb-2 font-medium text-foreground">
                    محله‌های فعالیت
                  </Typography>
                  <div className="flex flex-wrap gap-2">
                    {agent.districts.map((district) => (
                      <Typography
                        as="span"
                        variant="small"
                        key={district}
                        className="flex items-center gap-1.5 rounded-xl bg-muted/60 px-3 py-1.5 font-medium"
                      >
                        <MapPin className="size-3.5 text-brand/70" />
                        {district}
                      </Typography>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Active listings — the core of the profile */}
            <section className="min-w-0">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <Typography variant="h3" as="h2" className="text-lg sm:text-lg">
                    فایل‌های فعال
                  </Typography>
                  <Typography variant="small" className="mt-0.5">
                    {listings.length.toLocaleString("fa-IR")} فایل در دست {agent.name}
                  </Typography>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-brand"
                  nativeButton={false}
                  render={<Link href="/search/qom" />}
                >
                  همه فایل‌ها
                  <ChevronLeft data-icon="inline-end" />
                </Button>
              </div>

              {listings.length > 0 ? (
                <div className="-mx-page flex snap-x snap-mandatory gap-3 overflow-x-auto px-page pb-2 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
                  {listings.map((listing) => (
                    <PropertyCard
                      key={listing.id}
                      estate={listing}
                      className="w-[70vw] shrink-0 snap-start sm:w-auto"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-muted/30 px-6 py-14 text-center">
                  <span className="flex size-12 items-center justify-center rounded-full bg-muted text-brand">
                    <Home className="size-6" strokeWidth={1.5} />
                  </span>
                  <Typography variant="h4" as="p">
                    در حال حاضر فایل فعالی ندارد
                  </Typography>
                  <Typography variant="small" className="max-w-xs">
                    برای دریافت آخرین فایل‌ها با این کارشناس در تماس باشید.
                  </Typography>
                </div>
              )}
            </section>
          </div>

          {/* Sticky sidebar */}
          <aside className="grid gap-4 lg:sticky lg:top-20">
            <AgentContactCard agent={agent} />

            {otherAgents.length > 0 && (
              <div className="rounded-2xl border bg-card p-4">
                <Typography
                  variant="h4"
                  as="h2"
                  className="mb-3 flex items-center gap-1.5 sm:text-sm"
                >
                  <Award className="size-4 text-brand" />
                  کارشناسان دیگر
                </Typography>
                <div className="grid gap-3">
                  {otherAgents.map((other: Agent) => (
                    <AgentCard key={other.id} agent={other} />
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </Container>
    </div>
  );
}
