import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { connectionStatus, resolveAdsCredentials } from "@/lib/ads/config";
import { listSocialDashboard } from "@/lib/social/accounts";
import { getCommsSettings, publicCommsSettings } from "@/lib/automation/comms-settings";
import { getServerEnvMap } from "@/lib/server/env-store";
import { resolveGeminiApiKey } from "@/lib/server/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const [social, creds, comms, mediaMap, gemini] = await Promise.all([
    listSocialDashboard(req),
    resolveAdsCredentials(),
    getCommsSettings(),
    getServerEnvMap(["PEXELS_API_KEY", "UNSPLASH_ACCESS_KEY"]),
    resolveGeminiApiKey(),
  ]);
  const ads = connectionStatus(creds);
  const pub = publicCommsSettings(comms);
  return NextResponse.json({
    ok: true,
    accounts: social.accounts,
    credentials: social.credentials,
    ads: {
      googleLive: ads.googleLive,
      metaLive: ads.metaLive,
      googleOAuth: ads.googleOAuth,
      metaOAuth: ads.metaOAuth,
      missingGoogle: ads.missingGoogle,
      missingMeta: ads.missingMeta,
      dryRun: !ads.googleLive && !ads.metaLive,
      settingsUrl: "/admin/ads",
    },
    comms: {
      whatsappReady: pub.whatsappReady,
      telegramReady: pub.telegramReady,
    },
    media: {
      pexelsConfigured: Boolean(mediaMap.PEXELS_API_KEY),
      unsplashConfigured: Boolean(mediaMap.UNSPLASH_ACCESS_KEY),
      settingsUrl: "/admin/media",
    },
    providers: {
      geminiConfigured: Boolean(gemini.apiKey),
      geminiSettingsUrl: "/admin/gemini",
    },
  });
}
