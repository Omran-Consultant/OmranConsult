import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

import { isIndexableHost, NOINDEX_VALUE } from "@/core/seo/indexing";
import { fetchRetryingTooManyRequests } from "@/lib/api/retry-after";
import { routing } from "@/i18n/routing";

const handleI18n = createMiddleware(routing);

const DETAIL = /^\/(ar|en)\/(projects|media)\/([^/]+)$/;

/**
 * Unknown project and news slugs are confirmed here, before Cache Components
 * streams the shell. A page-level notFound() runs after that shell and stays HTTP 200.
 */
async function missingDetailLocale(request: NextRequest): Promise<string | undefined> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return undefined;
  }

  const match = DETAIL.exec(request.nextUrl.pathname);
  if (!match) {
    return undefined;
  }

  const [, locale, section, slug] = match;
  const resource = section === "media" ? "news" : "projects";
  const apiBase = process.env.API_BASE_URL ?? "http://localhost:8000";
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Accept-Language": locale,
  };
  const key = process.env.FRONTEND_SERVER_KEY?.trim();
  if (key) {
    headers["X-Omran-Frontend-Key"] = key;
  }

  try {
    const response = await fetchRetryingTooManyRequests(() =>
      fetch(`${apiBase}/api/${resource}/${encodeURIComponent(slug)}`, {
        method: "HEAD",
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      }),
    );
    return response.status === 404 ? locale : undefined;
  } catch {
    return undefined;
  }
}

/** Hosts other than the production domain are never indexed (previews, tunnels, localhost). */
function withIndexingPolicy(request: NextRequest, response: NextResponse): NextResponse {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!isIndexableHost(host)) {
    response.headers.set("X-Robots-Tag", NOINDEX_VALUE);
  }

  return response;
}

export default async function proxy(request: NextRequest) {
  const locale = await missingDetailLocale(request);
  if (locale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/__missing`;
    return withIndexingPolicy(request, NextResponse.rewrite(url));
  }

  return withIndexingPolicy(request, handleI18n(request));
}

export const config = {
  matcher: ["/((?!api|sanctum|_next|_vercel|.*\\..*).*)"],
};
