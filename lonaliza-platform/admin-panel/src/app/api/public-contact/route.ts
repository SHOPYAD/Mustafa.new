import { NextResponse } from "next/server";
import { getSiteContact } from "@/lib/server/site-contact-file";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const contact = await getSiteContact();
    return NextResponse.json({ ok: true, contact }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
