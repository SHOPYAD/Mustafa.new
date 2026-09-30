import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { HotelBookingRecord } from "@/lib/pocketbase/records";
import { toAdminCancelRow } from "@/lib/server/hotel-cancellations";
import {
  pickFocusRequest,
  refundPreview,
  summarizeBookings,
  type BookingRowInput,
} from "@/lib/neural-studio/bookings-graph";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SAMPLE = 200;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

function toRowInput(record: HotelBookingRecord): BookingRowInput {
  const row = toAdminCancelRow(record);
  return {
    id: row.id,
    status: row.status,
    payment_status: row.payment_status,
    cancel_status: row.cancel_status,
    cancel_reason: row.cancel_reason,
    cancel_until: row.cancel_until,
    free_cancellation: row.free_cancellation,
    non_refundable: row.non_refundable,
    customer_name: row.customer_name,
    supplier_reference: row.supplier_reference,
    cancel_requested_at: row.cancel_requested_at,
    charged_amount: row.charged_amount,
    charged_currency: row.charged_currency,
    cancel_fee_amount: row.cancel_fee_amount,
    request_type: row.request_type,
  };
}

type SourceState = { collection: string; totalItems: number | null; state: "live" | "error"; error?: string };

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const pb = await tryCreateAdminPocketBase();
  if (!pb) {
    return NextResponse.json({ ok: true, freshness: "unknown", error: "pocketbase_unconfigured", fetchedAt: new Date().toISOString() });
  }

  const [hotel, bookings, reviews] = await Promise.allSettled([
    withTimeout(pb.collection("hotel_bookings").getList<HotelBookingRecord>(1, SAMPLE, { sort: "-updated" }), 3500),
    withTimeout(pb.collection("enquiry_bookings").getList(1, 1, { fields: "id" }), 2500),
    withTimeout(pb.collection("hotel_guest_reviews").getList(1, 1), 2500),
  ]);

  const source = (collection: string, result: PromiseSettledResult<{ totalItems: number }>): SourceState =>
    result.status === "fulfilled"
      ? { collection, totalItems: result.value.totalItems, state: "live" }
      : { collection, totalItems: null, state: "error", error: result.reason instanceof Error ? result.reason.message : "probe_failed" };

  const sources = [
    source("hotel_bookings", hotel),
    source("enquiry_bookings", bookings),
    source("hotel_guest_reviews", reviews),
  ];
  const rows = hotel.status === "fulfilled" ? hotel.value.items.map(toRowInput) : [];
  const liveCount = sources.filter((s) => s.state === "live").length;

  return NextResponse.json({
    ok: true,
    fetchedAt: new Date().toISOString(),
    freshness: liveCount === sources.length ? "live" : liveCount > 0 ? "partial" : "error",
    sources,
    summary: summarizeBookings(rows),
    focus: pickFocusRequest(rows),
  });
}

/** cancellation.preview: قراءة فقط، لا ينفذ إلغاء ولا استرداد. */
export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  if (body.action !== "preview") return NextResponse.json({ ok: false, error: "unknown_action" }, { status: 400 });
  const bookingId = String(body.bookingId || "").trim();
  if (!bookingId) return NextResponse.json({ ok: false, error: "booking_required" }, { status: 400 });

  const pb = await tryCreateAdminPocketBase();
  if (!pb) return NextResponse.json({ ok: false, error: "pocketbase_unconfigured" }, { status: 503 });
  try {
    const record = await withTimeout(pb.collection("hotel_bookings").getOne<HotelBookingRecord>(bookingId), 3000);
    const row = toRowInput(record);
    return NextResponse.json({ ok: true, bookingId, state: row.cancel_status, preview: refundPreview(row) });
  } catch (error) {
    const status = (error as { status?: number })?.status === 404 ? 404 : 502;
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "read_failed" }, { status });
  }
}
