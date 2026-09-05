import assert from "node:assert/strict";
import { test } from "vitest";

import {
  estateFormDefaults,
  estatePassthrough,
} from "@/app/panel/properties/_mappers/estate-form.mapper";
import type { FormOptionsResponse } from "@/app/panel/properties/_schemas/estate-submit.schema";

/**
 * `PUT /estates/{id}` is a whole-record replace: a column the body leaves out is
 * emptied. That makes these two functions the difference between an edit and a
 * data loss, and neither would fail loudly — the listing would just come back
 * with its coordinates gone. Hence the cases below.
 */

const options: FormOptionsResponse["result"] = {
  deal_types: [],
  estate_types: [],
  city: { id: 1, name: "قم" },
  districts: [],
  streets: [],
  fields: [
    { key: "room_count", label: "تعداد اتاق", multiple: false, options: [] },
    { key: "facilities", label: "امکانات", multiple: true, options: [] },
  ],
  numeric_fields: ["area", "built_year"],
  limits: { max_images: 30 },
};

// A listing as the API hands it over, including the columns no form renders.
const values = {
  id: 477621,
  type: 2,
  estate_type: 1,
  title: "اجاره آپارتمان",
  description: null,
  city_id: 1,
  district_id: 26278,
  address: null,
  owner_name: "",
  phone: "09120000000",
  phone2: null,
  area: 145,
  price: 0,
  mortgage: 1300000000,
  rent: 1000000,
  exchange: false,
  exchange_comment: null,
  built_year: 1405,
  room_count: 188,
  facilities: [37, 35, 36],
  // Not rendered anywhere in the form:
  latitude: "34.64",
  longitude: "50.87",
  street_id: null,
  buildingname: null,
  unit_no: null,
  video: null,
  vrhouse: null,
  visibility: 1,
  confirmation: "verified",
  expert_id: 267836,
};

const images = [
  { id: 11, url: "/a.webp", is_cover: false, is_plan: false, is_360: false, priority: 1 },
  { id: 12, url: "/b.webp", is_cover: true, is_plan: false, is_360: false, priority: 2 },
];

test("the form is seeded with the listing's own values", () => {
  const defaults = estateFormDefaults(values, options, images);

  assert.equal(defaults.type, "2");
  assert.equal(defaults.estate_type, "1");
  assert.equal(defaults.area, "145");
  assert.equal(defaults.district_id, "26278");
  assert.equal(defaults.phone, "09120000000");
  assert.equal(defaults.mortgage, "1300000000");
  assert.equal(defaults.rent, "1000000");
  assert.equal(defaults.exchange, false);
});

test("a stored zero price is shown as blank, not as ۰", () => {
  // Otherwise a listing with no sale price reads as one being given away.
  assert.equal(estateFormDefaults(values, options, images).price, "");
});

test("option ids become strings and multiple fields become arrays of them", () => {
  const defaults = estateFormDefaults(values, options, images);

  assert.equal(defaults.fields.room_count, "188");
  assert.deepEqual(defaults.fields.facilities, ["37", "35", "36"]);
  assert.equal(defaults.numbers.built_year, "1405");
  assert.equal("area" in defaults.numbers, false, "area has its own field");
});

test("a field the listing has no value for comes back empty, not 'null'", () => {
  const defaults = estateFormDefaults(values, options, images);

  assert.equal(defaults.description, "");
  assert.equal(defaults.address, "");
  assert.equal(defaults.phone2, "");
});

test("an option field missing from the values is still present and empty", () => {
  const defaults = estateFormDefaults({}, options, []);

  assert.equal(defaults.fields.room_count, "");
  assert.deepEqual(defaults.fields.facilities, []);
  assert.equal(defaults.type, "1", "a listing has to be one or the other");
});

test("the cover is the one the listing marks, and nothing when it marks none", () => {
  assert.equal(estateFormDefaults(values, options, images).cover_image_id, 12);
  assert.deepEqual(estateFormDefaults(values, options, images).images, [11, 12]);

  const noCover = images.map((image) => ({ ...image, is_cover: false }));
  assert.equal(
    estateFormDefaults(values, options, noCover).cover_image_id,
    null,
    "choosing one for the listing would be an edit nobody asked for",
  );
});

test("every column the form does not render is carried across untouched", () => {
  assert.deepEqual(estatePassthrough(values, options), {
    latitude: "34.64",
    longitude: "50.87",
    street_id: null,
    buildingname: null,
    unit_no: null,
    video: null,
    vrhouse: null,
    visibility: 1,
    confirmation: "verified",
    expert_id: 267836,
  });
});

test("nothing the form owns is duplicated into the passthrough", () => {
  const carried = estatePassthrough(values, options);

  for (const key of [
    "id",
    "type",
    "estate_type",
    "title",
    "city_id",
    "district_id",
    "area",
    "price",
    "mortgage",
    "rent",
    "phone",
    "room_count",
    "facilities",
    "built_year",
  ]) {
    assert.equal(key in carried, false, `${key} would be sent twice`);
  }
});

test("a column this build has never heard of still travels back", () => {
  // The backend adds columns; a form that only forwarded a known list would
  // empty each new one on the first save.
  const carried = estatePassthrough({ ...values, some_new_column: 42 }, options);

  assert.equal(carried.some_new_column, 42);
});
