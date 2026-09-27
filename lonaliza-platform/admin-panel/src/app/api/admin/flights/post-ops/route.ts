import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getFlightBooking,
  getFlightBookingSupplierDetails,
  ticketFlightBooking,
  cancelFlightBooking,
  quoteFlightBookingRefund,
  syncFlightTicketState,
} from "@/lib/server/flights-bookings";
import { fulfilFlightBooking, mirrorFlightStateToHotelBooking } from "@/lib/server/flights/fulfilment";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const bookingId = searchParams.get("bookingId");
  if (!bookingId) {
    return NextResponse.json({ ok: false, error: "bookingId is required" }, { status: 400 });
  }

  const res = await getFlightBookingSupplierDetails(bookingId);
  return NextResponse.json(res);
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const body = (await req.json().catch(() => ({}))) as {
    action?: "ticket" | "cancel" | "quote_refund" | "sync" | "fulfil" | "session";
    bookingId?: string;
    params?: any;
  };

  if (!body.bookingId) {
    return NextResponse.json({ ok: false, error: "bookingId is required" }, { status: 400 });
  }

  switch (body.action) {
    case "ticket": {
      const res = await ticketFlightBooking(body.bookingId);
      await mirrorFlightStateToHotelBooking(body.bookingId).catch(() => undefined);
      return NextResponse.json(res);
    }
    case "sync": {
      const res = await syncFlightTicketState(body.bookingId);
      await mirrorFlightStateToHotelBooking(body.bookingId).catch(() => undefined);
      return NextResponse.json(res);
    }
    case "fulfil": {
      // bookingId here is the paid hotel_bookings row id (provider "flight"); re-runs the idempotent state machine.
      const res = await fulfilFlightBooking(body.bookingId, { trigger: "admin" });
      return NextResponse.json({ ok: res.status !== "skipped", ...res });
    }
    case "session": {
      const session = await getFlightBooking(body.bookingId);
      if (!session) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
      // Supplier tokens / raw payloads never leave the server.
      const { fareToken, rawOffer, verifiedPayload, ...safe } = session;
      void fareToken;
      void rawOffer;
      void verifiedPayload;
      return NextResponse.json({ ok: true, session: safe });
    }
    case "cancel": {
      const res = await cancelFlightBooking(body.bookingId);
      await mirrorFlightStateToHotelBooking(body.bookingId).catch(() => undefined);
      return NextResponse.json(res);
    }
    case "quote_refund": {
      const res = await quoteFlightBookingRefund(body.bookingId, body.params);
      return NextResponse.json(res);
    }
    default:
      return NextResponse.json({ ok: false, error: "unknown_action" }, { status: 400 });
  }
}
