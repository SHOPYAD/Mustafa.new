import { NextRequest } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { initFlightBooking } from "@/lib/server/flights-bookings";
import { PUBLIC_FLIGHT_EMPTY } from "@/lib/server/flights-engine";
import { flightsFailJson, flightsJson } from "@/lib/server/flights-http";
import { localeFromRequest } from "@/lib/server/email/recipient-locale";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
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

  const user = await getRequestCustomer(req);
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
      name: String(contact.name || body.customer_name || ""),
      email: String(contact.email || body.customer_email || ""),
      phone: String(contact.phone || body.customer_phone || ""),
    },
    travelers: Array.isArray(body.travelers)
      ? (body.travelers as Array<Record<string, unknown>>)
      : [],
    userId: user?.id,
    locale: localeFromRequest(req, body),
  });

  if (!result.ok) {
    if (result.errorCode === "not_bookable" || result.errorCode === "fare_unavailable" || result.errorCode === "quote_failed") {
      return flightsJson(
        {
          ok: false,
          provider: "live",
          errorCode: result.errorCode,
          error:
            result.errorCode === "quote_failed"
              ? "تعذّر التحقق من السعر لدى المورد الآن، حاولوا مجدداً"
              : "هذه التعرفة لم تعد متاحة لدى المورد، اختاروا رحلة أو باقة أخرى",
        },
        409
      );
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
    quotedClient: result.booking.quotedClient,
    fareChanged: Boolean(quote?.fareChanged),
    quote: quote
      ? {
          clientTotal: quote.clientTotal,
          currency: quote.clientCurrency,
          previousClientTotal: quote.previousClientTotal,
          expiresAt: quote.expiresAt,
          baggage: quote.baggage,
        }
      : null,
    itinerary: result.booking.itinerary,
    payment: result.payment,
  });
}
