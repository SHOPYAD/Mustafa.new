import { NextRequest, NextResponse } from "next/server";
import { runFlightSearch } from "@/lib/server/flights-engine";
import {
  getWhiteLabelSettings,
  verifyB2BPartnerKey,
} from "@/lib/server/reseller-whitelabel-store";

export const runtime = "nodejs";

function extractKey(req: Request): string {
  const header = req.headers.get("x-lonaliza-b2b-key") || req.headers.get("x-api-key") || "";
  if (header) return header.trim();
  const auth = req.headers.get("authorization") || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7).trim();
  const url = new URL(req.url);
  return url.searchParams.get("apiKey") || "";
}

export async function GET(req: NextRequest) {
  const apiKey = extractKey(req);
  const check = await verifyB2BPartnerKey(apiKey);

  if (!check.ok || !check.company) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: check.errorCode || "unauthorized",
        errorMessage: check.errorMessage || "المفتاح البرمجي غير مصرح له أو رصيد الديبوزيت غير كافٍ.",
      },
      { status: 403 }
    );
  }

  const q = req.nextUrl.searchParams;
  const originSkyId = (q.get("originSkyId") || "").trim();
  const destinationSkyId = (q.get("destinationSkyId") || "").trim();
  const originEntityId = (q.get("originEntityId") || "").trim();
  const destinationEntityId = (q.get("destinationEntityId") || "").trim();
  const date = (q.get("date") || "").trim();

  if (!originSkyId || !destinationSkyId || !date) {
    return NextResponse.json(
      {
        ok: false,
        error: "بيانات البحث غير مكتملة (مطلوب: originSkyId, destinationSkyId, date)",
      },
      { status: 400 }
    );
  }

  const settings = await getWhiteLabelSettings();
  const markupMultiplier = 1 + (settings.flightsMarkupPercent || 5) / 100;

  try {
    const result = await runFlightSearch({
      originSkyId,
      destinationSkyId,
      originEntityId: originEntityId || originSkyId,
      destinationEntityId: destinationEntityId || destinationSkyId,
      date,
      returnDate: q.get("returnDate") || undefined,
      adults: Number(q.get("adults") || 1),
      cabinClass: q.get("cabinClass") || undefined,
      currency: q.get("currency") || "USD",
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, errorCode: result.errorCode, error: "تعذر استرجاع نتائج الطيران حالياً" },
        { status: 502 }
      );
    }

    // Apply Lonaliza B2B platform markup and mask any raw supplier names
    const brandedItineraries = result.session.itineraries.map((it) => {
      const originalPrice = it.price.client || it.price.base || 0;
      const markedUpPrice = Math.round(originalPrice * markupMultiplier * 100) / 100;
      return {
        ...it,
        provider: "Lonaliza Flights",
        sourceChannel: "Lonaliza B2B Network",
        price: {
          ...it.price,
          client: markedUpPrice,
          formatted: `$${markedUpPrice.toLocaleString()}`,
        },
      };
    });

    return NextResponse.json({
      ok: true,
      channel: "Lonaliza Flights Redistribution",
      currency: result.session.currency || "USD",
      sessionId: result.session.sessionId,
      partnerCompany: check.company.companyName,
      markupAppliedPercent: settings.flightsMarkupPercent,
      itineraries: brandedItineraries,
      count: brandedItineraries.length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Search failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
