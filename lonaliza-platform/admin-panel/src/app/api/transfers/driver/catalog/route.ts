// src/app/api/transfers/driver/catalog/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const classes = transferStore.getVehicleClasses(true);
    const zones = transferStore.getZones(undefined, undefined, true);
    const routes = transferStore.getRoutes(undefined, undefined, undefined, true);
    const tours = transferStore.getTours(undefined, undefined, true);

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
