// src/app/api/transfers/locations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("query") || searchParams.get("q") || "").trim().toLowerCase();
    const city = searchParams.get("city") || undefined;
    const kind = searchParams.get("kind") || undefined;

    let zones = transferStore.getZones(city, kind);

    if (query) {
      zones = zones.filter((z) => {
        const ar = z.name.ar.toLowerCase();
        const en = z.name.en.toLowerCase();
        const tr = z.name.tr.toLowerCase();
        const code = (z.airportCode || z.code).toLowerCase();
        const cityName = z.city.toLowerCase();

        return (
          ar.includes(query) ||
          en.includes(query) ||
          tr.includes(query) ||
          code.includes(query) ||
          cityName.includes(query)
        );
      });
    }

    return NextResponse.json({
      ok: true,
      total: zones.length,
      zones: zones.map((z) => ({
        id: z.id,
        code: z.code,
        name: z.name,
        city: z.city,
        kind: z.kind,
        airportCode: z.airportCode,
        center: z.center,
        radiusKm: z.radiusKm,
        displayName: z.airportCode ? `${z.name.ar} (${z.airportCode})` : z.name.ar,
      })),
    });
  } catch (err: any) {
    console.error("[TransfersLocationsAPI Error]:", err);
    return NextResponse.json({ ok: false, error: err.message, zones: [] }, { status: 500 });
  }
}
