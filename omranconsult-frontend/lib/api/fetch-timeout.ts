/**
 * Server-side API calls give up after this long (owner-approved 2026-11-11). Without it a stalled API
 * keeps a page render waiting until the platform kills it; with it the page reaches the localized
 * error state. The 429 retry sends a second request, so each attempt gets its own budget.
 */
export const SERVER_FETCH_TIMEOUT_MS = 10_000;

/** A signal that aborts after `ms`, or earlier when the caller's own signal aborts. */
export function timeoutSignal(ms: number, outer?: AbortSignal): AbortSignal {
  const timeout = AbortSignal.timeout(ms);
  return outer ? AbortSignal.any([outer, timeout]) : timeout;
}

/** `AbortSignal.timeout` rejects the fetch with a DOMException named "TimeoutError". */
export function isTimeoutError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "name" in error && error.name === "TimeoutError";
}
