import { NextResponse } from "next/server";
import { getPublishedHomepageDraft } from "@/lib/server/homepage-template-store";

export const runtime = "nodejs";

/** Public published homepage template (defaults if nothing published). */
export async function GET() {
  const draft = await getPublishedHomepageDraft();
  return NextResponse.json({ ok: true, draft });
}
