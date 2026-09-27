import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  listRecentIyzicoBookings,
  refreshIyzicoBooking,
  refundIyzicoBooking,
} from "@/lib/server/iyzico-bookings";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const bookings = await listRecentIyzicoBookings();
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

  const action = String(body.action || "").trim();
  const bookingId = String(body.bookingId || "").trim();
  if (!bookingId) {
    return NextResponse.json({ ok: false, error: "booking_required" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "";

  if (action === "retrieve") {
    const result = await refreshIyzicoBooking(bookingId);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  if (action === "refund") {
    const amount = Number(body.amount);
    const result = await refundIyzicoBooking({
      bookingId,
      amount: Number.isFinite(amount) && amount > 0 ? amount : undefined,
      ip,
    });
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  return NextResponse.json({ ok: false, error: "unknown_action" }, { status: 400 });
}
