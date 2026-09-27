import { NextRequest, NextResponse } from "next/server";
import { createEmptyTrip } from "@/lib/planner/catalog";
import { enrichTripDirections } from "@/lib/planner/enrich";
import { buildLiveTrip, resolveDestinationCenter, type AgentDayHint } from "@/lib/planner/live-places";
import { warehouseCityKey } from "@/lib/planner/poi-warehouse";
import { hotelCityQuery } from "@/lib/hotel-city-query";
import { haversineKm, validLatLng } from "@/lib/planner/geo";
import { writeUniqueProgramCopy } from "@/lib/planner/write-program";
import { buildLiveQuote, getCuratedDestinationHotels, normalizeTrip } from "@/lib/server/ai-quote";
import { defaultSalesChatConfig } from "@/types/sales-chat";
import type { PlannerIntake, PlannerTransportMode } from "@/types/planner";

export const runtime = "nodejs";
export const maxDuration = 120;

function isoPlusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Partial<PlannerIntake> & {
    self?: boolean;
    agentDays?: AgentDayHint[];
    people?: number;
    radiusKm?: number;
    transportMode?: PlannerTransportMode;
  };
  const daysCount = Math.min(30, Math.max(1, Number(body.durationDays) || body.agentDays?.length || 5));
  const arrivalDate = String(body.arrivalDate || "").trim() || isoPlusDays(14);
  const departureDate = String(body.departureDate || "").trim() || isoPlusDays(14 + Math.max(1, daysCount - 1));
  const intake: PlannerIntake = {
    origin: String(body.origin || "").trim() || "Riyadh",
    destination: String(body.destination || ""),
    durationDays: daysCount,
    month: body.month,
    arrivalDate,
    departureDate,
    destLat: body.destLat,
    destLng: body.destLng,
    radiusKm: Number(body.radiusKm) || 25,
    transportMode: body.transportMode || "car",
    prefs: {
      companion: body.prefs?.companion || "family",
      style: body.prefs?.style || "cultural",
      styles: Array.isArray(body.prefs?.styles) && body.prefs?.styles.length
        ? body.prefs.styles
        : body.prefs?.style
          ? [body.prefs.style]
          : ["cultural"],
      pace: body.prefs?.pace || "relaxed",
      stay: body.prefs?.stay || "premium",
      rhythm: body.prefs?.rhythm || "early",
      notes: body.prefs?.notes || "",
    },
  };

  if (!intake.destination.trim() && !body.self) {
    return NextResponse.json({ ok: false, error: "destination_required" }, { status: 400 });
  }

  if (body.self) {
    const center = await resolveDestinationCenter(intake.destination);
    const empty = createEmptyTrip({
      ...intake,
      destLat: intake.destLat || center.lat,
      destLng: intake.destLng || center.lng,
    });
    return NextResponse.json({ ok: true, trip: empty });
  }

  const people = Math.max(1, Number(body.people) || 1);
  const markup = Number(defaultSalesChatConfig.salesMarkupPercent) || 15;
  intake.locale = (body as { locale?: PlannerIntake["locale"] }).locale || "ar";

  const center = await resolveDestinationCenter(intake.destination);
  intake.destLat = intake.destLat || center.lat;
  intake.destLng = intake.destLng || center.lng;
  const hotelCity = hotelCityQuery(center.labelEn || intake.destination) || center.labelEn || intake.destination;

  const [raw, quote] = await Promise.all([
    buildLiveTrip(intake, body.agentDays),
    buildLiveQuote(
      {
        destination: hotelCity,
        fromCity: intake.origin,
        arrivalDate: intake.arrivalDate,
        departureDate: intake.departureDate,
        nights: Math.max(1, intake.durationDays - 1),
        people,
      },
      markup,
      `from ${intake.origin} to ${hotelCity} ${intake.arrivalDate} ${intake.departureDate} ${intake.prefs.notes || ""}`,
      { services: ["flight", "hotel", "transfer", "car"], flightType: "one-way" }
    ).catch(() => null),
  ]);

  const destBlob = `${intake.destination} ${raw.destination} ${hotelCity}`.toLowerCase();
  const centerLat = Number(raw.center?.lat) || Number(intake.destLat);
  const centerLng = Number(raw.center?.lng) || Number(intake.destLng);
  const hasCenter = validLatLng(centerLat, centerLng);
  const isCairoDest = /cairo|القاهرة|قاهرة|giza|الجيزة|مصر|egypt/i.test(destBlob);

  const destSafeCards = (quote?.cards || []).filter((c) => {
    if (c.type !== "hotel") return true;
    if (hasCenter && validLatLng(c.lat, c.lng)) {
      const dist = haversineKm({ lat: centerLat, lng: centerLng }, { lat: c.lat!, lng: c.lng! });
      if (dist > 35) return false;
    }
    const hotelBlob = `${c.titleEn} ${c.titleAr} ${c.subtitleEn || ""} ${c.subtitleAr || ""}`.toLowerCase();
    const foreign = [
      [/rome|roma|روما|italy|إيطاليا|ايطاليا/, /rome|roma|روما/],
      [/dubai|دبي|dxb/, /dubai|دبي/],
      [/riyadh|الرياض|ruh/, /riyadh|الرياض/],
      [/jeddah|جدة|jed/, /jeddah|جدة/],
      [/cairo|القاهرة|قاهرة|giza|الجيزة/, /cairo|القاهرة|قاهرة|مصر/],
      [/istanbul|إسطنبول|اسطنبول|maslak|taksim/, /istanbul|إسطنبول|اسطنبول/],
      [/trabzon|طرابزون|uzungol|أوزنجول/, /trabzon|طرابزون/],
      [/antalya|أنطاليا|انطاليا/, /antalya|أنطاليا|انطاليا/],
      [/london|لندن/, /london|لندن/],
      [/paris|باريس/, /paris|باريس/],
      [/barcelona|برشلونة|برشلونه/, /barcelona|برشلونة|برشلونه/],
      [/athens|أثينا|اثينا|greece|اليونان/, /athens|أثينا|اثينا|greece|اليونان/],
    ];
    if (foreign.some(([hotelRe, destRe]) => hotelRe.test(hotelBlob) && !destRe.test(destBlob))) {
      return false;
    }
    if (isCairoDest && /rome|roma|روما|italy|إيطاليا|ايطاليا|turkey|تركيا|istanbul|إسطنبول|london|paris/i.test(hotelBlob)) {
      return false;
    }
    return true;
  });

  let safeHotels = destSafeCards.filter((c) => c.type === "hotel");
  if (safeHotels.length === 0) {
    const nights = Math.max(1, intake.durationDays - 1);
    safeHotels = getCuratedDestinationHotels(
      normalizeTrip({
        destination: hotelCity,
        fromCity: intake.origin,
        arrivalDate: intake.arrivalDate,
        departureDate: intake.departureDate,
        nights,
        people,
      }),
      markup
    );
  }

  const rankedCards = [
    ...destSafeCards.filter((c) => c.type === "flight").sort((a, b) => a.clientPrice - b.clientPrice).slice(0, 16),
    ...safeHotels.sort((a, b) => a.clientPrice - b.clientPrice).slice(0, 28),
    ...destSafeCards.filter((c) => c.type === "transfer").slice(0, 6),
    ...destSafeCards.filter((c) => c.type === "car").slice(0, 6),
  ];

  const selectedCards = [
    rankedCards.find((c) => c.type === "flight"),
    rankedCards.find((c) => c.type === "hotel"),
    rankedCards.find((c) => c.type === "transfer"),
    rankedCards.find((c) => c.type === "car"),
  ].filter(Boolean);
  const calculatedTotal = selectedCards.reduce((s, c) => s + (c?.clientPrice || 0), 0);
  const totalClientPrice = calculatedTotal > 0 ? calculatedTotal : (quote?.totalClientPrice || 0);

  const trip = await enrichTripDirections({
    ...raw,
    cards: rankedCards,
    totalClientPrice,
    currency: "USD",
    arrivalDate: quote?.arrivalDate || raw.arrivalDate,
    departureDate: quote?.departureDate || raw.departureDate,
  });
  const written =
    (raw.days?.[0]?.notes?.length || 0) > 25
      ? trip
      : await writeUniqueProgramCopy(trip, intake.locale || "ar").catch(() => trip);

  return NextResponse.json({
    ok: true,
    warehouse: warehouseCityKey(trip.destination || intake.destination, trip.center.lat, trip.center.lng),
    trip: written,
    quote: quote
      ? {
          warnings: quote.warnings,
          flightHref: quote.flightHref,
          hotelsHref: quote.hotelsHref,
          transferHref: quote.transferHref,
        }
      : null,
  });
}
