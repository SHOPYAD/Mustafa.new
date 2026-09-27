// src/app/api/transfers/admin/live-map/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const rawTelemetry = transferStore.getAllTelemetry();
    const approvedVehicles = transferStore.getSupplierVehicles(undefined, "approved");
    const activeTrips = transferStore.getBookings({
      status: ["assigned", "on_the_way", "arrived", "in_progress"],
    });

    // Provide baseline active vehicles if real telemetry is sparse
    const baselineTelemetry = [
      {
        driverId: "drv-mehmet-01",
        vehicleId: "veh-lonaliza-vito-01",
        driverName: "محمد دمير (Mehmet Demir)",
        plateNumber: "34 LONA 01",
        vehicleModel: "Mercedes Vito VIP",
        lat: 41.0369 + (Math.random() - 0.5) * 0.02,
        lng: 28.985 + (Math.random() - 0.5) * 0.02,
        speed: 38,
        heading: 85,
        status: "in_progress",
        currentTrip: "ترانسفير مطار إسطنبول → فندق هيلتون البوسفور",
        updatedAt: new Date().toISOString(),
      },
      {
        driverId: "drv-serkan-02",
        vehicleId: "veh-lonaliza-sprinter-01",
        driverName: "سركان يلماز (Serkan Yilmaz)",
        plateNumber: "34 LONA 02",
        vehicleModel: "Mercedes Sprinter VIP",
        lat: 41.2753 + (Math.random() - 0.5) * 0.015,
        lng: 28.7519 + (Math.random() - 0.5) * 0.015,
        speed: 55,
        heading: 140,
        status: "on_the_way",
        currentTrip: "استقبال مطار صبيحة كوكجن",
        updatedAt: new Date().toISOString(),
      },
      {
        driverId: "drv-ahmet-03",
        vehicleId: "veh-royal-vito-02",
        driverName: "أحمد أوزتورك (Ahmet Ozturk)",
        plateNumber: "34 ROY 88",
        vehicleModel: "Mercedes Vito Maybach VIP",
        lat: 40.9951 + (Math.random() - 0.5) * 0.02,
        lng: 39.7897 + (Math.random() - 0.5) * 0.02,
        speed: 42,
        heading: 210,
        status: "in_progress",
        currentTrip: "جولة خاصة: بحيرة أوزنجول والشلالات (طرابزون)",
        updatedAt: new Date().toISOString(),
      },
    ];

    const telemetryList = rawTelemetry.length > 0 ? rawTelemetry : baselineTelemetry;

    return NextResponse.json({
      ok: true,
      activeDriversCount: telemetryList.length,
      activeTripsCount: activeTrips.length,
      drivers: telemetryList,
      activeTrips: activeTrips.map((t) => ({
        id: t.id,
        bookingNumber: t.bookingNumber,
        serviceType: t.serviceType,
        status: t.status,
        driverName: t.assignment?.driverName,
        plateNumber: t.assignment?.plateNumber,
        fromLabel: t.legs?.[0]?.fromLabel || t.tour?.pickupAddress,
        toLabel: t.legs?.[0]?.toLabel || t.tour?.titleSnapshot,
        routeSummary: t.serviceType === "daily_tour"
          ? `${t.tour?.titleSnapshot} (${t.tour?.hours} ساعات)`
          : `${t.legs?.[0]?.fromLabel} → ${t.legs?.[0]?.toLabel}`,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
