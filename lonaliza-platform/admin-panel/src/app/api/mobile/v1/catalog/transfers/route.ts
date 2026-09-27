import { NextRequest, NextResponse } from "next/server";
import { SeeruRideAdapter } from "@/lib/providers/adapters/seeru/seeruRideAdapter";
import { applyMarkup } from "@/lib/server/sales-catalog";
import { appEnabledKeys, getChannelServices } from "@/lib/server/channel-services-store";

export const runtime = "nodejs";

const rideAdapter = new SeeruRideAdapter();

export async function GET(req: NextRequest) {
  const channels = await getChannelServices();
  if (!appEnabledKeys(channels).includes("transfers")) {
    return NextResponse.json({ ok: true, offers: [], empty: true });
  }

  const q = req.nextUrl.searchParams;
  const fromPlaceId = q.get("fromPlaceId") || "";
  const toPlaceId = q.get("toPlaceId") || "";
  if (!fromPlaceId || !toPlaceId) {
    return NextResponse.json(
      { ok: false, error: "fromPlaceId and toPlaceId are required", offers: [] },
      { status: 400 }
    );
  }

  try {
    const result = await rideAdapter.searchRides({
      fromPlaceId,
      toPlaceId,
      date: q.get("date") || new Date().toISOString().split("T")[0],
      time: q.get("time") || "12:00",
      mode: (q.get("mode") as "transfer" | "hourly") || "transfer",
      hours: q.get("hours") ? Number(q.get("hours")) : undefined,
      pax: q.get("pax") ? Number(q.get("pax")) : 2,
      luggage: q.get("luggage") ? Number(q.get("luggage")) : 2,
      currency: q.get("currency") || "USD",
    });
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
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "search_failed", offers: [] },
      { status: 500 }
    );
  }
}
