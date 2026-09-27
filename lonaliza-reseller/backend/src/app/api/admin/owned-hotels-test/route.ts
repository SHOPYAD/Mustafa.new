import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { testOwnedHotelFetch } from "@/lib/scraping/hotels/owned-client";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json().catch(() => ({}))) as { id?: string };
    const result = await testOwnedHotelFetch(body.id);
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "Test failed",
      },
      { status: 502 }
    );
  }
}
