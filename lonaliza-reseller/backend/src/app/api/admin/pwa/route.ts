import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getPwaSettings,
  resetPwaSettings,
  savePwaSettings,
} from "@/lib/server/pwa-store";
import type { PwaPatch } from "@/data/pwa";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const settings = await getPwaSettings();
  return NextResponse.json({ ok: true, settings });
}

export async function PUT(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as PwaPatch & { reset?: boolean };
    const settings = body.reset
      ? await resetPwaSettings()
      : await savePwaSettings(body);
    return NextResponse.json({ ok: true, settings });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Save failed" },
      { status: 400 }
    );
  }
}
