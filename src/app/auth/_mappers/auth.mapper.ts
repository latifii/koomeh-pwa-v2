import type {
  AuthUserDto,
  SiteSessionResponse,
  TokenPairDto,
} from "@/app/auth/_schemas/auth.schema";
import { toAbsoluteMediaUrl } from "@/lib/api/config";
import type { SessionUser, UserSession } from "@/lib/auth/session.types";

function text(value: string | null | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized || undefined;
}

/**
 * `expires_at` is an ISO string and `expires_in` a duration in seconds. The
 * date is preferred, but a client clock that disagrees with the server would
 * make it useless, so the duration is the fallback.
 */
function expiryFrom(isoDate: string | null | undefined, seconds: number): number {
  const parsed = isoDate ? Date.parse(isoDate) : Number.NaN;
  if (Number.isFinite(parsed)) return parsed;
  return Date.now() + seconds * 1000;
}

function displayName(dto: AuthUserDto): string {
  const full = text(dto.full_name);
  if (full) return full;

  const parts = [text(dto.name), text(dto.last_name)].filter(Boolean);
  return parts.length ? parts.join(" ") : (text(dto.username) ?? "کاربر کومه");
}

export function mapSessionUser(
  dto: AuthUserDto,
  site?: SiteSessionResponse["result"],
): SessionUser {
  const roles = site?.roles.length ? site.roles : dto.roles;

  return {
    id: dto.id,
    fullName: text(site?.name) ?? displayName(dto),
    username: text(dto.username) ?? text(site?.username),
    email: text(dto.email),
    phone: text(dto.phone) ?? text(dto.username),
    photo: toAbsoluteMediaUrl(site?.photo ?? null),
    roles,
    isAdmin: site?.is_admin ?? roles.includes("admin"),
    isExpert: site?.is_expert ?? roles.includes("expert"),
  };
}

export function mapUserSession(
  tokens: TokenPairDto,
  user: SessionUser,
): UserSession {
  return {
    user,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: expiryFrom(tokens.expires_at, tokens.expires_in),
    refreshExpiresAt: expiryFrom(
      tokens.refresh_expires_at,
      tokens.refresh_expires_in,
    ),
  };
}
