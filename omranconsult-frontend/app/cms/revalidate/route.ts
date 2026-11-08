import { timingSafeEqual } from "node:crypto";

import { revalidateTag } from "next/cache";
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
    revalidateTag(tag, "max");
  }

  return NextResponse.json({ revalidated: parsed.data.tags });
}
