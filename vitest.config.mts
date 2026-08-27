import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

/**
 * Unit tests only, and deliberately narrow: the pure decisions behind token
 * rotation and the cache-purge guest list. Both fail silently when they are
 * wrong — a spent refresh token signs someone out for no reason, and a rejected
 * purge tag means content that never updates — which is exactly what makes them
 * worth pinning. Everything with a network edge is checked against the live API
 * instead; mocking it would only test the mock.
 */
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      // `server-only` throws the moment it is imported outside a server
      // component. A test runner has no such distinction, so it is stubbed
      // rather than worked around in the modules themselves.
      "server-only": path.resolve(root, "tests/server-only-stub.ts"),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
