import { timingSafeEqual } from "node:crypto";

import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  tags: z.array(z.string().regex(/^[a-z0-9:_-]{1,64}$/i)).max(50),
});

function secretMatches(provided: string | null, expected: string): boolean {
  if (!provided || provided.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

function pathsForTag(tag: string): string[] {
  if (tag === "home") {
    return ["/ar", "/en"];
  }
  if (tag === "projects") {
    return ["/ar/projects", "/en/projects"];
  }
  if (tag === "news") {
    return ["/ar/media", "/en/media"];
  }
  const project = /^project:(.+)$/.exec(tag);
  if (project) {
    return [`/ar/projects/${project[1]}`, `/en/projects/${project[1]}`];
  }
  const news = /^news:(.+)$/.exec(tag);
  if (news) {
    return [`/ar/media/${news[1]}`, `/en/media/${news[1]}`];
  }
  return [];
}

export async function POST(request: Request) {
  const expected = process.env.REVALIDATION_SECRET?.trim() ?? "";
  if (expected === "") {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!secretMatches(token, expected)) {
    return NextResponse.json({ message: "unauthorized" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "invalid_body", errors: parsed.error.flatten() }, { status: 422 });
  }

  for (const tag of parsed.data.tags) {
    // CMS publish must not serve the previous page. `max` is stale-while-revalidate
    // for up to a year; expire 0 blocks until the tagged cache is rebuilt.
    revalidateTag(tag, { expire: 0 });
    for (const path of pathsForTag(tag)) {
      revalidatePath(path);
    }
  }

  return NextResponse.json({ revalidated: parsed.data.tags });
}
