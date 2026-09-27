import { NextResponse } from "next/server";
import { listMergedTours } from "@/lib/server/tours-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const tours = (await listMergedTours()).filter((t) => t.isActive !== false);
  return NextResponse.json(
    { ok: true, tours },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
