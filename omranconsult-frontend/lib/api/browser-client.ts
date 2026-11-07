import { getBrowserApiBaseUrl } from "@/core/env/public";
import { parseApiError } from "@/lib/api/errors";
import { readXsrfTokenFromDocument } from "@/lib/api/xsrf-token";

export type BrowserRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  json?: unknown;
  headers?: HeadersInit;
  csrf?: boolean;
  signal?: AbortSignal;
};

let csrfInitialized = false;

function buildUrl(path: string): string {
  const base = getBrowserApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

function buildJsonHeaders(
  init: HeadersInit | undefined,
  xsrfToken: string | null,
): Headers {
  const headers = new Headers(init);
  headers.set("Accept", "application/json");

  if (xsrfToken) {
    headers.set("X-XSRF-TOKEN", xsrfToken);
  }

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

/**
 * Initialize Sanctum CSRF cookie (call before mutating admin requests).
 */
export async function ensureSanctumCsrfCookie(): Promise<void> {
  const response = await fetch(buildUrl("/sanctum/csrf-cookie"), {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  csrfInitialized = true;
}

export async function browserApiRequest<T>(
  path: string,
  options: BrowserRequestOptions = {},
): Promise<T> {
  const method = options.method ?? "GET";
  const isMutation = method !== "GET";

  if (isMutation && options.csrf !== false) {
    if (!csrfInitialized) {
      await ensureSanctumCsrfCookie();
    }
  }

  const xsrfToken =
    isMutation && options.csrf !== false
      ? readXsrfTokenFromDocument()
      : null;

  const response = await fetch(buildUrl(path), {
    method,
    credentials: "include",
    headers: buildJsonHeaders(options.headers, xsrfToken),
    body: options.json === undefined ? undefined : JSON.stringify(options.json),
    signal: options.signal,
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

/** Reset CSRF initialization flag (for tests). */
export function resetBrowserApiClientForTests(): void {
  csrfInitialized = false;
}
