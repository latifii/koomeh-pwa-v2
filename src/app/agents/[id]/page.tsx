import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAgentEstates, getAgentProfile, getAgents } from "@/app/agents/_api/agents.service";
import {
  getCachedAgentEstates,
  getCachedAgentProfile,
  getCachedAgents,
} from "@/app/agents/_cache/agents.cache";
import { mapSearchEstate } from "@/app/properties/_mappers/estate-search.mapper";
import { ApiError, normalizeApiError } from "@/lib/api/api-error";
import { routes } from "@/lib/routes";

import { AgentProfileView } from "./_components/agent-profile-view";

type PageProps = { params: Promise<{ id: string }> };

export const revalidate = 3600;

// Signals that this route can be statically generated; without it Next treats
// every dynamic segment as fully dynamic and never caches the result.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const { result } = await getCachedAgentProfile(id);
    const agent = result.agent;
    const title = `${agent.name} | کارشناسان کومه`;
    const description = (
      agent.bio ||
      agent.title ||
      agent.activity_label ||
      undefined
    )?.slice(0, 150);

    return {
      title,
      description,
      alternates: { canonical: routes.agent(agent.id) },
      openGraph: {
        type: "profile",
        title,
        description,
        url: routes.agent(agent.id),
        images: agent.photo ? [{ url: agent.photo, alt: agent.name }] : undefined,
      },
      twitter: {
        card: agent.photo ? "summary" : "summary_large_image",
        title,
        description,
        images: agent.photo ? [agent.photo] : undefined,
      },
    };
  } catch {
    return { title: "کارشناس یافت نشد | کومه" };
  }
}

export default async function AgentProfilePage({ params }: PageProps) {
  const { id } = await params;
  let profileData: Awaited<ReturnType<typeof getAgentProfile>>;
  let estatesData: Awaited<ReturnType<typeof getAgentEstates>>;
  let agentsData: Awaited<ReturnType<typeof getAgents>>;

  try {
    [profileData, estatesData, agentsData] = await Promise.all([
      getCachedAgentProfile(id),
      getCachedAgentEstates(id, 6),
      getCachedAgents(1, 1, 4),
    ]);
  } catch (error) {
    const apiError = normalizeApiError(error);

    if (apiError instanceof ApiError && apiError.code === "NOT_FOUND") {
      notFound();
    }

    console.error("[agent-profile] Failed to load profile", {
      agentId: id,
      code: apiError.code,
      status: apiError.status,
      details: apiError.details,
    });
    throw apiError;
  }

  const agent = profileData.result.agent;
  return (
    <AgentProfileView
      agent={agent}
      contact={profileData.result.contact}
      estateCounts={estatesData.result.counts}
      listings={estatesData.result.items.map(mapSearchEstate)}
      otherAgents={agentsData.result.items.filter((item) => item.id !== agent.id).slice(0, 3)}
    />
  );
}
