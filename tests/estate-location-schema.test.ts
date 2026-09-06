import assert from "node:assert/strict";
import { test } from "vitest";

import { mapEstateLocation } from "@/app/properties/_mappers/estate-detail.mapper";
import { estateLocationSchema } from "@/app/properties/_schemas/estate-detail.schema";

/**
 * `location.street` was typed as a string. The API sends a place — the same
 * `{ id, name, url }` shape as the city and the district above it — so every
 * listing that had a street failed to parse, and the detail page answered 500
 * instead of rendering. Eighteen of a hundred and forty-four listings sampled
 * from search were in that state, which is a lot of dead links for a field
 * nothing on the page even shows.
 *
 * It fails silently in the sense that matters: the parse throws on the server,
 * the visitor sees a generic error, and nothing points at the field. Hence the
 * cases below — both shapes the API is known to send, plus the absent one.
 */

const base = {
  estate_id: 1,
  city: { id: 1, name: "قم", url: "/city/178/قم" },
  district: { id: 1, name: "پردیسان", url: "/area/187/پردیسان" },
  address_label: "قم - پردیسان - محله ۵",
  is_full_address: false,
  has_map: true,
  latitude: 34.5459,
  longitude: 50.8368,
};

test("a street arrives as a place, as the live API sends it", () => {
  const parsed = estateLocationSchema.parse({
    ...base,
    street: { id: 20, name: "محله 5", url: "/area/310/خیابان-محله-5" },
  });

  assert.equal(mapEstateLocation(parsed).street, "محله 5");
});

test("a street sent as a bare name still reads as one", () => {
  const parsed = estateLocationSchema.parse({ ...base, street: "محله 5" });

  assert.equal(mapEstateLocation(parsed).street, "محله 5");
});

test("no street is no street, not a failed page", () => {
  assert.equal(
    mapEstateLocation(estateLocationSchema.parse({ ...base, street: null }))
      .street,
    undefined,
  );
  assert.equal(
    mapEstateLocation(estateLocationSchema.parse(base)).street,
    undefined,
  );
});
