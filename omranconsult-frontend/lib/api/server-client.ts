import "server-only";

import { getServerApiBaseUrl } from "@/core/env/server";
import { parseApiError } from "@/lib/api/errors";
import type { ApiHealthResponse } from "@/lib/api/types";

export type ServerRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  json?: unknown;
  headers?: HeadersInit;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
  signal?: AbortSignal;
};

function buildServerUrl(path: string): string {
  const base = getServerApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export async function serverApiRequest<T>(
  path: string,
  options: ServerRequestOptions = {},
): Promise<T> {
  const method = options.method ?? "GET";

  // Production keeps the caller's cache mode. In development, force-cache would reuse
  // `.next/dev/cache/fetch-cache` for up to a year, so a documents body saved before
  // `slug` existed kept failing Zod on later requests. Dev always reads the live API.
  const cache = process.env.NODE_ENV === "production" ? (options.cache ?? "no-store") : "no-store";

  const response = await fetch(buildServerUrl(path), {
    method,
    headers: {
      Accept: "application/json",
      "Accept-Language": "en",
      ...(options.headers ?? {}),
    },
    body: options.json === undefined ? undefined : JSON.stringify(options.json),
    cache,
    next: options.next,
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

export async function fetchApiHealth(): Promise<ApiHealthResponse> {
  return serverApiRequest<ApiHealthResponse>("/api/health", {
    method: "GET",
    cache: "no-store",
  });
}
