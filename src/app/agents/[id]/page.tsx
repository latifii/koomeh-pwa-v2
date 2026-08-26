import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAgentEstates, getAgentProfile, getAgents } from "@/app/agents/_api/agents.service";
import { mapSearchEstate } from "@/app/properties/_mappers/estate-search.mapper";
import { ApiError, normalizeApiError } from "@/lib/api/api-error";

import { AgentProfileView } from "./_components/agent-profile-view";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const { result } = await getAgentProfile(id);
    const description = result.agent.bio || result.agent.title || result.agent.activity_label;
    return {
      title: `${result.agent.name} | کارشناسان کومه`,
      description: description?.slice(0, 150),
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
      getAgentProfile(id),
      getAgentEstates(id, { page: 1, per_page: 6 }),
      getAgents({ city_id: 1, per_page: 4 }),
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
