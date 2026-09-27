import type { NextRequest } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { EnquiryBookingRecord, HotelBookingRecord } from "@/lib/pocketbase/records";
import { isAdminRequest } from "@/lib/server/admin-auth";
import { bookingConfirmToken, confirmTokensMatch } from "@/lib/server/hotel-booking-confirm";

export type BookingDocumentAccess =
  | { ok: true; via: "admin" | "owner" | "token" | "mock" }
  | { ok: false; status: 401 | 403 | 404; error: "login_required" | "forbidden" | "booking_not_found" };

/**
 * Authorises access to booking documents (voucher / ticket / invoice PDFs).
 * Allowed: admin session, the booking owner (user id or customer e-mail), or a valid confirm token
 * (`?token=` — the same token used by the public confirmation page e-mailed to the guest).
 */
export async function authorizeBookingDocument(req: NextRequest, bookingId: string): Promise<BookingDocumentAccess> {
  const id = String(bookingId || "").trim();
  if (!id) return { ok: false, status: 404, error: "booking_not_found" };

  const [customer, admin] = await Promise.all([getRequestCustomer(req), isAdminRequest(req).catch(() => false)]);
  if (admin) return { ok: true, via: "admin" };

  if (id.startsWith("mock-")) {
    return customer ? { ok: true, via: "mock" } : { ok: false, status: 401, error: "login_required" };
  }

  const token = String(req.nextUrl.searchParams.get("token") || req.nextUrl.searchParams.get("confirm") || "").trim();
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return { ok: false, status: 403, error: "forbidden" };

  const email = customer?.email?.toLowerCase() || "";
  const hotel = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(id).catch(() => null);
  if (hotel) {
    if (customer && ((hotel.user && hotel.user === customer.id) || (email && String(hotel.customer_email || "").toLowerCase() === email))) {
      return { ok: true, via: "owner" };
    }
    const stored = bookingConfirmToken(hotel);
    if (token && stored && confirmTokensMatch(stored, token)) return { ok: true, via: "token" };
    return customer ? { ok: false, status: 403, error: "forbidden" } : { ok: false, status: 401, error: "login_required" };
  }

  const enquiry = await pb.collection("enquiry_bookings").getOne<EnquiryBookingRecord>(id).catch(() => null);
  if (enquiry) {
    const rec = enquiry as unknown as Record<string, unknown>;
    const owner = String(rec.user || "");
    const enquiryEmail = String(rec.customer_email || rec.email || "").toLowerCase();
    if (customer && ((owner && owner === customer.id) || (email && enquiryEmail === email))) return { ok: true, via: "owner" };
    const meta = (rec.meta && typeof rec.meta === "object" ? rec.meta : {}) as Record<string, unknown>;
    const stored = String(meta.confirm_token || rec.confirm_token || "");
    if (token && stored && confirmTokensMatch(stored, token)) return { ok: true, via: "token" };
    return customer ? { ok: false, status: 403, error: "forbidden" } : { ok: false, status: 401, error: "login_required" };
  }

  return { ok: false, status: 404, error: "booking_not_found" };
}
