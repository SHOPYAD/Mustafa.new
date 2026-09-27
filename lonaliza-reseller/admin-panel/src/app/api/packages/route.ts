import { NextResponse } from "next/server";
import { listPublicPackages } from "@/lib/server/packages-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const packages = await listPublicPackages();
  return NextResponse.json(
    { ok: true, packages },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
