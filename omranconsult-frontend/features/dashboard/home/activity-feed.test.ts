import assert from "node:assert/strict";
import test from "node:test";

import { activitySentence, prepareActivityFeed } from "./activity-feed.ts";

const login = (id: number, name: string) => ({
  id,
  action: "login_succeeded",
  occurred_at: "2026-11-09T08:00:00.000Z",
  user_id: 1,
  user_name: name,
});

test("prepareActivityFeed hides logins by default and groups consecutive identical logins", () => {
  const events = [
    login(1, "E2E Super Admin"),
    login(2, "E2E Super Admin"),
    { id: 3, action: "project_published", occurred_at: "2026-11-09T09:00:00.000Z", user_id: 1, user_name: "E2E Super Admin" },
    login(4, "E2E Super Admin"),
  ];

  const withoutLogins = prepareActivityFeed(events, { includeLogins: false });
  assert.equal(withoutLogins.length, 1);
  assert.equal(withoutLogins[0]?.action, "project_published");

  const withLogins = prepareActivityFeed(events, { includeLogins: true });
  assert.equal(withLogins.length, 3);
  assert.equal(withLogins[0]?.count, 2);
  assert.equal(withLogins[0]?.action, "login_succeeded");
});

test("activitySentence prefixes the actor name", () => {
  const sentence = activitySentence(
    { id: 1, action: "login_succeeded", occurred_at: "", user_id: 1, user_name: "E2E Super Admin", count: 1 },
    "سجّل الدخول",
    "ar",
  );
  assert.equal(sentence, "E2E Super Admin سجّل الدخول");
});
