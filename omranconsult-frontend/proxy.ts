import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

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

  try {
    const response = await fetch(`${apiBase}/api/${resource}/${encodeURIComponent(slug)}`, {
      method: "HEAD",
      headers: { Accept: "application/json", "Accept-Language": locale },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    return response.status === 404 ? locale : undefined;
  } catch {
    return undefined;
  }
}

export default async function proxy(request: NextRequest) {
  const locale = await missingDetailLocale(request);
  if (locale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/__missing`;
    return NextResponse.rewrite(url);
  }

  return handleI18n(request);
}

export const config = {
  matcher: ["/((?!api|sanctum|_next|_vercel|.*\\..*).*)"],
};
