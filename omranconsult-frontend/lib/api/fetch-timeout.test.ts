import assert from "node:assert/strict";
import test from "node:test";

import { isTimeoutError, timeoutSignal } from "./fetch-timeout.ts";

/** A request that never answers: it settles only when its signal aborts, like a stalled fetch. */
function stalledRequest(signal: AbortSignal): Promise<never> {
  return new Promise((_, reject) => {
    signal.addEventListener("abort", () => reject(signal.reason), { once: true });
  });
}

test("a stalled request is aborted with a timeout error", async () => {
  await assert.rejects(stalledRequest(timeoutSignal(5)), (error) => isTimeoutError(error));
});

test("the caller's own abort still wins and is not reported as a timeout", async () => {
  const controller = new AbortController();
  const pending = stalledRequest(timeoutSignal(60_000, controller.signal));
  controller.abort();
  await assert.rejects(pending, (error) => !isTimeoutError(error));
});

test("other failures are not timeouts", () => {
  assert.equal(isTimeoutError(new TypeError("fetch failed")), false);
  assert.equal(isTimeoutError(undefined), false);
});
