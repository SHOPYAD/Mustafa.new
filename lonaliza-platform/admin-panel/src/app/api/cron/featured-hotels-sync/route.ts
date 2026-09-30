import { NextRequest, NextResponse } from "next/server";
import { getServerEnv } from "@/lib/server/env-store";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    const internalUrl = new URL("/api/admin/hotels/featured-sync", req.url);
    const res = await fetch(internalUrl.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-setup-secret": (await getServerEnv("ADMIN_SETUP_SECRET")).trim() },
      body: JSON.stringify({ action: "trigger_sync" }),
    });
    const data = await res.json();
    return NextResponse.json({ ok: true, trigger: "cron", result: data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
