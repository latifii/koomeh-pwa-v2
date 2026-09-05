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
  PANEL_NAV_GROUPS,
  PANEL_NAV_ITEMS,
  PANEL_PRIMARY_LINKS,
  PANEL_QUICK_ACTIONS,
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

test("no page is offered twice in the same part of the menu", () => {
  // «ثبت ملک» is deliberately in two places — the button above the menu, for
  // the person who came to do it, and a row inside «مدیریت املاک», for the
  // person reading the section to find out what it holds. What must not happen
  // is the same page appearing twice within one of those parts, which is what
  // a copy-paste into the wrong section would look like.
  for (const part of [
    PANEL_PRIMARY_LINKS,
    PANEL_QUICK_ACTIONS,
    ...PANEL_NAV_GROUPS.map((group) => group.items),
  ]) {
    const seen = new Set<string>();
    for (const item of part) {
      assert.equal(seen.has(item.href), false, `${item.href} is listed twice`);
      seen.add(item.href);
    }
  }

  // A row that is also a quick action still resolves to one label and one
  // section, so the breadcrumb cannot disagree with the sidebar.
  const labels = new Map<string, string>();
  for (const item of PANEL_NAV_ITEMS) {
    const known = labels.get(item.href);
    assert.equal(
      known ?? item.label,
      item.label,
      `${item.href} is labelled two ways`,
    );
    labels.set(item.href, item.label);
  }
});

test("every menu entry goes somewhere", () => {
  // The menu carries no placeholders: a row is a promise that a page exists
  // behind it. Pages waiting on an endpoint belong in the roadmap instead.
  const admin = panelViewer(
    user(["administrator"], { isAdmin: true, isExpert: true }),
  );

  for (const entry of visibleGroups(admin).flatMap((group) => group.items)) {
    assert.ok(
      entry.href?.startsWith("/panel/"),
      `${entry.label} has nowhere to go`,
    );
  }
});

test("detail routes inherit their list's audience", () => {
  assert.equal(panelAudienceFor("/panel/properties/406431/manage"), "member");
  assert.equal(panelAudienceFor("/panel/conversations/12"), "everyone");
  assert.equal(panelAudienceFor("/panel/requests/9/edit"), "member");
});
