// src/app/api/transfers/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  calculateTransferOffers,
  calculateDailyTourOffers,
} from "@/lib/transfers/pricingEngine";
import { transferStore } from "@/lib/transfers/storage";
import type { TransferPaymentMode } from "@/lib/transfers/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handleSearch(req);
}

export async function POST(req: NextRequest) {
  return handleSearch(req);
}

async function handleSearch(req: NextRequest) {
  try {
    let body: any = {};
    if (req.method === "POST") {
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    }

    const { searchParams } = new URL(req.url);

    const mode = body.mode || searchParams.get("mode") || "transfer"; // "transfer" | "daily_tour" | "hourly"
    const fromZoneId = body.fromZoneId || searchParams.get("fromZoneId") || searchParams.get("from") || undefined;
    const toZoneId = body.toZoneId || searchParams.get("toZoneId") || searchParams.get("to") || undefined;
    const fromLat = body.fromLat ? Number(body.fromLat) : searchParams.get("fromLat") ? Number(searchParams.get("fromLat")) : undefined;
    const fromLng = body.fromLng ? Number(body.fromLng) : searchParams.get("fromLng") ? Number(searchParams.get("fromLng")) : undefined;
    const toLat = body.toLat ? Number(body.toLat) : searchParams.get("toLat") ? Number(searchParams.get("toLat")) : undefined;
    const toLng = body.toLng ? Number(body.toLng) : searchParams.get("toLng") ? Number(searchParams.get("toLng")) : undefined;

    const scheduledAt = body.scheduledAt || searchParams.get("scheduledAt") || searchParams.get("date") || undefined;
    const tripType = (body.tripType || searchParams.get("tripType") || "oneway") as "oneway" | "roundtrip";
    const paymentMode = (body.paymentMode || searchParams.get("paymentMode") || "online_full") as TransferPaymentMode;
    const hours = body.hours ? Number(body.hours) : searchParams.get("hours") ? Number(searchParams.get("hours")) : 8;
    const hubCity = body.hubCity || searchParams.get("hubCity") || body.city || searchParams.get("city") || "Istanbul";
    const tourId = body.tourId || searchParams.get("tourId") || undefined;

    const adults = Number(body.adults || searchParams.get("adults") || searchParams.get("pax") || 2);
    const children = Number(body.children || searchParams.get("children") || 0);
    const infants = Number(body.infants || searchParams.get("infants") || 0);
    const luggageLarge = Number(body.luggageLarge || searchParams.get("luggage") || 2);
    const luggageSmall = Number(body.luggageSmall || searchParams.get("luggageSmall") || 2);

    const sortBy = (body.sortBy || searchParams.get("sortBy") || searchParams.get("sort") || "cheapest") as "cheapest" | "rating" | "popular";

    const fromCoords = fromLat && fromLng ? { lat: fromLat, lng: fromLng } : undefined;
    const toCoords = toLat && toLng ? { lat: toLat, lng: toLng } : undefined;

    const settings = transferStore.getSettings();

    if (mode === "daily_tour" || mode === "hourly") {
      // Daily Tour calculation
      const tourOffers = calculateDailyTourOffers({
        tourIdOrSlug: tourId,
        hubCity,
        hours,
        paymentMode,
        sortBy,
      });

      return NextResponse.json({
        ok: true,
        mode: "daily_tour",
        hours,
        hubCity,
        sortBy,
        paymentDiscounts: {
          onlineFullPercent: settings.onlineFullDiscountPercent,
          depositPercent: settings.depositDiscountPercent,
        },
        offers: tourOffers.map((o) => ({
          offerId: o.offerId,
          vehicleClassId: o.vehicleClass.id,
          vehicleClassCode: o.vehicleClass.code,
          vehicleClassName: o.vehicleClass.name,
          vehicleTier: o.vehicleClass.tier,
          capacity: o.vehicleClass.capacity,
          amenities: o.vehicleClass.amenities,
          images: o.matchedVehicle?.images || o.vehicleClass.images.map((i) => i.url),
          cleanlinessRating: o.matchedVehicle?.cleanlinessRating || 99,
          driver: o.matchedVehicle?.driver,
          supplier: o.supplier,
          plateNumber: o.matchedVehicle?.plateNumber,
          tourTitle: o.tourTitle,
          hours: o.hours,
          pricing: {
            basePrice: o.basePrice,
            extraHoursPrice: o.extraHoursPrice,
            paymentDiscountAmount: o.paymentModeDiscountAmount,
            finalTotal: o.finalTotal,
            depositAmount: o.depositAmount,
            remainingCashOnArrival: o.remainingCashOnArrival,
            currency: o.currency,
            paymentMode: o.paymentMode,
          },
        })),
      });
    }

    // Point-to-Point Transfer calculation
    const transferOffers = calculateTransferOffers({
      fromZoneId,
      toZoneId,
      fromCoords,
      toCoords,
      scheduledAt,
      tripType,
      paymentMode,
      sortBy,
      passengers: { adults, children, infants },
      luggage: { large: luggageLarge, small: luggageSmall },
    });

    return NextResponse.json({
      ok: true,
      mode: "transfer",
      tripType,
      sortBy,
      distanceKm: transferOffers[0]?.distanceKm || 40,
      durationMinutes: transferOffers[0]?.durationMinutes || 45,
      paymentDiscounts: {
        onlineFullPercent: settings.onlineFullDiscountPercent,
        depositPercent: settings.depositDiscountPercent,
      },
      offers: transferOffers.map((o) => ({
        offerId: o.offerId,
        vehicleClassId: o.vehicleClass.id,
        vehicleClassCode: o.vehicleClass.code,
        vehicleClassName: o.vehicleClass.name,
        vehicleTier: o.vehicleClass.tier,
        capacity: o.vehicleClass.capacity,
        amenities: o.vehicleClass.amenities,
        images: o.matchedVehicle?.images || o.vehicleClass.images.map((i) => i.url),
        cleanlinessRating: o.matchedVehicle?.cleanlinessRating || 99,
        driver: o.matchedVehicle?.driver,
        supplier: o.supplier,
        plateNumber: o.matchedVehicle?.plateNumber,
        distanceKm: o.distanceKm,
        durationMinutes: o.durationMinutes,
        isExactRouteMatched: o.isExactRouteMatched,
        pricing: {
          basePrice: o.basePrice,
          nightSurcharge: o.nightSurchargeAmount,
          roundtripDiscount: o.roundtripDiscountAmount,
          paymentDiscountAmount: o.paymentModeDiscountAmount,
          finalTotal: o.finalTotal,
          depositAmount: o.depositAmount,
          remainingCashOnArrival: o.remainingCashOnArrival,
          currency: o.currency,
          paymentMode: o.paymentMode,
        },
      })),
    });
  } catch (err: any) {
    console.error("[TransfersSearchAPI Error]:", err);
    return NextResponse.json({ ok: false, error: err.message || "Failed to search transfers", offers: [] }, { status: 500 });
  }
}
