import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      service: "lonaliza-admin",
      ts: new Date().toISOString(),
      uptimeSec: Math.floor(process.uptime()),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
