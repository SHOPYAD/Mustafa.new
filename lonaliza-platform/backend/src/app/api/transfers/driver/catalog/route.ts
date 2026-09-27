// src/app/api/transfers/driver/catalog/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const classes = transferStore.getVehicleClasses();
    return NextResponse.json({
      ok: true,
      catalog: classes.map((c) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        description: c.description,
        exampleModels: c.exampleModels,
        images: c.images,
        capacity: c.capacity,
        amenities: c.amenities,
        tier: c.tier,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
