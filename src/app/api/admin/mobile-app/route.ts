import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getMobileAppBuildStatus,
  getMobileAppStudioSettings,
  saveMobileAppStudioSettings,
} from "@/lib/server/mobile-app-studio-store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const [settings, build] = await Promise.all([
    getMobileAppStudioSettings(),
    getMobileAppBuildStatus(),
  ]);
  return NextResponse.json({ ok: true, settings, build, iosNote: "ipa_requires_macos" });
}

export async function PUT(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const settings = await saveMobileAppStudioSettings(body);
  return NextResponse.json({ ok: true, settings });
}
