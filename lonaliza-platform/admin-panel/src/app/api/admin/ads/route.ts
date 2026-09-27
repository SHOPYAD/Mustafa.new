import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { connectionStatus, resolveAdsCredentials } from "@/lib/ads/config";
import { DEFAULT_ADS_GEOS } from "@/lib/ads/geos";
import { lastAdsReport } from "@/lib/ads/reports-telegram";
import {
  listCampaigns,
  loadAdsSettings,
  publicCredentials,
  saveAdsCredentials,
  saveAdsSettings,
} from "@/lib/ads/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const [creds, settings, campaigns, report] = await Promise.all([
    resolveAdsCredentials(),
    loadAdsSettings(),
    listCampaigns(),
    lastAdsReport(),
  ]);
  return NextResponse.json({
    ok: true,
    connection: connectionStatus(creds),
    credentials: publicCredentials(creds),
    settings,
    geos: DEFAULT_ADS_GEOS,
    campaigns: campaigns.slice(0, 40),
    lastReport: report,
    envKeys: {
      google: [
        "GOOGLE_ADS_DEVELOPER_TOKEN",
        "GOOGLE_ADS_CLIENT_ID",
        "GOOGLE_ADS_CLIENT_SECRET",
        "GOOGLE_ADS_REFRESH_TOKEN",
        "GOOGLE_ADS_CUSTOMER_ID",
        "GOOGLE_ADS_LOGIN_CUSTOMER_ID",
        "GOOGLE_ADS_YAML_PATH",
      ],
      meta: [
        "META_ADS_ACCESS_TOKEN",
        "META_ADS_AD_ACCOUNT_ID",
        "META_ADS_PAGE_ID",
        "META_ADS_APP_ID",
        "META_ADS_APP_SECRET",
        "META_ADS_PIXEL_ID",
      ],
      telegram: ["ADS_TELEGRAM_CHAT_ID", "TELEGRAM_BOT_TOKEN", "TELEGRAM_DEFAULT_CHAT_ID"],
    },
    note: "الفوترة على حساب المعلن في جوجل/ميتا. لا ن خزّن بطاقات ائتمان.",
  });
}

export async function PUT(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const credPatch = (body.credentials || {}) as Record<string, string>;
  const settingsPatch = (body.settings || body) as Record<string, unknown>;
  const [creds, settings] = await Promise.all([
    saveAdsCredentials({
      googleDeveloperToken: credPatch.googleDeveloperToken,
      googleClientId: credPatch.googleClientId,
      googleClientSecret: credPatch.googleClientSecret,
      googleRefreshToken: credPatch.googleRefreshToken,
      googleCustomerId: credPatch.googleCustomerId,
      googleLoginCustomerId: credPatch.googleLoginCustomerId,
      metaAccessToken: credPatch.metaAccessToken,
      metaAdAccountId: credPatch.metaAdAccountId,
      metaPageId: credPatch.metaPageId,
      metaAppId: credPatch.metaAppId,
      metaAppSecret: credPatch.metaAppSecret,
      metaPixelId: credPatch.metaPixelId,
    }),
    saveAdsSettings({
      defaultGeoCodes: Array.isArray(settingsPatch.defaultGeoCodes)
        ? settingsPatch.defaultGeoCodes.map(String)
        : undefined,
      telegramChatId:
        settingsPatch.telegramChatId === undefined
          ? undefined
          : String(settingsPatch.telegramChatId),
      currency:
        settingsPatch.currency === undefined ? undefined : String(settingsPatch.currency),
    }),
  ]);

  return NextResponse.json({
    ok: true,
    credentials: publicCredentials(creds),
    settings,
    connection: connectionStatus(await resolveAdsCredentials()),
  });
}
