import { NextResponse } from "next/server";
import { getMobileAppStudioSettings } from "@/lib/server/mobile-app-studio-store";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const settings = await getMobileAppStudioSettings();
    const googlePlayUrl = settings.googlePlayUrl || "";
    const appStoreUrl = settings.appStoreUrl || "";

    // Default fallback demo links if not yet configured
    const effectiveGoogleUrl = googlePlayUrl || "https://play.google.com/store/apps/details?id=com.lonaliza.app";
    const effectiveAppleUrl = appStoreUrl || "https://apps.apple.com/app/id6740000000";

    const [googlePlayQr, appStoreQr] = await Promise.all([
      QRCode.toDataURL(effectiveGoogleUrl, {
        margin: 1,
        width: 180,
        color: {
          dark: "#2e1065",
          light: "#ffffff",
        },
      }).catch(() => ""),
      QRCode.toDataURL(effectiveAppleUrl, {
        margin: 1,
        width: 180,
        color: {
          dark: "#2e1065",
          light: "#ffffff",
        },
      }).catch(() => ""),
    ]);

    return NextResponse.json({
      ok: true,
      googlePlayUrl: effectiveGoogleUrl,
      appStoreUrl: effectiveAppleUrl,
      hasCustomGoogleUrl: Boolean(googlePlayUrl),
      hasCustomAppleUrl: Boolean(appStoreUrl),
      googlePlayQr,
      appStoreQr,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to load app links" },
      { status: 500 }
    );
  }
}
