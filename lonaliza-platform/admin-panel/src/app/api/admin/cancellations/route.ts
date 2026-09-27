import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  approveCancel,
  listPendingCancellations,
  rejectCancel,
  resolveChangeRequest,
} from "@/lib/server/hotel-cancellations";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const bookings = await listPendingCancellations();
  return NextResponse.json({ ok: true, bookings });
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const action = String(body.action || "");
  const bookingId = String(body.bookingId || "").trim();
  if (!bookingId) return NextResponse.json({ ok: false, error: "booking_required" }, { status: 400 });
  const note = String(body.note || "");
  if (action === "change_done" || action === "change_reject") {
    const result = await resolveChangeRequest({
      bookingId,
      action: action === "change_done" ? "done" : "reject",
      note,
      newCheckIn: body.newCheckIn ? String(body.newCheckIn) : undefined,
      newCheckOut: body.newCheckOut ? String(body.newCheckOut) : undefined,
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }
  if (action === "reject") {
    const result = await rejectCancel({ bookingId, note });
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }
  if (action === "approve" || action === "retry") {
    const result = await approveCancel({
      bookingId,
      feeAmount: Number(body.feeAmount || 0),
      note,
      ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "",
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }
  return NextResponse.json({ ok: false, error: "unknown_action" }, { status: 400 });
}
