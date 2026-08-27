import assert from "node:assert/strict";
import { test } from "vitest";

import { cacheTags, isPurgeableTag } from "@/lib/cache-policy";

/**
 * The purge webhook's guest list.
 *
 * This matters because the failure is silent in both directions: a tag the
 * backend sends and this rejects means content that never updates, and a tag
 * accepted without matching anything means a "success" response for a purge
 * that did nothing.
 */

test("every tag the app attaches to a cache entry is purgeable", () => {
  const attached = [
    ...Object.values(cacheTags.home),
    cacheTags.agents.all,
    cacheTags.agents.list,
    cacheTags.agents.filters,
    cacheTags.articles.all,
    cacheTags.articles.list,
    cacheTags.articles.categories,
    cacheTags.branches.all,
    cacheTags.branches.list,
    cacheTags.neighborhoods.all,
    cacheTags.neighborhoods.list,
    cacheTags.estates.all,
    cacheTags.lookups,
  ];

  for (const tag of attached) {
    assert.equal(isPurgeableTag(tag), true, `rejected a real tag: ${tag}`);
  }
});

test("entity tags are accepted for every group that has detail caching", () => {
  const entities = [
    cacheTags.agents.detail(42),
    cacheTags.articles.detail(7),
    cacheTags.branches.detail(3),
    cacheTags.neighborhoods.detail(26365),
    cacheTags.estates.detail(406431),
  ];

  for (const tag of entities) {
    assert.equal(isPurgeableTag(tag), true, `rejected an entity tag: ${tag}`);
  }
});

test("an entity tag is the id, not anything that looks like one", () => {
  assert.equal(isPurgeableTag("estates:1234"), true);
  assert.equal(isPurgeableTag("estates:"), false);
  assert.equal(isPurgeableTag("estates:abc"), false);
  assert.equal(isPurgeableTag("estates:12 34"), false);
  assert.equal(isPurgeableTag("estates:1234:extra"), false);
  assert.equal(isPurgeableTag(" estates:1234"), false);
});

test("unknown tags are refused rather than silently accepted", () => {
  for (const tag of [
    "customers:1",
    "totally:made-up",
    "estates",
    "*",
    "",
  ].filter((tag) => tag !== cacheTags.estates.all)) {
    assert.equal(isPurgeableTag(tag), false, `accepted a bad tag: ${tag}`);
  }
});
