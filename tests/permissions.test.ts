import assert from "node:assert/strict";
import { test } from "vitest";

import { canAccess, panelAudienceFor } from "@/lib/auth/panel-access";
import {
  isAdminReal,
  isExpertOnly,
  isManager,
  isRenterOnly,
  panelViewer,
  roleLabel,
} from "@/lib/auth/permissions";
import {
  PANEL_NAV_ITEMS,
  isNavigable,
  visibleGroups,
} from "@/components/layout/panel-nav.config";

/**
 * The role model is a transcription of the backend's, and a transcription is
 * exactly the kind of thing that rots quietly: nothing throws when a predicate
 * drifts, the panel just starts offering a page that answers 403, or hiding one
 * somebody is entitled to. These cases are the ones where the two sides of the
 * old `User` model disagree with each other on purpose — the secretary, the
 * pure agent, the short-let landlord.
 */

function user(roles: string[], flags: { isAdmin?: boolean; isExpert?: boolean } = {}) {
  return {
    roles,
    isAdmin: flags.isAdmin ?? false,
    isExpert: flags.isExpert ?? false,
  };
}

test("the secretary counts as admin and expert but is not the head of the office", () => {
  const secretary = user(["secretary"]);

  const viewer = panelViewer(secretary);
  assert.equal(viewer.isAdmin, true, "half the panel hangs off isAdmin()");
  assert.equal(viewer.isExpert, true, "the everyday half hangs off isExpert()");
  assert.equal(isManager(secretary), true);
  assert.equal(isAdminReal(secretary), false, "no authority over money or roles");
  assert.equal(roleLabel(secretary), "منشی");
});

test("a plain agent is staff but not an admin", () => {
  const expert = user(["expert"], { isExpert: true });

  const viewer = panelViewer(expert);
  assert.equal(viewer.isExpert, true);
  assert.equal(viewer.isAdmin, false);
  assert.equal(viewer.isStaff, true);
  assert.equal(isExpertOnly(expert), true);
  assert.equal(roleLabel(expert), "مشاور");

  assert.equal(canAccess("staff", viewer), true);
  assert.equal(canAccess("admin", viewer), false, "the phone book is admin only");
});

test("a manager who also advises is not an expert-only", () => {
  const branchManager = user(["expert", "admin_branch"], { isExpert: true });

  assert.equal(isExpertOnly(branchManager), false);
  assert.equal(isManager(branchManager), true);
});

test("renter-only is the one account the panel lists turn away", () => {
  const renter = user(["renter"]);
  const renterAgent = user(["renter", "expert"], { isExpert: true });

  assert.equal(isRenterOnly(renter), true);
  assert.equal(isRenterOnly(renterAgent), false, "the agent role outranks it");

  const viewer = panelViewer(renter);
  assert.equal(canAccess("member", viewer), false);
  assert.equal(canAccess("everyone", viewer), true, "favourites are still theirs");
  assert.equal(roleLabel(renter), "موجر");
});

test("a signed-out visitor reaches nothing, not even the personal pages", () => {
  const viewer = panelViewer(null);

  for (const audience of ["everyone", "member", "staff", "admin"] as const) {
    assert.equal(canAccess(audience, viewer), false, audience);
  }
});

test("the server flags win over the role slugs when they are set", () => {
  // A role named something this build has never heard of, promoted by the API.
  const viewer = panelViewer(user(["some_new_role"], { isAdmin: true }));

  assert.equal(viewer.isAdmin, true);
  assert.equal(viewer.isStaff, true);
});

/* ------------------------------------------------ navigation agrees with it */

test("every menu entry's route resolves to the audience the menu filtered it by", () => {
  for (const item of PANEL_NAV_ITEMS) {
    assert.equal(
      panelAudienceFor(item.href),
      item.audience,
      `${item.href}: the sidebar and the proxy disagree about who may open it`,
    );
  }
});

test("a group with nothing visible in it is not rendered", () => {
  const plain = visibleGroups(panelViewer(user(["user"])));
  const admin = visibleGroups(panelViewer(user(["administrator"], { isAdmin: true, isExpert: true })));

  assert.equal(
    plain.some((group) => group.id === "system"),
    false,
    "office administration has only admin entries",
  );
  assert.equal(
    plain.some((group) => group.id === "performance"),
    false,
    "agent performance has only staff entries",
  );
  assert.ok(plain.some((group) => group.id === "estates"));
  assert.ok(admin.some((group) => group.id === "system"));
});

test("no page is offered twice", () => {
  // The two quick actions were lifted out of their sections into buttons and
  // left behind in `PANEL_NAV_ITEMS` on purpose; leaving them in the sections
  // as well would put each of them on screen twice.
  const seen = new Set<string>();

  for (const item of PANEL_NAV_ITEMS) {
    assert.equal(seen.has(item.href), false, `${item.href} is listed twice`);
    seen.add(item.href);
  }
});

test("the old admin menu's missing pages are listed but not reachable", () => {
  // Everything the old panel had that this API has no endpoint for. Listed so
  // an administrator can see the panel's full shape; inert so nobody lands on
  // a route that does not exist.
  const admin = panelViewer(user(["administrator"], { isAdmin: true, isExpert: true }));
  const groups = visibleGroups(admin);
  const entries = groups.flatMap((group) => group.items);
  const planned = entries.filter((entry) => !isNavigable(entry));

  for (const label of [
    "عملکرد املاک",
    "گزارش‌های مشکل در املاک",
    "ویرایش‌های املاک",
    "عملکرد مشتریان",
    "شعبه‌ها",
    "تنظیمات",
    "اعضای سیستم",
    "عملکرد کارشناسان",
    "مدیریت قرارداد",
    "مدیریت مطالب",
    "کارشناسی قیمت",
  ]) {
    assert.ok(
      planned.some((entry) => entry.label === label),
      `${label} is missing from the admin's menu`,
    );
  }

  for (const entry of planned) {
    assert.equal(entry.href, undefined, `${entry.label} must not be a link`);
    assert.equal(entry.soon, true, `${entry.label} must say so`);
  }

  // A plain member is shown none of them — they were admin pages before too.
  const plain = visibleGroups(panelViewer(user(["user"])))
    .flatMap((group) => group.items)
    .filter((entry) => !isNavigable(entry));
  assert.equal(plain.length, 0);
});

test("detail routes inherit their list's audience", () => {
  assert.equal(panelAudienceFor("/panel/properties/406431/manage"), "member");
  assert.equal(panelAudienceFor("/panel/conversations/12"), "everyone");
  assert.equal(panelAudienceFor("/panel/requests/9/edit"), "member");
});
