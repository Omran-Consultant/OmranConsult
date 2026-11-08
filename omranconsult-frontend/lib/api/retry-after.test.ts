import assert from "node:assert/strict";
import test from "node:test";

import { fetchRetryingTooManyRequests, retryAfterDelayMs } from "./retry-after.ts";

test("retryAfterDelayMs reads delta-seconds and caps at 2s", () => {
  assert.equal(retryAfterDelayMs(null), 0);
  assert.equal(retryAfterDelayMs("1"), 1000);
  assert.equal(retryAfterDelayMs("5"), 2000);
  assert.equal(retryAfterDelayMs("0"), 0);
  assert.equal(retryAfterDelayMs("nope"), 0);
});

test("retryAfterDelayMs reads an HTTP-date and caps at 2s", () => {
  const soon = new Date(Date.now() + 500).toUTCString();
  const delay = retryAfterDelayMs(soon);
  assert.ok(delay >= 0 && delay <= 2000);

  const later = new Date(Date.now() + 10_000).toUTCString();
  assert.equal(retryAfterDelayMs(later), 2000);
});

test("fetchRetryingTooManyRequests returns a non-429 response without waiting", async () => {
  const waits: number[] = [];
  const response = new Response(null, { status: 404 });
  const result = await fetchRetryingTooManyRequests(
    async () => response,
    async (ms) => {
      waits.push(ms);
    },
  );

  assert.equal(result.status, 404);
  assert.deepEqual(waits, []);
});

test("fetchRetryingTooManyRequests retries a 429 once after Retry-After", async () => {
  const waits: number[] = [];
  const responses = [new Response(null, { status: 429, headers: { "Retry-After": "1" } }), new Response(null, { status: 200 })];
  let calls = 0;

  const result = await fetchRetryingTooManyRequests(
    async () => responses[calls++]!,
    async (ms) => {
      waits.push(ms);
    },
  );

  assert.equal(result.status, 200);
  assert.equal(calls, 2);
  assert.deepEqual(waits, [1000]);
});

test("fetchRetryingTooManyRequests returns the second 429 without a third send", async () => {
  let calls = 0;
  const result = await fetchRetryingTooManyRequests(
    async () => {
      calls += 1;
      return new Response(null, { status: 429, headers: { "Retry-After": "5" } });
    },
    async () => undefined,
  );

  assert.equal(result.status, 429);
  assert.equal(calls, 2);
});
