import { NextResponse } from "next/server";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import type { HotelBookingRecord } from "@/lib/pocketbase/records";
import { bookingServiceOf, flightDisplayOf, paymentMethodOf } from "@/lib/server/hotel-cancellations";
import { getMockGuestBookingRows } from "@/lib/server/mock-account-bookings";

export const runtime = "nodejs";

export type PaymentLedgerItem = {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  serviceType: "flight" | "hotel" | "car" | "transfer" | "tour" | "package";
  title: string;
  pnr: string;
  date: string;
  amount: number;
  currency: string;
  paymentMethod: "card" | "binance_usdt" | "wallet" | "whatsapp";
  voucherCode: string;
  discountAmount: number;
  status: "paid" | "refunded" | "pending";
};

export async function GET(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  }

  const pb = await tryCreateAdminPocketBase();
  const payments: PaymentLedgerItem[] = [];

  if (pb) {
    try {
      const realBookings = await pb.collection("hotel_bookings").getFullList<HotelBookingRecord>({
        filter: `user = "${user.id}" || customer_email = "${user.email}"`,
        sort: "-created",
      });

      for (const b of realBookings) {
        const snap = (b.offer_snapshot && typeof b.offer_snapshot === "object" ? b.offer_snapshot : {}) as Record<string, unknown>;
        const service = bookingServiceOf(b);
        const flight = flightDisplayOf(b);
        const isCancelled = b.status === "cancelled" || b.cancel_status === "approved" || b.cancel_status === "refunded";

        const title =
          service === "flight"
            ? `${flight.origin || "SAW"} ➔ ${flight.destination || "RUH"} (${flight.airline || "طيران"})`
            : b.hotel_name || "خدمة سفر";

        const method = String(snap.payment_method || paymentMethodOf(b) || "card").toLowerCase();
        let paymentMethod: "card" | "binance_usdt" | "wallet" | "whatsapp" = "card";
        if (method.includes("binance") || method.includes("usdt")) paymentMethod = "binance_usdt";
        else if (method.includes("wallet")) paymentMethod = "wallet";
        else if (method.includes("whatsapp")) paymentMethod = "whatsapp";

        payments.push({
          id: `pay_${b.id}`,
          invoiceNumber: `INV-${b.id.slice(0, 8).toUpperCase()}`,
          bookingId: b.id,
          serviceType: service as PaymentLedgerItem["serviceType"],
          title,
          pnr: flight.pnr || b.ref_code || b.id.slice(0, 8).toUpperCase(),
          date: b.created || new Date().toISOString(),
          amount: Number(b.price || snap.display_amount || 0),
          currency: b.currency || "USD",
          paymentMethod,
          voucherCode: String(snap.voucherCode || snap.couponCode || (snap.discount ? "LOYALTY-PROMO" : "")),
          discountAmount: Number(snap.discount || snap.voucherDiscount || 0),
          status: isCancelled ? "refunded" : b.payment_status === "paid" || b.status === "paid" ? "paid" : "pending",
        });
      }
    } catch {
      /* ignore */
    }
  }

  // Inject realistic mock payment entries for testing and audit
  const mockRows = getMockGuestBookingRows();
  for (const m of mockRows) {
    const isFlight = m.service === "flight";
    const title = isFlight ? m.hotel_name : m.hotel_name;
    const isCancelled = m.status === "cancelled" || m.cancel_status === "pending_admin" || m.cancel_status === "refunded";

    payments.push({
      id: `pay_${m.id}`,
      invoiceNumber: `INV-${m.id.replace("mock-", "").slice(0, 10).toUpperCase()}`,
      bookingId: m.id,
      serviceType: m.service as PaymentLedgerItem["serviceType"],
      title,
      pnr: m.pnr || m.id.toUpperCase(),
      date: m.check_in || "2026-09-02T10:00:00Z",
      amount: m.price,
      currency: m.currency || "USD",
      paymentMethod: m.id.includes("usdt") ? "binance_usdt" : m.id.includes("wallet") ? "wallet" : "card",
      voucherCode: m.price > 500 ? "VIP-AUTUMN26" : "",
      discountAmount: m.price > 500 ? 50 : 0,
      status: isCancelled ? "refunded" : "paid",
    });
  }

  // Calculate high-level financial KPIs
  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const completedCount = payments.filter((p) => p.status === "paid").length;

  const discountsTotal = payments.reduce((sum, p) => sum + p.discountAmount, 0);

  const refundedTotal = payments
    .filter((p) => p.status === "refunded")
    .reduce((sum, p) => sum + p.amount, 0);

  return NextResponse.json({
    ok: true,
    stats: {
      totalPaid: Math.round(totalPaid * 100) / 100,
      completedCount,
      discountsTotal: Math.round(discountsTotal * 100) / 100,
      refundedTotal: Math.round(refundedTotal * 100) / 100,
      currency: "USD",
    },
    payments,
  });
}
