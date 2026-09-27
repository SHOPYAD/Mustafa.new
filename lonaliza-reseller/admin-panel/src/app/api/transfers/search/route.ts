import { NextRequest, NextResponse } from "next/server";
import { SeeruRideAdapter, SeeruRideSearchParams } from "@/lib/providers/adapters/seeru/seeruRideAdapter";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/server/rate-limit";
import { applyMarkup } from "@/lib/server/sales-catalog";

export const runtime = "nodejs";

const rideAdapter = new SeeruRideAdapter();

export async function GET(req: NextRequest) {
  const limited = rateLimit(`transfers-search:${clientIp(req)}`, 40, 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);

  const { searchParams } = new URL(req.url);
  const fromPlaceId = searchParams.get("fromPlaceId") || searchParams.get("from") || "";
  const toPlaceId = searchParams.get("toPlaceId") || searchParams.get("to") || undefined;
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const time = searchParams.get("time") || "12:00";
  const mode = (searchParams.get("mode") as "transfer" | "hourly") || "transfer";
  const hours = searchParams.get("hours") ? Number(searchParams.get("hours")) : undefined;
  const pax = searchParams.get("pax") ? Number(searchParams.get("pax")) : 2;
  const luggage = searchParams.get("luggage") ? Number(searchParams.get("luggage")) : 2;
  const currency = searchParams.get("currency") || "USD";

  if (!fromPlaceId) {
    return NextResponse.json({ ok: false, error: "fromPlaceId is required" }, { status: 400 });
  }

  return executeSearch({
    fromPlaceId,
    toPlaceId,
    date,
    time,
    mode,
    hours,
    pax,
    luggage,
    currency,
  });
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(`transfers-search:${clientIp(req)}`, 40, 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);

  try {
    const body = await req.json();
    const fromPlaceId = body.fromPlaceId || body.from || "";
    if (!fromPlaceId) {
      return NextResponse.json({ ok: false, error: "fromPlaceId is required" }, { status: 400 });
    }

    return executeSearch({
      fromPlaceId,
      toPlaceId: body.toPlaceId || body.to || undefined,
      date: body.date || new Date().toISOString().split("T")[0],
      time: body.time || "12:00",
      mode: body.mode || "transfer",
      hours: body.hours ? Number(body.hours) : undefined,
      pax: body.pax ? Number(body.pax) : 2,
      luggage: body.luggage ? Number(body.luggage) : 2,
      currency: body.currency || "USD",
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 });
  }
}

async function executeSearch(params: SeeruRideSearchParams) {
  try {
    const result = await rideAdapter.searchRides(params);
    const markupPercent = Number(process.env.TRANSFERS_MARKUP_PERCENT || 15);

    const offers = result.offers.map((offer) => {
      const basePrice = offer.price;
      const clientPrice = applyMarkup(basePrice, markupPercent);
      return {
        ...offer,
        basePrice,
        price: clientPrice,
        currency: result.currency,
        markupApplied: clientPrice - basePrice,
      };
    });

    return NextResponse.json({
      ok: true,
      searchId: result.searchId,
      currency: result.currency,
      offers,
    });
  } catch (err: any) {
    console.error("[TransfersSearchAPI Error]:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to search transfers", offers: [] },
      { status: 500 }
    );
  }
}
