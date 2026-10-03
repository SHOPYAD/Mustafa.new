import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const payload = {
    ok: true,
    service: "lonaliza-storefront",
    ts: new Date().toISOString(),
    uptimeSec: Math.floor(process.uptime()),
  };
  return NextResponse.json(payload, {
    headers: { "Cache-Control": "no-store" },
  });
}
