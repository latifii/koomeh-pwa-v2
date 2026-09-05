import assert from "node:assert/strict";
import { test } from "vitest";

import {
  emptyMemberForm,
  memberFormDefaults,
  memberRequestBody,
} from "@/app/panel/members/_mappers/member-form.mapper";
import type { MemberDetail } from "@/app/panel/members/_schemas/members.schema";

/**
 * Two rules here have consequences that would not show up as an error: a
 * password sent when it should not be silently locks someone out of their own
 * account, and a role sent as its Persian label is rejected as a role that does
 * not exist. Both are one line, and both are pinned below.
 */

const member: MemberDetail = {
  id: 271256,
  name: "مرتضی",
  last_name: "اکبری",
  full_name: "مرتضی اکبری",
  username: "09036399496",
  phone: null,
  other_phones: ["02533123456", "09120000000"],
  email: null,
  photo: null,
  code: "8_11638",
  status: "1",
  active: true,
  has_role: true,
  roles: ["expert"],
  branch: { id: 38, name: "زمرد" },
  city: { id: 1, name: "قم" },
  created_at_jalali: "۰۹:۴۷ ۱۴۰۵/۰۵/۰۴",
  city_id: 1,
  branch_id: 38,
  gender: "male",
  title: null,
  description: null,
  alias: "Hx483YMr",
  activity_estate_type: [1, 2],
  districts: [26278],
};

test("the form is seeded from the member, with the password left blank", () => {
  const defaults = memberFormDefaults(member);

  assert.equal(defaults.mode, "edit");
  assert.equal(defaults.name, "مرتضی");
  assert.equal(defaults.username, "09036399496");
  assert.equal(defaults.branch_id, "38");
  assert.equal(defaults.city_id, "1");
  assert.deepEqual(defaults.roles, ["expert"]);
  assert.deepEqual(defaults.districts, ["26278"]);
  assert.deepEqual(defaults.activity_estate_type, ["1", "2"]);
  assert.equal(
    defaults.password,
    "",
    "a pre-filled password would be changed on every save",
  );
});

test("a member with nothing filled in seeds empty strings, not 'null'", () => {
  const bare = memberFormDefaults({
    ...member,
    name: null,
    last_name: null,
    phone: null,
    email: null,
    gender: null,
    branch_id: null,
    city_id: null,
    title: null,
    description: null,
    other_phones: [],
  });

  for (const value of [
    bare.name,
    bare.last_name,
    bare.phone,
    bare.email,
    bare.gender,
    bare.branch_id,
    bare.city_id,
    bare.title,
    bare.description,
    bare.other_phones,
  ]) {
    assert.equal(value, "");
  }
});

test("the password is left out of the body unless one was typed", () => {
  const untouched = memberRequestBody(memberFormDefaults(member));
  assert.equal(
    "password" in untouched,
    false,
    "an empty box means 'leave it alone', not 'clear it'",
  );

  const changed = memberRequestBody({
    ...memberFormDefaults(member),
    password: "new-secret",
  });
  assert.equal(changed.password, "new-secret");
});

test("roles travel back as slugs, under the name the API uses", () => {
  const body = memberRequestBody({
    ...emptyMemberForm,
    username: "09120000001",
    roles: ["expert", "admin_branch"],
  });

  assert.deepEqual(body.role, ["expert", "admin_branch"]);
  assert.equal("roles" in body, false, "the API's field is `role`");
});

test("blank fields are sent as null, and the two ids as numbers", () => {
  const body = memberRequestBody({
    ...emptyMemberForm,
    username: "09120000001",
    roles: ["expert"],
    branch_id: "38",
    city_id: "1",
  });

  assert.equal(body.name, null);
  assert.equal(body.email, null);
  assert.equal(body.gender, null);
  assert.equal(body.branch_id, 38);
  assert.equal(body.city_id, 1);
});

test("extra phone numbers split on either comma", () => {
  // The Persian keyboard gives «،»; a pasted list usually has ",".
  const body = memberRequestBody({
    ...emptyMemberForm,
    username: "09120000001",
    roles: ["expert"],
    other_phones: "02533123456، 09120000000 ,  09330000000 ,,",
  });

  assert.deepEqual(body.other_phones, [
    "02533123456",
    "09120000000",
    "09330000000",
  ]);
});
