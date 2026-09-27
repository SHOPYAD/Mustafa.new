import { NextResponse } from "next/server";
import { getMobileAppStudioSettings } from "@/lib/server/mobile-app-studio-store";

export const runtime = "nodejs";

/**
 * Public Mobile App Live Configuration Endpoint
 * Serves dynamic bottom navigation tabs, marketing splash slides, and branding tokens
 * directly to the Flutter native shell on startup.
 */
export async function GET() {
  try {
    const settings = await getMobileAppStudioSettings();
    return NextResponse.json({
      ok: true,
      bottomNavTabs: settings.bottomNavTabs || [],
      splashSlides: settings.splashSlides || [],
      bottomNavBg: settings.bottomNavBg || "#ffffff",
      bottomNavActiveColor: settings.bottomNavActiveColor || "#2E1065",
      bottomNavInactiveColor: settings.bottomNavInactiveColor || "#64748B",
      branding: {
        displayNameAr: settings.displayNameAr || "لوناليزا",
        royalPurple: settings.royalPurple || "#2E1065",
        amberColor: settings.amberColor || "#F59E0B",
        primaryColor: settings.primaryColor || "#7C3AED",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "internal_error" },
      { status: 500 }
    );
  }
}
