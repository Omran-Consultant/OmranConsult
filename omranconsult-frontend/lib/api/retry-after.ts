/** Parse `Retry-After` (delta-seconds or HTTP date) and cap the wait at `maxMs`. */
export function retryAfterDelayMs(header: string | null, maxMs = 2000): number {
  if (!header) {
    return 0;
  }

  const trimmed = header.trim();
  const seconds = Number.parseInt(trimmed, 10);
  if (String(seconds) === trimmed && Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(seconds * 1000, maxMs);
  }

  const date = Date.parse(trimmed);
  if (Number.isFinite(date)) {
    return Math.min(Math.max(date - Date.now(), 0), maxMs);
  }

  return 0;
}

/**
 * Idempotent reads: on 429, wait once (Retry-After, max 2 s) and send again.
 * The second response is returned as-is, including another 429.
 */
export async function fetchRetryingTooManyRequests(
  send: () => Promise<Response>,
  wait: (ms: number) => Promise<void> = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
): Promise<Response> {
  const first = await send();
  if (first.status !== 429) {
    return first;
  }

  await wait(retryAfterDelayMs(first.headers.get("Retry-After")));
  return send();
}
