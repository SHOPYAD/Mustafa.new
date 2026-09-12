import { NextRequest, NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { requestGuestCancel } from "@/lib/server/hotel-cancellations";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await getRequestCustomer(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  }
  const { id } = await ctx.params;
  let reason = "";
  try {
    const body = (await req.json()) as { reason?: string };
    reason = String(body.reason || "");
  } catch {
    reason = "";
  }
  try {
    const result = await requestGuestCancel({ userId: user.id, bookingId: id, reason });
    return NextResponse.json(result, { status: result.ok ? 200 : result.error === "forbidden" ? 403 : 400 });
  } catch {
    return NextResponse.json({ ok: false, error: "cancel_failed" }, { status: 400 });
  }
}
