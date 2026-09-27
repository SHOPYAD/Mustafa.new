// src/app/api/transfers/driver/catalog/enriched/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get("supplierId") || req.headers.get("x-supplier-id") || undefined;

    const classes = transferStore.getVehicleClasses(true);
    const zones = transferStore.getZones(undefined, undefined, true);
    const routes = transferStore.getRoutes(undefined, undefined, undefined, true);
    const tours = transferStore.getTours(undefined, undefined, true);

    // If supplierId is provided, get the driver's registered vehicles to flag inFleet
    let supplierVehicleClassIds = new Set<string>();
    if (supplierId) {
      try {
        const myVehicles = transferStore.getVehicles(supplierId);
        supplierVehicleClassIds = new Set(myVehicles.map((v) => v.vehicleClassId));
      } catch (_) {}
    }

    const formattedClasses = classes.map((c) => ({
      id: c.id,
      _id: c.id,
      code: c.code,
      name: c.name,
      description: c.description,
      exampleModels: c.exampleModels,
      images: c.images,
      capacity: c.capacity,
      amenities: c.amenities,
      tier: c.tier,
      inFleet: supplierVehicleClassIds.has(c.id),
    }));

    const formattedTours = tours.map((t) => ({
      id: t.id,
      _id: t.id,
      slug: t.slug,
      title: t.title,
      description: t.description,
      hubCity: t.hubCity,
      category: t.category,
      durationHours: t.durationHours,
      suggestedPricing: t.suggestedPricing,
      itinerary: t.itinerary,
      highlights: t.highlights,
      coverImage: t.coverImage,
      gallery: t.gallery,
    }));

    return NextResponse.json({
      ok: true,
      catalog: {
        vehicleClasses: formattedClasses,
        tours: formattedTours,
        zones,
        routes,
      },
      vehicleClasses: formattedClasses,
      tours: formattedTours,
      zones,
      routes,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
