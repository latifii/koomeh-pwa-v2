import { NextResponse, type NextRequest } from "next/server";

import { buildSession } from "@/app/auth/_api/build-session";
import { refresh } from "@/app/auth/_api/auth.service";
import {
  AFTER_SIGN_IN,
  CALLBACK_PARAM,
  isAuthPath,
  isProtectedPath,
} from "@/lib/auth/routes";
import { canAccess, panelAudienceFor } from "@/lib/auth/panel-access";
import { panelViewer } from "@/lib/auth/permissions";
import {
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  decryptSession,
  encryptSession,
  sessionMaxAge,
} from "@/lib/auth/session";
import {
  isAccessExpired,
  isRefreshExpired,
  type UserSession,
} from "@/lib/auth/session.types";
import { routes } from "@/lib/routes";

/**
 * Guards `/panel`, keeps signed-in visitors off the auth pages, and renews an
 * expired access token before the page it protects ever renders.
 *
 * Runs in the Node runtime — Next 16 defaults `proxy` to Node, and the build
 * manifest confirms it. Everything it touches is still `fetch`- and
 * `jose`-based rather than axios, so the file stays portable if that default
 * ever changes; `next/headers` is absent because proxy reads cookies off the
 * request, not from the request store.
 */

function redirect(request: NextRequest, pathname: string, callbackUrl?: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  if (callbackUrl) url.searchParams.set(CALLBACK_PARAM, callbackUrl);
  return NextResponse.redirect(url);
}

function withSession(response: NextResponse, token: string, maxAge: number) {
  response.cookies.set(SESSION_COOKIE, token, {
    ...SESSION_COOKIE_OPTIONS,
    maxAge,
  });
  return response;
}

function withoutSession(response: NextResponse) {
  response.cookies.delete(SESSION_COOKIE);
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const protectedPath = isProtectedPath(pathname);
  const authPath = isAuthPath(pathname);

  // Nothing here cares about the session, so skip the crypto entirely.
  if (!protectedPath && !authPath) return NextResponse.next();

  const session = await decryptSession(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  if (!session) {
    if (!protectedPath) return NextResponse.next();
    return withoutSession(
      redirect(request, routes.auth.login, `${pathname}${search}`),
    );
  }

  // The refresh window is the real end of a session; past it nothing can be renewed.
  if (isRefreshExpired(session)) {
    return withoutSession(
      protectedPath
        ? redirect(request, routes.auth.login, `${pathname}${search}`)
        : NextResponse.next(),
    );
  }

  let current: UserSession = session;
  let renewed: string | undefined;

  if (isAccessExpired(session)) {
    try {
      current = await buildSession(await refresh(session.refreshToken));
      renewed = await encryptSession(current);
    } catch {
      // The rotation failed — the stored refresh token is spent or revoked.
      return withoutSession(
        protectedPath
          ? redirect(request, routes.auth.login, `${pathname}${search}`)
          : NextResponse.next(),
      );
    }
  }

  /*
   * A panel route the visitor's roles do not reach sends them back to the
   * dashboard rather than rendering a page that can only apologise. The same
   * map hides the link in the sidebar, so a bookmark and a menu agree.
   *
   * This is convenience, not a boundary: the roles here are a snapshot at most
   * one access-token lifetime old, and the API answers 403 on its own account.
   * Somebody promoted five minutes ago waits for the next rotation — which is
   * why the fallback is the dashboard and not a dead end.
   */
  if (protectedPath) {
    const viewer = panelViewer(current.user);

    if (!canAccess(panelAudienceFor(pathname), viewer)) {
      const fallback = canAccess(
        panelAudienceFor(routes.panel.dashboard),
        viewer,
      )
        ? routes.panel.dashboard
        : routes.home;

      const denied = redirect(request, fallback);
      return renewed
        ? withSession(denied, renewed, sessionMaxAge(current))
        : denied;
    }
  }

  const response = authPath
    ? NextResponse.redirect(
        Object.assign(request.nextUrl.clone(), {
          pathname: AFTER_SIGN_IN,
          search: "",
        }),
      )
    : NextResponse.next();

  return renewed
    ? withSession(response, renewed, sessionMaxAge(current))
    : response;
}

export const config = {
  // Static assets and the auth route handlers manage their own cookies.
  matcher: ["/panel/:path*", "/auth/:path*"],
};
