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
