import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { auditFromRequest } from "@/lib/server/admin-audit";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { enquiryToApi, type EnquiryBookingRecord } from "@/lib/pocketbase/records";
import type { BookingStatus } from "@/types/database";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Ctx) {
  const denied = await assertAdminApi(request);
  if (denied) return denied;
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const status = String(body.status || "") as BookingStatus;
  if (!["new", "in-progress", "resolved"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const pb = await tryCreateAdminPocketBase();
  if (!pb) {
    return NextResponse.json(
      { error: "PocketBase غير مهيأ" },
      { status: 503 }
    );
  }

  if (id.startsWith("hotel:")) {
    return NextResponse.json(
      { error: "تحديث حالة حجز الفندق غير مدعوم من هنا" },
      { status: 400 }
    );
  }

  try {
    const data = await pb
      .collection("enquiry_bookings")
      .update<EnquiryBookingRecord>(id, { status });
    return NextResponse.json({ booking: enquiryToApi(data), pocketbase: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Update failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: Ctx) {
  const denied = await assertAdminApi(request);
  if (denied) return denied;
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const pb = await tryCreateAdminPocketBase();
  if (!pb) {
    return NextResponse.json(
      { error: "PocketBase غير مهيأ" },
      { status: 503 }
    );
  }

  try {
    if (id.startsWith("hotel:")) {
      await pb.collection("hotel_bookings").delete(id.slice("hotel:".length));
    } else {
      await pb.collection("enquiry_bookings").delete(id);
    }
    await auditFromRequest(request, "booking.delete", true, id);
    return NextResponse.json({ ok: true, pocketbase: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Delete failed" },
      { status: 500 }
    );
  }
}
