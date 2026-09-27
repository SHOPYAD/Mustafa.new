// src/app/api/transfers/driver/live-map/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get("supplierId");

    if (!supplierId) {
      return NextResponse.json({ ok: false, message: "معرف الشريك مطلوب" }, { status: 400 });
    }

    const supplier = transferStore.getSupplierById(supplierId);
    if (!supplier) {
      return NextResponse.json({ ok: false, message: "لم يتم العثور على الشريك" }, { status: 404 });
    }

    // Get strictly this supplier's vehicles & drivers (tenant isolation)
    const supplierVehicles = transferStore.getSupplierVehicles(supplierId, undefined, true);
    const supplierDrivers = transferStore.getDrivers(supplierId);
    const activeBookings = transferStore.getBookings({
      supplierId,
      status: ["assigned", "on_the_way", "arrived", "in_progress"],
    });

    // Match with recorded telemetry or synthesize active coordinates for supplier's real vehicles
    const allTelemetry = transferStore.getAllTelemetry();

    // Default center by hub city
    const hub = (supplier.hubCity || "istanbul").toLowerCase();
    const centerCoords =
      hub.includes("trabzon") || hub.includes("طرابزون")
        ? { lat: 40.995, lng: 39.789 }
        : hub.includes("antalya") || hub.includes("أنطاليا")
        ? { lat: 36.896, lng: 30.713 }
        : { lat: 41.015, lng: 28.979 }; // Istanbul

    const liveVehicles = supplierVehicles.map((veh, idx) => {
      const matchTele = allTelemetry.find((t) => t.vehicleId === veh.id);
      const assignedDriver = supplierDrivers.find((d) => d.assignedVehicleId === veh.id) || supplierDrivers[idx % Math.max(supplierDrivers.length, 1)];
      const activeTrip = activeBookings.find((b) => b.vehicleId === veh.id || b.driverId === assignedDriver?.id);

      // Stable offset around center for interactive display
      const latOffset = ((idx * 0.023 + 0.01) % 0.08) - 0.04;
      const lngOffset = ((idx * 0.031 + 0.015) % 0.09) - 0.045;

      const currentStatus = activeTrip
        ? activeTrip.status === "in_progress"
          ? "in_progress"
          : "on_the_way"
        : idx % 2 === 0
        ? "available"
        : "in_progress";

      const missionName = activeTrip
        ? activeTrip.transferType === "hourly"
          ? `جولة سياحية بالساعات (${activeTrip.hours || 10} ساعات)`
          : `ترانسفير: ${activeTrip.pickupLocation || "المطار"} → ${activeTrip.dropoffLocation || "الفندق"}`
        : idx % 2 === 0
        ? "متصل ومتاح للرحلات"
        : "جولة خاصة: معالم المدينة والبسفور";

      return {
        vehicleId: veh.id,
        plateNumber: veh.plateNumber || `34 LONA ${idx + 10}`,
        vehicleModel: veh.make && veh.model ? `${veh.make} ${veh.model}` : veh.vehicleClassName || "Mercedes Vito VIP",
        vehicleClass: veh.vehicleClassCode || "vito_vip",
        year: veh.year || 2024,
        photoUrl: veh.ownImages?.[0] || veh.coverImage || "/providers/vito_vip.jpg",
        driverId: assignedDriver?.id || `drv-${idx + 1}`,
        driverName: assignedDriver?.fullName || `كابتن ${supplier.tradeName || "الأسطول"} (${idx + 1})`,
        driverPhone: assignedDriver?.phone || supplier.contactPhone || "+90 555 000 0000",
        driverPhoto: assignedDriver?.photoUrl || null,
        lat: matchTele?.lat ?? centerCoords.lat + latOffset,
        lng: matchTele?.lng ?? centerCoords.lng + lngOffset,
        speed: matchTele?.speed ?? (currentStatus === "in_progress" ? 48 : currentStatus === "on_the_way" ? 55 : 0),
        heading: matchTele?.heading ?? (idx * 65) % 360,
        batteryPct: matchTele?.batteryPct ?? (85 - idx * 5),
        status: currentStatus,
        currentMission: missionName,
        tripPrice: activeTrip?.price ? `$${activeTrip.price}` : "$120",
        passengerName: activeTrip?.passengerName || "VIP Guest",
        passengerCount: activeTrip?.passengers || veh.passengerCapacity || 6,
        updatedAt: matchTele?.updatedAt || new Date().toISOString(),
      };
    });

    return NextResponse.json({
      ok: true,
      supplierId,
      companyName: supplier.tradeName || supplier.legalName,
      center: centerCoords,
      activeVehiclesCount: liveVehicles.length,
      vehicles: liveVehicles,
      activeTrips: activeBookings,
    });
  } catch (err: any) {
    console.error("Driver live-map error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
