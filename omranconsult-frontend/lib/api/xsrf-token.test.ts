import assert from "node:assert/strict";
import test from "node:test";

import {
  readXsrfTokenFromCookieString,
} from "./xsrf-token.ts";

test("readXsrfTokenFromCookieString extracts decoded XSRF-TOKEN", () => {
  const token = readXsrfTokenFromCookieString(
    "other=value; XSRF-TOKEN=abc%2F123; session=ignored",
  );

  assert.equal(token, "abc/123");
});

test("readXsrfTokenFromCookieString returns null when cookie is absent", () => {
  assert.equal(readXsrfTokenFromCookieString("foo=bar"), null);
});
