import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getAirportsMeta,
  runAirportsImport,
  searchLocalAirports,
} from "@/lib/server/airports-db";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const query = (req.nextUrl.searchParams.get("query") || "").trim();
  const locale = req.nextUrl.searchParams.get("locale") || "ar";
  const meta = await getAirportsMeta();
  const trial = query.length >= 2 ? await searchLocalAirports(query, locale) : [];

  return NextResponse.json({
    ok: true,
    meta,
    trial,
  });
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const meta = await runAirportsImport();
    return NextResponse.json({ ok: true, meta });
  } catch {
    return NextResponse.json({ ok: false, error: "تعذر استيراد قاعدة المطارات" }, { status: 500 });
  }
}
