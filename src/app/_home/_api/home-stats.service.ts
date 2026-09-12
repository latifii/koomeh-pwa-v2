import {
  homeStatsResponseSchema,
  type HomeStatsResponse,
} from "@/app/_home/_schemas/home-stats.schema";
import { getValidated } from "@/lib/api/http-client";

const endpoint = "/api/site3/home/sections/stats";

export async function getHomeStats(
  signal?: AbortSignal,
): Promise<HomeStatsResponse> {
  return getValidated(endpoint, homeStatsResponseSchema, { signal });
}
