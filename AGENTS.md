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
