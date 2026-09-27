import { NextRequest, NextResponse } from "next/server";
import { lookupAirline } from "@/lib/server/airlines-db";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const name = req.nextUrl.searchParams.get("name");
  const hit = await lookupAirline(code, name);
  if (!hit) {
    return NextResponse.json({ ok: true, airline: null });
  }
  return NextResponse.json({
    ok: true,
    airline: {
      iata: hit.iata,
      icao: hit.icao,
      name: hit.name,
      logoUrl: hit.logoUrl,
    },
  });
}
