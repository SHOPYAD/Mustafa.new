import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { resolveAdsCredentials } from "@/lib/ads/config";
import { buildMetaAdsAuthUrl, META_OAUTH_COOKIE, oauthCookieHeader } from "@/lib/ads/meta/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const creds = await resolveAdsCredentials();
  if (!creds.metaAppId || !creds.metaAppSecret) {
    return NextResponse.json(
      { ok: false, error: "أدخل META_ADS_APP_ID و META_ADS_APP_SECRET أولاً" },
      { status: 400 }
    );
  }
  const { url, state } = await buildMetaAdsAuthUrl(creds.metaAppId);
  const res = NextResponse.redirect(url, 302);
  res.headers.append("Set-Cookie", oauthCookieHeader(META_OAUTH_COOKIE, state));
  return res;
}
