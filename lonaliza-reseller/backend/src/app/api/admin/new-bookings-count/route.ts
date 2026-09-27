import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { countNewAdminBookings } from "@/lib/server/new-bookings-count";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const count = await countNewAdminBookings();
  return NextResponse.json({ ok: true, count });
}
