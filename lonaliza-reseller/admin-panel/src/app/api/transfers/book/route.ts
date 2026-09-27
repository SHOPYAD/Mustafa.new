import { NextRequest, NextResponse } from "next/server";
import { SeeruRideAdapter, SeeruRideBookingInput } from "@/lib/providers/adapters/seeru/seeruRideAdapter";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

const rideAdapter = new SeeruRideAdapter();

export async function POST(req: NextRequest) {
  const limited = rateLimit(`transfers-book:${clientIp(req)}`, 20, 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);

  try {
    const body = await req.json();
    const action = body.action || "save";

    switch (action) {
      case "save": {
        const input: SeeruRideBookingInput = {
          offerId: body.offerId,
          passenger: {
            firstName: body.passenger?.firstName || body.passenger?.first_name || "Guest",
            lastName: body.passenger?.lastName || body.passenger?.last_name || "User",
            email: body.passenger?.email || "guest@lonaliza.com",
            phone: body.passenger?.phone || "+905000000000",
          },
          flightNumber: body.flightNumber || body.flight_number,
          comments: body.comments,
          extras: body.extras || [],
          route: body.route || {
            from: body.from || "",
            to: body.to || "",
            date: body.date || "",
            time: body.time || "",
          },
        };

        if (!input.offerId) {
          return NextResponse.json({ ok: false, error: "offerId is required" }, { status: 400 });
        }

        const result = await rideAdapter.createBooking(input);
        return NextResponse.json({ ok: true, result });
      }

      case "issue": {
        const orderId = body.orderId || body.order_id;
        if (!orderId) {
          return NextResponse.json({ ok: false, error: "orderId is required" }, { status: 400 });
        }

        const result = await rideAdapter.issueOrder(orderId);
        return NextResponse.json({ ok: true, result });
      }

      case "details": {
        const orderId = body.orderId || body.order_id;
        if (!orderId) {
          return NextResponse.json({ ok: false, error: "orderId is required" }, { status: 400 });
        }

        const result = await rideAdapter.getOrderDetails(orderId);
        return NextResponse.json({ ok: true, result });
      }

      case "cancel": {
        const orderId = body.orderId || body.order_id;
        const reason = body.reason || "Customer requested cancellation";
        if (!orderId) {
          return NextResponse.json({ ok: false, error: "orderId is required" }, { status: 400 });
        }

        const result = await rideAdapter.cancelOrder(orderId, reason);
        return NextResponse.json({ ok: true, result });
      }

      default:
        return NextResponse.json({ ok: false, error: `Unsupported action: ${action}` }, { status: 400 });
    }
  } catch (err: any) {
    console.error("[TransfersBookAPI Error]:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to process ride booking" },
      { status: 500 }
    );
  }
}
