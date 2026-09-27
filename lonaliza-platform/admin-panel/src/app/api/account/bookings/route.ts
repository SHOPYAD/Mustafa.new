import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { loadAccountBookings } from "@/lib/server/account-bookings-view";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  }
  const filter = new URL(req.url).searchParams.get("filter");
  const data = await loadAccountBookings(user.id, filter);
  return NextResponse.json({ ok: true, ...data });
}
