# API documentation — read this before touching `docs/api`

`docs/api/` holds two generated files that describe the backend:

| file | size | what it is good for |
| --- | --- | --- |
| `openapi.json` | ~560 KB | structure: tags, parameters, nullability, `$ref` component schemas |
| `koomeh.postman_collection.json` | ~1.2 MB | sample responses and error codes (404 / 422 / 429) |

**Never open either file whole — not with Read, not with `cat`, not with `Get-Content`.**
Together they are ~1.7 MB, roughly 500k tokens. That alone exceeds a 200k context
window, and because every request resends the whole conversation, one careless read
keeps costing for the rest of the session.

**They are generated artifacts. Never edit, reformat, or revert them.** They are
exported from the backend and committed by a human, sometimes from another machine.
If `git status` shows one as modified, that is someone's update in progress — leave
it alone and ask. Do not run `git checkout --`, `git restore`, or any other
discarding command on them.

## How to read them instead

Use the query script. It prints the few hundred bytes you actually need:

```bash
node docs/api/api-doc.mjs tags                    # every tag + operation count
node docs/api/api-doc.mjs list "Estate Show"      # endpoints matching a tag/path/summary
node docs/api/api-doc.mjs show /api/site3/estates/{id} get   # params + flattened response schema
node docs/api/api-doc.mjs schema EstateAgentDetail            # one component schema
node docs/api/api-doc.mjs example "جزئیات ملک"                # sample responses from Postman
```

`show` flattens a response schema to one `path : type` line per leaf. The largest
endpoint in the spec comes out at ~4.5 KB instead of ~63 KB of raw JSON.

Work outside-in: `list` to find the endpoint, then `show` for just that one. Do not
loop `show` over every endpoint of a tag "to be safe" — fetch what the task needs.

## The live API is the source of truth

The spec is incomplete in places: several fields are typed as a bare `object` with
no properties — on `GET /api/site3/estates/{id}` that includes `result.location`,
`result.features` and `result.links`. The Postman samples show them as `{}` too.
Their real shape only exists in a live response.

So before writing a Zod schema or a mapper, fetch a real one from
`NEXT_PUBLIC_API_BASE_URL` (see `.env.example`):

```bash
curl -s "https://koomeh.ir/api/site3/estates/444520" -H "Accept: application/json"
```

Fetch two or three records that differ — sale vs rent, with and without an agent,
with and without map coordinates — so optional and nullable fields are covered by
observation rather than by guessing. When the spec and a live response disagree,
the live response wins.

# Authentication

The API is token-based: `POST /api/login` returns an access/refresh pair and 102
of its 146 operations require `Authorization: Bearer <access_token>`. Its CORS
policy is `Access-Control-Allow-Origin: *` with no `allow-credentials`, so the
backend's own session cookie is unusable cross-origin — the Bearer token is the
only way in.

## How a session flows

```
sign in    browser → signInAction (server) → POST /api/login
                     ↓ builds session, writes the cookie
           koomeh-session  (JWT signed with AUTH_SECRET, httpOnly)

read       server → getSession() from next/headers
           browser → GET /api/auth/session → zustand store → axios interceptor

renew      navigation → src/proxy.ts refreshes before the page renders
           mid-session 401 → axios interceptor → POST /api/auth/refresh → retry once
```

| file | role |
| --- | --- |
| `src/lib/auth/session.ts` | `jose` sign/verify + cookie flags. Edge-safe: no `next/headers`, no axios |
| `src/lib/auth/session-cookie.ts` | `getSession` / `setSessionCookie` / `clearSessionCookie` — server only |
| `src/lib/auth/routes.ts` | which paths are protected, and the open-redirect guard on `callbackUrl` |
| `src/proxy.ts` | route guard + pre-render token renewal (Next 16 renamed this from `middleware.ts`) |
| `src/app/auth/_actions/auth-actions.ts` | `signInAction` / `signOutAction` — credentials never leave the server |
| `src/app/auth/_api/auth.service.ts` | the four endpoints, over `fetch` so the Edge proxy can use them too |
| `src/app/auth/_stores/auth.store.ts` | the browser's mirror of the cookie |
| `src/lib/api/access-token.ts` | the token the axios interceptor attaches |

## Rules

- **`AUTH_SECRET` is required.** At least 32 characters, different per
  environment. `.env.local` is gitignored; `.env.example` documents it.
- **Refresh tokens rotate — each one works exactly once.** Never refresh from
  two places at once: the axios interceptor keeps a single in-flight promise and
  the proxy refreshes once per request. Adding a third caller will invalidate
  live sessions.
- **Never read the session cookie from client code.** It is httpOnly by design.
  Use `useSessionStore`; on the server use `getSession()`.
- **Server-side API calls must pass their own token.** The axios interceptor
  only has one in the browser. In a server component or route handler, take it
  from `getSession()`.
- **Adding a protected route?** Add its prefix to `PROTECTED_PREFIXES` in
  `src/lib/auth/routes.ts` and to the `matcher` in `src/proxy.ts`. The proxy only
  runs on paths its matcher lists.

## Not built yet

The API has no register, OTP or password-reset service — only
`POST /api/site3/profile/password` for a signed-in user. `/auth/register`,
`/auth/verify`, `/auth/forgot-password` and `/auth/reset-password` therefore
render `AuthUnavailable` instead of a form that cannot work. Wire them up when
the services land; do not build fake flows in the meantime.

# Project UI rules

- Before creating any UI component, helper component, form control, or styled native element, inspect `src/components/ui` and `src/components/shared` and reuse an existing project component whenever it covers the need.
- Do not recreate primitives such as Button, Input, Select, Checkbox, Switch, Label, Field, Card, Badge, Dialog, Drawer, Tabs, Combobox, Spinner, or empty/loading states inside feature files.
- Feature components may compose project primitives, but must not duplicate their styling, accessibility, focus handling, or interaction behavior.
- Keep orchestration components focused. Move substantial feature-specific UI sections into named sibling components instead of defining a collection of local pseudo-primitives at the bottom of one large file.
- If no existing component fits, first decide whether the missing abstraction is reusable. Put reusable primitives in `src/components/ui` or shared compositions in `src/components/shared`; keep truly feature-specific components beside the feature.
- Preserve existing project components and conventions before introducing new markup or patterns. Search the codebase for prior usage examples before implementation.
- For lookup-backed selects, use the shared `LookupSelect` composition so Base UI receives the value-to-label `items` map; never let raw IDs or null values render as user-facing labels.
- Use the shared `EmptyState` for empty filtered lists and empty content sections instead of recreating empty-state markup inside features.
- Controls placed in the same form must use the same component `size` variant. Never force consistency with manual `h-*`, `min-h-*`, or `rounded-*` overrides on UI primitives; use their built-in size and radius tokens.
- Render user-facing text with the project `Typography` component and its semantic variants. Do not create local font-size tokens with `text-[...]` or override typography variants with manual `text-xs`, `text-sm`, `text-lg`, etc. Layout and color classes are allowed; font sizing belongs to `Typography`.
