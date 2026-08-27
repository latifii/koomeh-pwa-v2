# Instructions

All project rules live in [AGENTS.md](AGENTS.md). Read it before starting work.

Two things there are easy to get wrong and expensive to undo, so they are repeated
here:

1. **Never read `docs/api/openapi.json` or `docs/api/koomeh.postman_collection.json`
   whole.** They are ~1.7 MB (~500k tokens) of generated API docs. Query them with
   `node docs/api/api-doc.mjs` instead — see AGENTS.md for the commands.
2. **Never edit, reformat, or revert those two files.** They are exported from the
   backend and committed by a human, sometimes from another machine. A pending
   change to them is someone's work in progress, not drift to clean up.
