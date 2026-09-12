import assert from "node:assert/strict";
import { test } from "vitest";

import { routes, slugFromApiUrl } from "@/lib/routes";

/**
 * The public URL scheme is the old site's, so search engines keep finding the
 * same pages after the switch. These pin the shapes that came from there: the
 * city in the search path, the optional slug on a listing, a post and an area,
 * and the slug being lifted from the API's own legacy URL rather than rebuilt.
 */

test("public paths match the old site's", () => {
  assert.equal(routes.properties(), "/c/qom");
  assert.equal(routes.properties({ type: 2, vr: 1 }), "/c/qom?type=2&vr=1");
  assert.equal(routes.properties({ city: "tehran", type: 1 }), "/c/tehran?type=1");
  assert.equal(routes.property(427845), "/v/427845");
  assert.equal(routes.propertyVirtualTour(427845), "/virtual-tour/427845");
  assert.equal(routes.agents, "/agents/search");
  assert.equal(routes.agent(17583), "/agents/17583");
  assert.equal(routes.branch(19), "/branch/19");
  assert.equal(routes.articles, "/blog");
  assert.equal(routes.article(594), "/blog/594");
  assert.equal(routes.neighborhood(273), "/area/273");
  assert.equal(routes.contact, "/contactus");
  assert.equal(routes.tools.commission, "/commission_calculation");
  assert.equal(routes.tools.propertyAppraisal, "/property_appraisal");
});

test("the slug is the API's own, and optional", () => {
  const url = "/v/427845/آپارتمان-انسجام-قم-168-متر";
  assert.equal(slugFromApiUrl(url), "آپارتمان-انسجام-قم-168-متر");
  assert.equal(
    routes.property(427845, slugFromApiUrl(url)),
    "/v/427845/آپارتمان-انسجام-قم-168-متر",
  );

  // An absolute or percent-encoded form of the same link gives the same slug.
  assert.equal(
    slugFromApiUrl("https://koomeh.ir/blog/594/%D8%A7%D8%B7%D9%84%D8%A7%D8%B9%DB%8C%D9%87"),
    "اطلاعیه",
  );

  // Nothing usable → no slug, and the id-only path still resolves.
  assert.equal(slugFromApiUrl(null), undefined);
  assert.equal(slugFromApiUrl("/agents/17583"), undefined);
  assert.equal(routes.article(594, slugFromApiUrl(undefined)), "/blog/594");
});
