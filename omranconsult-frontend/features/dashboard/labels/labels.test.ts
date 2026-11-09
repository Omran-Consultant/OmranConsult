import assert from "node:assert/strict";
import test from "node:test";

import { labelAuditAction } from "./audit-actions.ts";
import { labelContentStatus } from "./statuses.ts";
import { labelRole } from "./roles.ts";

test("audit actions localize to Arabic sentences", () => {
  assert.equal(labelAuditAction("login_succeeded", "ar"), "سجّل الدخول");
  assert.equal(labelAuditAction("media_force_deleted", "ar"), "حذف ملفاً نهائياً");
});

test("status and role labels avoid raw keys in Arabic", () => {
  assert.equal(labelContentStatus("published_with_draft", "ar"), "منشور مع تعديلات");
  assert.equal(labelRole("super_admin", "ar"), "مدير النظام");
});
