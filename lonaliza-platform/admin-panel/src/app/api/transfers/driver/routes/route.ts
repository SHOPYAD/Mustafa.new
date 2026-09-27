// src/app/api/transfers/driver/routes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fromZoneId = searchParams.get("fromZoneId") || undefined;
    const toZoneId = searchParams.get("toZoneId") || undefined;
    const vehicleClassId = searchParams.get("vehicleClassId") || undefined;
    const requestedCity = searchParams.get("city")?.toLowerCase().trim() || undefined;

    const rawList = transferStore.getRoutes(fromZoneId, toZoneId, vehicleClassId, true);
    const zones = transferStore.getZones(undefined, undefined, true);
    const vehicleClasses = transferStore.getVehicleClasses(true);

    const enrichedList = rawList
      .map((r) => {
        const fromZone = zones.find((z) => z.id === r.fromZoneId || z.code === r.fromZoneId);
        const toZone = zones.find((z) => z.id === r.toZoneId || z.code === r.toZoneId);
        const vClass = vehicleClasses.find((vc) => vc.id === r.vehicleClassId || vc.code === r.vehicleClassId);

        // Normalize city identifier
        let city = (r as any).city || (r as any).region;
        if (!city) {
          if (fromZone?.region) city = fromZone.region;
          else if (fromZone?.city) city = fromZone.city.toLowerCase();
          else if (toZone?.region) city = toZone.region;
          else if (toZone?.city) city = toZone.city.toLowerCase();
          else city = "istanbul";
        }
        city = city.toLowerCase();

        return {
          ...r,
          _id: r.id,
          city,
          fromZone: fromZone || null,
          fromZoneName: fromZone ? fromZone.name : { ar: r.fromZoneId, en: r.fromZoneId },
          toZone: toZone || null,
          toZoneName: toZone ? toZone.name : { ar: r.toZoneId, en: r.toZoneId },
          vehicleClass: vClass || null,
        };
      })
      .filter((r) => {
        if (!requestedCity || requestedCity === "all" || requestedCity === "الكل") return true;
        return r.city === requestedCity || (r.fromZone as any)?.region === requestedCity;
      });

    return NextResponse.json({
      ok: true,
      routes: enrichedList,
      list: enrichedList,
      count: enrichedList.length,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supplierId = body.supplierId || req.headers.get("x-supplier-id") || "sup-lonaliza-official";
    const {
      fromZoneId,
      toZoneId,
      fromZoneName,
      toZoneName,
      city = "istanbul",
      vehicleClassId = "vc-vito-vip",
      basePrice,
      currency = "USD",
      direction = "both",
      estimatedDistanceKm,
      estimatedDurationMinutes,
      returnDiscountPercent = 10,
      nightSurcharge,
    } = body;

    if (!fromZoneId || !toZoneId) {
      return NextResponse.json(
        { ok: false, error: "نقطة الانطلاق والوجهة مطلوبتان" },
        { status: 400 }
      );
    }

    const priceNum = Number(basePrice) || 65;

    // 1. Check De-duplication: Does this route already exist globally?
    const existingRoute = transferStore.findRouteByZones(fromZoneId, toZoneId, vehicleClassId);

    if (existingRoute) {
      // Route already exists! Do NOT duplicate it. Link supplier pricing directly.
      if (supplierId) {
        transferStore.saveSupplierRoutePricing({
          supplierId,
          routeId: existingRoute.id,
          vehicleClassId,
          basePrice: priceNum,
          currency,
          isActive: true,
        });
      }

      return NextResponse.json({
        ok: true,
        isExisting: true,
        route: existingRoute,
        message: "هذا المسار موجود مسبقاً في المنصة، وتم ربط وتثبيت تسعير شركتكم الخاص به بنجاح دون تكرار.",
      });
    }

    // Auto-register zones if missing
    const existingZones = transferStore.getZones();
    if (!existingZones.some((z) => z.id === fromZoneId || z.code === fromZoneId)) {
      const arName = fromZoneName || fromZoneId.replace(/^zone-/, "").replace(/_/g, " ");
      transferStore.saveZone({
        id: fromZoneId,
        code: fromZoneId.toUpperCase().replace(/[^A-Z0-9]/g, "_").slice(0, 20),
        name: { ar: arName, en: arName, tr: arName },
        city,
        region: city,
        country: "Turkey",
        kind: fromZoneId.includes("airport") ? "airport" : "district",
        center: { lat: 41.0, lng: 29.0 },
        radiusKm: 10,
        isActive: true,
      });
    }

    if (!existingZones.some((z) => z.id === toZoneId || z.code === toZoneId)) {
      const arName = toZoneName || toZoneId.replace(/^zone-/, "").replace(/_/g, " ");
      transferStore.saveZone({
        id: toZoneId,
        code: toZoneId.toUpperCase().replace(/[^A-Z0-9]/g, "_").slice(0, 20),
        name: { ar: arName, en: arName, tr: arName },
        city,
        region: city,
        country: "Turkey",
        kind: toZoneId.includes("airport") ? "airport" : "district",
        center: { lat: 41.0, lng: 29.0 },
        radiusKm: 10,
        isActive: true,
      });
    }

    // 2. Route is new: Create it in global matrix
    const newRoute = transferStore.saveRoute({
      fromZoneId,
      toZoneId,
      vehicleClassId,
      direction,
      basePrice: priceNum,
      currency,
      city,
      returnDiscountPercent: Number(returnDiscountPercent) || 10,
      nightSurcharge: nightSurcharge || { startHour: 23, endHour: 6, amount: 10, percent: 0 },
      estimatedDistanceKm: Number(estimatedDistanceKm) || 40,
      estimatedDurationMinutes: Number(estimatedDurationMinutes) || 45,
      supplierNet: Math.round(priceNum * 0.85),
      isActive: true,
    });

    // Save supplier pricing for new route
    if (supplierId) {
      transferStore.saveSupplierRoutePricing({
        supplierId,
        routeId: newRoute.id,
        vehicleClassId,
        basePrice: priceNum,
        currency,
        isActive: true,
      });
    }

    return NextResponse.json({
      ok: true,
      isExisting: false,
      route: newRoute,
      message: "تم إنشاء المسار بنجاح وتثبيت تسعير شركتكم ونشره في المنصة.",
    });
  } catch (err: any) {
    console.error("Driver route creation error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

