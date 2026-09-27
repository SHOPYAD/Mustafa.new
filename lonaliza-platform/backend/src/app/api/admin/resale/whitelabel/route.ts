import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getWhiteLabelSettings,
  saveWhiteLabelSettings,
  type WhiteLabelSettings,
} from "@/lib/server/reseller-whitelabel-store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const settings = await getWhiteLabelSettings();
  return NextResponse.json({ ok: true, settings });
}

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as Partial<WhiteLabelSettings>;
    const saved = await saveWhiteLabelSettings(body);
    return NextResponse.json({ ok: true, settings: saved });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save settings";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  return POST(req);
}
