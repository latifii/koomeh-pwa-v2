import assert from "node:assert/strict";
import { test } from "vitest";

import {
  customerFilterParams,
  resolveAgent,
} from "@/app/panel/requests/_lib/customer-filter-params";
import {
  AGENT_NONE,
  defaultCustomerFilters,
} from "@/app/panel/requests/_types/customers.types";

/**
 * The customer list is not scoped by the API and the page does not scope it
 * either: it opens on everyone, for every role, and the «مشاور» filter is
 * the only thing that narrows it.
 */
test("the list opens on everyone; the agent filter is the only narrowing", () => {
  assert.equal(
    resolveAgent(defaultCustomerFilters.agent),
    undefined,
    "nothing is sent until the filter is set",
  );
  assert.equal(
    resolveAgent(AGENT_NONE),
    -1,
    "the unassigned are -1, as the API wants",
  );
  assert.equal(resolveAgent("270006"), 270006);
  assert.equal(resolveAgent("۱۷۶۴۱"), 17641, "Persian digits are an id too");
});

test("the search box tells a phone number from a name, and nothing empty is sent", () => {
  const byName = customerFilterParams(defaultCustomerFilters, "رضایی");
  assert.equal(byName.name, "رضایی");
  assert.equal(byName.mobile, undefined);
  assert.equal(byName.request_type, 1, "buy is the old page's default");
  assert.equal(
    byName.user_id,
    undefined,
    "unscoped until the agent filter is set",
  );
  assert.equal(byName.today, undefined);
  assert.equal(byName.status, undefined);

  const byPhone = customerFilterParams(defaultCustomerFilters, "۰۹۱۲۱۲۳۴۵۶۷");
  assert.equal(byPhone.mobile, "09121234567", "Persian digits are normalised");
  assert.equal(byPhone.name, undefined);

  const narrowed = customerFilterParams(
    {
      ...defaultCustomerFilters,
      today: "1",
      priceMax: "۲٬۵۰۰٬۰۰۰٬۰۰۰",
      districtIds: "12,34",
      order: "label",
      orderBy: "asc",
    },
    "",
  );
  assert.equal(narrowed.today, true);
  assert.equal(narrowed.price_max, 2500000000);
  assert.equal(narrowed.district_id, "12,34");
  assert.equal(narrowed.order, "label");
  assert.equal(narrowed.orderby, "asc");
});
