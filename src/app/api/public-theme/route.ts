import { NextResponse } from "next/server";
import { getBrandTheme } from "@/lib/server/brand-theme-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { ok: true, theme: await getBrandTheme() },
    { headers: { "Cache-Control": "no-store, must-revalidate" } }
  );
}
