const DEFAULT_SITE_ORIGIN = "http://localhost:3000";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
}

/**
 * Browser-visible site origin (always localhost in local dev, not 127.0.0.1).
 */
export function getPublicSiteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return trimTrailingSlash(configured ?? DEFAULT_SITE_ORIGIN);
}

/**
 * Base URL for browser `fetch` calls.
 * Default: same origin as the Next app so `/api` and `/sanctum` rewrites preserve Sanctum cookies + CSRF.
 */
export function getBrowserApiBaseUrl(): string {
  const directApi = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (directApi) {
    return trimTrailingSlash(directApi);
  }

  if (typeof window !== "undefined") {
    return trimTrailingSlash(window.location.origin);
  }

  return getPublicSiteOrigin();
}
