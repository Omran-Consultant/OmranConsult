import { cookies, draftMode } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const draft = await draftMode();
  draft.disable();
  const jar = await cookies();
  jar.delete("PREVIEW_TOKEN");
  const origin = new URL(request.url).origin;
  return NextResponse.redirect(new URL("/en", origin));
}
