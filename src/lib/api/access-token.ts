/**
 * The access token the axios interceptor attaches, kept outside React so a
 * request fired from anywhere picks up the current value.
 *
 * The session store owns it: it is set on sign-in, replaced on refresh and
 * cleared on sign-out. Server-side code never reads this — there each request
 * carries its own token from the cookie.
 */

let accessToken: string | undefined;

export function setAccessToken(token: string | undefined): void {
  accessToken = token;
}

export function getAccessToken(): string | undefined {
  return accessToken;
}
