import { cookies, draftMode } from "next/headers";
import { NextResponse } from "next/server";

import { serverApiRequest } from "@/lib/api/server-client";

function safePath(path: string): string | null {
  if (path.includes("://") || path.startsWith("//") || path.includes("\\")) {
    return null;
  }
  if (!path.startsWith("/ar") && !path.startsWith("/en")) {
    return null;
  }
  return path;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  const path = safePath(url.searchParams.get("path") ?? "");
  if (token === "" || path === null) {
    return NextResponse.json({ message: "invalid_preview" }, { status: 422 });
  }

  try {
    await serverApiRequest("/api/internal/preview-tokens?token=" + encodeURIComponent(token), {
      method: "GET",
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ message: "invalid_preview" }, { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();
  const jar = await cookies();
  jar.set("PREVIEW_TOKEN", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
  });

  return NextResponse.redirect(new URL(path, url.origin));
}
