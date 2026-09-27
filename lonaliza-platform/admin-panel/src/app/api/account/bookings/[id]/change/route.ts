import { NextRequest, NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { requestGuestChange } from "@/lib/server/hotel-cancellations";

export const runtime = "nodejs";

/**
 * Customer requests execution of the Lonaliza "flexible date" service.
 * The request is fulfilled internally by Lonaliza staff at the supplier — nothing is sent to the supplier here.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getRequestCustomer(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  }
  const { id } = await ctx.params;
  let newDate = "";
  let note = "";
  try {
    const body = (await req.json()) as { newDate?: string; note?: string };
    newDate = String(body.newDate || "");
    note = String(body.note || "");
  } catch {
    /* empty body */
  }
  try {
    const result = await requestGuestChange({ userId: user.id, bookingId: id, newDate, note });
    return NextResponse.json(result, { status: result.ok ? 200 : result.error === "forbidden" ? 403 : 400 });
  } catch {
    return NextResponse.json({ ok: false, error: "change_failed" }, { status: 400 });
  }
}
