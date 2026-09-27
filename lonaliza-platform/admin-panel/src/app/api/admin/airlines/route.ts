import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getAirlinesMeta,
  runAirlinesImport,
  searchAirlines,
} from "@/lib/server/airlines-db";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const query = (req.nextUrl.searchParams.get("query") || "").trim();
  const meta = await getAirlinesMeta();
  const trial = query.length >= 1 ? await searchAirlines(query, 30) : [];

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
    const meta = await runAirlinesImport();
    return NextResponse.json({ ok: true, meta });
  } catch {
    return NextResponse.json({ ok: false, error: "تعذر استيراد شعارات شركات الطيران" }, { status: 500 });
  }
}
