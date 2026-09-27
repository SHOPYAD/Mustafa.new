import { NextResponse } from "next/server";
import { getMobileAppStudioSettings } from "@/lib/server/mobile-app-studio-store";
import { appEnabledKeys, getChannelServices } from "@/lib/server/channel-services-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const [studio, channels] = await Promise.all([
    getMobileAppStudioSettings(),
    getChannelServices(),
  ]);

  const enabledServiceKeys = new Set(appEnabledKeys(channels));

  // Filter sections: if a section is dedicated to a service that is disabled in the app channel, omit it
  const activeSections = studio.homeSections
    .filter((sec) => sec.enabled)
    .filter((sec) => {
      if (sec.id === "flight_deals" && !enabledServiceKeys.has("flight")) return false;
      if (sec.id === "featured_hotels" && !enabledServiceKeys.has("hotel")) return false;
      if (sec.id === "featured_cars" && !enabledServiceKeys.has("cars")) return false;
      if (sec.id === "packages_tours" && !enabledServiceKeys.has("holiday") && !enabledServiceKeys.has("tours")) return false;
      return true;
    })
    .sort((a, b) => a.order - b.order);

  return NextResponse.json(
    {
      ok: true,
      sections: activeSections,
      flashDeal: studio.flashDeal,
      branding: {
        nameAr: studio.displayNameAr,
        nameEn: studio.displayNameEn,
        primaryColor: studio.primaryColor,
        royalPurple: studio.royalPurple,
        amberColor: studio.amberColor,
        pageBg: studio.pageBg,
        logoUrl: studio.logoUrl,
        iconUrl: studio.iconUrl,
        sloganAr: studio.splashSloganAr,
        sloganEn: studio.splashSloganEn,
      },
    },
    {
      headers: { "Cache-Control": "no-store, must-revalidate" },
    }
  );
}
