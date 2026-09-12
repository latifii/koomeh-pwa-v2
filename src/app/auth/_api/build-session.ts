import { me, siteSession } from "@/app/auth/_api/auth.service";
import type { TokenPairDto } from "@/app/auth/_schemas/auth.schema";
import { mapSessionUser, mapUserSession } from "@/app/auth/_mappers/auth.mapper";
import type { SessionUser, UserSession } from "@/lib/auth/session.types";

/**
 * Turns a fresh token pair into the session the cookie carries.
 *
 * `/api/login` already embeds the user, so the extra `/api/me` round trip is
 * only made when it does not — which is the case for `/api/refresh`. The
 * `/api/site3/session` call is best effort and only adds the role flags.
 *
 * `previousUser` is the user from the cookie being renewed. By the time this
 * runs the old refresh token is already spent, so a failed `/api/me` cannot
 * be allowed to throw the new pair away — that would end the session over a
 * profile lookup. The snapshot is at most one access-token lifetime old,
 * which is what the roles in it are anyway.
 */
export async function buildSession(
  tokens: TokenPairDto,
  previousUser?: SessionUser,
): Promise<UserSession> {
  const site = await siteSession(tokens.access_token);

  if (tokens.user) {
    return mapUserSession(tokens, mapSessionUser(tokens.user, site));
  }

  try {
    const user = await me(tokens.access_token);
    return mapUserSession(tokens, mapSessionUser(user, site));
  } catch (error) {
    if (!previousUser) throw error;
    return mapUserSession(tokens, previousUser);
  }
}
