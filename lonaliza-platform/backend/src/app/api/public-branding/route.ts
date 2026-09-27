import { NextResponse } from "next/server";
import { getBranding } from "@/lib/server/branding-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { ok: true, branding: await getBranding() },
    { headers: { "Cache-Control": "no-store, must-revalidate" } }
  );
}
