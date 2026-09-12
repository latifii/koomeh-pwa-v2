import assert from "node:assert/strict";
import { test } from "vitest";

import {
  customerFilterParams,
  resolveAgent,
} from "@/app/panel/requests/_lib/customer-filter-params";
import {
  AGENT_ALL,
  AGENT_DEFAULT,
  AGENT_NONE,
  defaultCustomerFilters,
} from "@/app/panel/requests/_types/customers.types";

/**
 * The customer list is not scoped by the API; the old page scoped it with the
 * first entry of its «مشاور» dropdown, which differed by role. That rule is
 * why an agent and an administrator see different lists from the same URL,
 * and it is the one thing on this page that must not drift.
 */
test("the default scope is the old dropdown's first entry, per role", () => {
  const agent = { id: 17641, isAdmin: false };
  const admin = { id: 1, isAdmin: true };

  assert.equal(
    resolveAgent(AGENT_DEFAULT, agent),
    17641,
    "an agent opens on their own customers",
  );
  assert.equal(
    resolveAgent(AGENT_DEFAULT, admin),
    undefined,
    "an administrator opens on everyone",
  );
  assert.equal(
    resolveAgent(AGENT_ALL, agent),
    undefined,
    "either can widen to everyone",
  );
  assert.equal(
    resolveAgent(AGENT_NONE, agent),
    -1,
    "the unassigned are -1, as the API wants",
  );
  assert.equal(resolveAgent("270006", agent), 270006);
});

test("the search box tells a phone number from a name, and nothing empty is sent", () => {
  const agent = { id: 17641, isAdmin: false };

  const byName = customerFilterParams(defaultCustomerFilters, "رضایی", agent);
  assert.equal(byName.name, "رضایی");
  assert.equal(byName.mobile, undefined);
  assert.equal(byName.request_type, 1, "buy is the old page's default");
  assert.equal(byName.user_id, 17641);
  assert.equal(byName.today, undefined);
  assert.equal(byName.status, undefined);

  const byPhone = customerFilterParams(
    defaultCustomerFilters,
    "۰۹۱۲۱۲۳۴۵۶۷",
    agent,
  );
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
    agent,
  );
  assert.equal(narrowed.today, true);
  assert.equal(narrowed.price_max, 2500000000);
  assert.equal(narrowed.district_id, "12,34");
  assert.equal(narrowed.order, "label");
  assert.equal(narrowed.orderby, "asc");
});
