import { NextRequest } from "next/server";
import { initFlightBooking } from "@/lib/server/flights-bookings";
import { PUBLIC_FLIGHT_EMPTY } from "@/lib/server/flights-engine";
import { flightsFailJson, flightsJson } from "@/lib/server/flights-http";
import { localeFromRequest } from "@/lib/server/email/recipient-locale";
import { appEnabledKeys, getChannelServices } from "@/lib/server/channel-services-store";
import { isMobileAuthDenied, requireMobileCustomer } from "@/lib/server/mobile/require-mobile-customer";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const auth = await requireMobileCustomer(req);
  if (isMobileAuthDenied(auth)) return auth;

  const channels = await getChannelServices();
  if (!appEnabledKeys(channels).includes("flight")) {
    return flightsJson({ ok: false, error: "service_disabled", offers: [] }, 404);
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return flightsJson(
      { ok: false, provider: "live", error: PUBLIC_FLIGHT_EMPTY, errorCode: "search_failed" },
      400
    );
  }

  const itineraryId = String(body.itineraryId || "").trim();
  if (!itineraryId) {
    return flightsJson(
      { ok: false, provider: "live", error: PUBLIC_FLIGHT_EMPTY, errorCode: "search_failed" },
      400
    );
  }

  const contact =
    body.contact && typeof body.contact === "object"
      ? (body.contact as Record<string, unknown>)
      : {};

  const result = await initFlightBooking({
    itineraryId,
    fareId: body.fareId ? String(body.fareId) : undefined,
    legs: body.legs,
    sessionId: body.sessionId ? String(body.sessionId) : undefined,
    currency: body.currency ? String(body.currency) : undefined,
    market: body.market ? String(body.market) : undefined,
    countryCode: body.countryCode ? String(body.countryCode) : undefined,
    quotedClient: body.quotedPrice != null ? Number(body.quotedPrice) : undefined,
    adults: Number(body.adults || 1),
    children: Number(body.children || body.childrens || 0),
    infants: Number(body.infants || 0),
    contact: {
      name: String(contact.name || body.customer_name || auth.customer.name || ""),
      email: String(contact.email || body.customer_email || auth.customer.email || ""),
      phone: String(contact.phone || body.customer_phone || ""),
    },
    travelers: Array.isArray(body.travelers)
      ? (body.travelers as Array<Record<string, unknown>>)
      : [],
    userId: auth.customer.id,
    locale: localeFromRequest(req, body),
  });

  if (!result.ok) {
    if (
      result.errorCode === "not_bookable" ||
      result.errorCode === "fare_unavailable" ||
      result.errorCode === "quote_failed"
    ) {
      return flightsJson({ ok: false, provider: "live", errorCode: result.errorCode }, 409);
    }
    return flightsFailJson(result.errorCode);
  }

  const quote = result.booking.quote;
  return flightsJson({
    ok: true,
    provider: "live",
    bookingId: result.booking.id,
    pocketbaseId: result.booking.pocketbaseId || null,
    price: result.booking.price,
    quote: quote
      ? {
          clientTotal: quote.clientTotal,
          currency: quote.clientCurrency,
          expiresAt: quote.expiresAt,
        }
      : null,
    payment: result.payment,
  });
}
