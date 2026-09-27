import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { resolveAdsCredentials } from "@/lib/ads/config";
import { buildGoogleAdsAuthUrl, GOOGLE_OAUTH_COOKIE, oauthCookieHeader } from "@/lib/ads/google/oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const creds = await resolveAdsCredentials();
  if (!creds.googleClientId || !creds.googleClientSecret) {
    return NextResponse.json(
      { ok: false, error: "أدخل GOOGLE_ADS_CLIENT_ID و GOOGLE_ADS_CLIENT_SECRET أولاً" },
      { status: 400 }
    );
  }
  const { url, state } = await buildGoogleAdsAuthUrl(creds.googleClientId);
  const res = NextResponse.redirect(url, 302);
  res.headers.append("Set-Cookie", oauthCookieHeader(GOOGLE_OAUTH_COOKIE, state));
  return res;
}
