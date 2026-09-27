import { NextRequest, NextResponse } from "next/server";
import {
  defaultHotelDates,
  parseHotelApiId,
  parseHotelRouteSource,
} from "@/lib/hotels-config";
import { applyHotelMarkupToRooms, runtimeHasProvider } from "@/lib/hotels-runtime";
import { nightsBetween } from "@/lib/hotel-display";
import { roomsFromOffers } from "@/lib/hotel-offers";
import { getHotelsRuntime } from "@/lib/server/hotels-runtime-store";
import {
  getOwnedHotelOffers,
  mapOwnedEnginePublicError,
} from "@/lib/scraping/hotels/owned-client";
import {
  getHotelOffers,
  mapTravelAdvisorPublicError,
} from "@/lib/server/travel-advisor";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const hotelsRuntime = await getHotelsRuntime();
  const { searchParams } = new URL(req.url);
  const rawId = searchParams.get("id") || "";
  const id = parseHotelApiId(rawId) || rawId.replace(/^(ta-|owned-|bk-)/, "").trim();
  if (!id) {
    return NextResponse.json({ ok: false, error: "Missing hotel id" }, { status: 400 });
  }
  if (parseHotelRouteSource(rawId) === "booking") {
    return NextResponse.json({
      ok: true,
      offers: [],
      rooms: [],
      checkIn: searchParams.get("checkIn") || "",
      checkOut: searchParams.get("checkOut") || "",
      nights: 0,
    });
  }

  const defaults = defaultHotelDates();
  const checkIn = searchParams.get("checkIn")?.trim() || defaults.checkIn;
  const checkOut = searchParams.get("checkOut")?.trim() || defaults.checkOut;
  const adults = Number(searchParams.get("adults") || 2);
  const lang = searchParams.get("lang")?.trim() || "";

  try {
    if (runtimeHasProvider(hotelsRuntime, "owned") && hotelsRuntime.mode === "single") {
      const payload = await getOwnedHotelOffers({
        id,
        checkIn,
        checkOut,
        adults: Number.isFinite(adults) ? adults : 2,
        lang,
      });
      const offers = Array.isArray(payload.offers) ? payload.offers : [];
      const rooms = applyHotelMarkupToRooms(
        Array.isArray(payload.rooms) ? payload.rooms : [],
        hotelsRuntime.markupRules,
        { provider: "owned" }
      );
      return NextResponse.json({
        ok: true,
        offers,
        rooms,
        checkIn,
        checkOut,
        nights: nightsBetween(checkIn, checkOut),
      });
    }

    const offers = await getHotelOffers(id, {
      checkIn,
      checkOut,
      adults: Number.isFinite(adults) ? adults : 2,
      lang,
    });
    const rooms = roomsFromOffers(offers, [], Number.isFinite(adults) ? adults : 2).filter(
      (room) => room.name && !/agoda|booking\.com|expedia|trip\.com/i.test(room.name)
    );
    const nights = nightsBetween(checkIn, checkOut);
    return NextResponse.json({
      ok: true,
      offers,
      rooms: applyHotelMarkupToRooms(rooms, hotelsRuntime.markupRules, {
        provider: "travel_advisor",
      }),
      checkIn,
      checkOut,
      nights,
    });
  } catch (e) {
    const mapped =
      runtimeHasProvider(hotelsRuntime, "owned") && hotelsRuntime.mode === "single"
        ? mapOwnedEnginePublicError(e)
        : mapTravelAdvisorPublicError(e);
    return NextResponse.json(
      {
        ok: false,
        offers: [],
        error: mapped.error,
        errorCode: mapped.errorCode,
      },
      { status: mapped.status }
    );
  }
}
