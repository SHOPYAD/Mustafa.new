import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { listMergedTours, upsertTour } from "@/lib/server/tours-store";
import type { Tour } from "@/data/tours";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const tours = await listMergedTours();
  return NextResponse.json(
    { ok: true, tours },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as Partial<Tour> & Record<string, unknown>;
    const tour = await upsertTour(body);
    return NextResponse.json({ ok: true, tour });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Save failed" },
      { status: 500 }
    );
  }
}
