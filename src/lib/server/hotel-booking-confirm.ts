import { randomBytes, timingSafeEqual } from "crypto";
import { defaultHotels } from "@/data/hotels";
import { detectInvoiceService, type InvoiceService } from "@/lib/booking-service";
import { nightsBetween, stayFromNightly } from "@/lib/hotel-display";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { HotelBookingRecord } from "@/lib/pocketbase/records";

function catalogHotelImage(hotelId: string, slug: string): string {
  const hotel = defaultHotels.find(
    (row) => row.id === hotelId || row.slug === hotelId || row.slug === slug
  );
  return hotel?.images?.[0] || "";
}

export type HotelBookingConfirmView = {
  id: string;
  hotel_id: string;
  hotel_name: string;
  hotel_slug: string;
  hotel_image: string;
  stars: number;
  rating: number;
  room_name: string;
  check_in: string;
  check_out: string;
  nights: number;
  adults: number;
  children: number;
  guest_names: string[];
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  nightly: number;
  price: number;
  currency: string;
  payment_method: "card" | "whatsapp" | "other";
  status: string;
  payment_status: string;
  confirm: string;
  service: InvoiceService;
  snapshot: Record<string, unknown>;
};

function snapshotOf(booking: HotelBookingRecord): Record<string, unknown> {
  return booking.offer_snapshot && typeof booking.offer_snapshot === "object"
    ? { ...booking.offer_snapshot }
    : {};
}

function snapString(booking: HotelBookingRecord, key: string, fallback = ""): string {
  const field = (booking as Record<string, unknown>)[key];
  if (field != null && String(field).trim()) return String(field);
  const snap = snapshotOf(booking);
  return snap[key] != null && String(snap[key]).trim() ? String(snap[key]) : fallback;
}

function snapNumber(booking: HotelBookingRecord, key: string): number {
  const field = Number((booking as Record<string, unknown>)[key]);
  if (Number.isFinite(field) && field !== 0) return field;
  const n = Number(snapshotOf(booking)[key]);
  return Number.isFinite(n) ? n : 0;
}

function paymentMethodOf(booking: HotelBookingRecord): "card" | "whatsapp" | "other" {
  const method = snapString(booking, "payment_method").toLowerCase();
  if (method === "iyzico" || method === "card" || booking.iyzico_payment_id || booking.iyzico_token) {
    return "card";
  }
  if (method === "whatsapp") return "whatsapp";
  return "other";
}

export function newConfirmToken(): string {
  return randomBytes(24).toString("hex");
}

export function bookingConfirmToken(booking: HotelBookingRecord): string {
  return snapString(booking, "confirm_token");
}

export function confirmTokensMatch(stored: string, given: string): boolean {
  const a = Buffer.from(String(stored || ""), "utf8");
  const b = Buffer.from(String(given || ""), "utf8");
  if (a.length === 0 || a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function toHotelBookingConfirmView(booking: HotelBookingRecord): HotelBookingConfirmView {
  const snap = snapshotOf(booking);
  const nights = Math.max(1, nightsBetween(booking.check_in, booking.check_out));
  const storedNightly = snapNumber(booking, "nightly") || Number(snap.nightly) || 0;
  const storedTotal = Number(booking.price) || snapNumber(booking, "display_amount") || 0;
  const money =
    storedNightly > 0
      ? stayFromNightly(storedNightly, nights)
      : storedTotal > 0
        ? stayFromNightly(Math.round(storedTotal / nights), nights)
        : { nightly: 0, total: 0 };
  const guests = Array.isArray(booking.guest_names)
    ? booking.guest_names.map((n) => String(n).trim()).filter(Boolean)
    : [];

  return {
    id: booking.id,
    hotel_id: booking.hotel_id,
    hotel_name: booking.hotel_name,
    hotel_slug: booking.hotel_slug || booking.hotel_id,
    hotel_image:
      snapString(booking, "hotel_image") || catalogHotelImage(booking.hotel_id, booking.hotel_slug || booking.hotel_id),
    stars: snapNumber(booking, "stars"),
    rating: snapNumber(booking, "rating"),
    room_name: booking.room_name || snapString(booking, "room_name"),
    check_in: booking.check_in,
    check_out: booking.check_out,
    nights,
    adults: Number(booking.adults) || 1,
    children: Number(booking.children) || 0,
    guest_names: guests,
    customer_name: booking.customer_name,
    customer_email: booking.customer_email || "",
    customer_phone: booking.customer_phone || "",
    nightly: money.nightly,
    price: storedTotal > 0 ? storedTotal : money.total,
    currency: booking.currency || snapString(booking, "display_currency", "USD") || "USD",
    payment_method: paymentMethodOf(booking),
    status: booking.status,
    payment_status: String(booking.payment_status || booking.status || ""),
    confirm: bookingConfirmToken(booking),
    service: detectInvoiceService({
      provider: booking.provider,
      hotel_id: booking.hotel_id,
      offer_snapshot: snap,
    }),
    snapshot: snap,
  };
}

export async function getHotelBookingRecord(id: string): Promise<HotelBookingRecord | null> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return null;
  try {
    return await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(String(id || "").trim());
  } catch {
    return null;
  }
}

export async function authorizeHotelBookingConfirm(opts: {
  bookingId: string;
  confirm?: string;
  userId?: string;
}): Promise<HotelBookingRecord | null> {
  const booking = await getHotelBookingRecord(opts.bookingId);
  if (!booking) return null;
  if (opts.userId && booking.user && booking.user === opts.userId) return booking;
  const stored = bookingConfirmToken(booking);
  if (stored && confirmTokensMatch(stored, String(opts.confirm || ""))) return booking;
  return null;
}

export async function ensureBookingConfirmToken(bookingId: string): Promise<string> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return "";
  try {
    const booking = await pb.collection("hotel_bookings").getOne<HotelBookingRecord>(bookingId);
    const existing = bookingConfirmToken(booking);
    if (existing) return existing;
    const token = newConfirmToken();
    const snap = snapshotOf(booking);
    try {
      await pb.collection("hotel_bookings").update(booking.id, {
        offer_snapshot: { ...snap, confirm_token: token },
      });
    } catch {
      return token;
    }
    return token;
  } catch {
    return "";
  }
}
