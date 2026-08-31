import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { connectionStatus, resolveAdsCredentials } from "@/lib/ads/config";
import { listSocialDashboard } from "@/lib/social/accounts";
import { getCommsSettings, publicCommsSettings } from "@/lib/automation/comms-settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const [social, creds, comms] = await Promise.all([
    listSocialDashboard(req),
    resolveAdsCredentials(),
    getCommsSettings(),
  ]);
  const ads = connectionStatus(creds);
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
      whatsappReady: publicCommsSettings(comms).whatsappReady,
      telegramReady: publicCommsSettings(comms).telegramReady,
    },
  });
}
