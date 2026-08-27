import { getCachedAgentFilters, getCachedAgents } from "@/app/agents/_cache/agents.cache";

import { AgentsSearch } from "./agents-search";

/**
 * The data half of the agents page, split out so the page shell — breadcrumb,
 * heading, intro — can be sent before the API answers.
 *
 * Without this the whole route blocks on the slowest of the two calls, and the
 * visitor sees nothing at all until then. The render itself is not cheap either:
 * with the data cache fully warm, rendering this list still costs about two
 * seconds, and streaming is what keeps that off the first paint.
 */
export async function AgentsSearchServer() {
  const [initialAgents, initialFilters] = await Promise.all([
    getCachedAgents(1, 1, 20),
    getCachedAgentFilters(1),
  ]);

  return (
    <AgentsSearch initialAgents={initialAgents} initialFilters={initialFilters} />
  );
}
