import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getMobileAppBuildStatus,
  getMobileAppStudioSettings,
  saveMobileAppStudioSettings,
} from "@/lib/server/mobile-app-studio-store";
import { isOrigin } from "@/lib/server/deployment-role";
import { getPwaSettings, savePwaSettings } from "@/lib/server/pwa-store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const [settings, build, pwaSettings] = await Promise.all([
    getMobileAppStudioSettings(),
    getMobileAppBuildStatus(),
    getPwaSettings().catch(() => null),
  ]);

  // Full Ownership (التملك الكامل) is active for origin master site and client copies with ownership plan
  const isFullOwnership = isOrigin();

  return NextResponse.json({
    ok: true,
    settings,
    build,
    pwaSettings,
    isFullOwnership,
    planType: isFullOwnership ? "ownership" : "whitelabel_free",
    iosNote: "ipa_requires_macos",
  });
}

export async function PUT(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

  if (typeof body.pwaBannerEnabled === "boolean") {
    await savePwaSettings({ showBanner: body.pwaBannerEnabled }).catch(() => null);
  }

  const settings = await saveMobileAppStudioSettings(body);
  const pwaSettings = await getPwaSettings().catch(() => null);

  return NextResponse.json({ ok: true, settings, pwaSettings });
}
