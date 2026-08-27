import { me, siteSession } from "@/app/auth/_api/auth.service";
import type { TokenPairDto } from "@/app/auth/_schemas/auth.schema";
import { mapSessionUser, mapUserSession } from "@/app/auth/_mappers/auth.mapper";
import type { UserSession } from "@/lib/auth/session.types";

/**
 * Turns a fresh token pair into the session the cookie carries.
 *
 * `/api/login` already embeds the user, so the extra `/api/me` round trip is
 * only made when it does not — which is the case for `/api/refresh`. The
 * `/api/site3/session` call is best effort and only adds the role flags.
 */
export async function buildSession(tokens: TokenPairDto): Promise<UserSession> {
  const user = tokens.user ?? (await me(tokens.access_token));
  const site = await siteSession(tokens.access_token);

  return mapUserSession(tokens, mapSessionUser(user, site));
}
