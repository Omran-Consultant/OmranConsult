import "server-only";

const DEFAULT_API_BASE_URL = "http://localhost:8000";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/$/, "");
}

function assertLocalhostUrl(label: string, value: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid URL.`);
  }

  if (parsed.hostname !== "localhost") {
    throw new Error(`${label} must use hostname localhost for Phase 0 local integration.`);
  }

  return trimTrailingSlash(`${parsed.protocol}//${parsed.host}`);
}

/**
 * Shared secret for server-to-server public reads. Next.js loads it from `.env.local`
 * locally (standard). Never expose as NEXT_PUBLIC_*.
 */
export function getFrontendServerKey(): string | undefined {
  const key = process.env.FRONTEND_SERVER_KEY?.trim();
  return key ? key : undefined;
}

/**
 * Direct Laravel origin for server-side fetches (no browser cookies).
 */
export function getServerApiBaseUrl(): string {
  const configured = process.env.API_BASE_URL?.trim();
  return assertLocalhostUrl(
    "API_BASE_URL",
    configured ?? DEFAULT_API_BASE_URL,
  );
}
