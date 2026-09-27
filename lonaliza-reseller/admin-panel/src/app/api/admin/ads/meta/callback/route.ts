import { NextRequest, NextResponse } from "next/server";
import { readCookie } from "@/lib/server/admin-auth";
import { getServerEnv } from "@/lib/server/env-store";
import { resolveSitePublicUrl } from "@/lib/pocketbase/constants";
import { resolveAdsCredentials } from "@/lib/ads/config";
import { verifyOAuthState } from "@/lib/ads/google/oauth";
import { exchangeMetaAdsCode, fetchMetaAdAccounts, META_OAUTH_COOKIE } from "@/lib/ads/meta/oauth";
import { saveAdsCredentials } from "@/lib/ads/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const site = resolveSitePublicUrl(await getServerEnv("NEXT_PUBLIC_SITE_URL"));
  const fail = (reason: string) =>
    NextResponse.redirect(`${site}/admin/ads?oauth=meta&error=${encodeURIComponent(reason)}`, 302);

  const code = req.nextUrl.searchParams.get("code") || "";
  const state = req.nextUrl.searchParams.get("state") || "";
  const cookie = readCookie(req, META_OAUTH_COOKIE) || "";
  if (!code || !(await verifyOAuthState(state, cookie))) {
    return fail("state");
  }

  const creds = await resolveAdsCredentials();
  if (!creds.metaAppId || !creds.metaAppSecret) return fail("config");

  const tokens = await exchangeMetaAdsCode({
    code,
    appId: creds.metaAppId,
    appSecret: creds.metaAppSecret,
  });
  if (!tokens.access_token) return fail(tokens.error || "token");

  const accounts = await fetchMetaAdAccounts(tokens.access_token).catch(() => []);
  await saveAdsCredentials({
    metaAccessToken: tokens.access_token,
    metaAdAccountId: creds.metaAdAccountId || accounts[0]?.id || "",
  });

  const res = NextResponse.redirect(`${site}/admin/ads?connected=meta`, 302);
  res.headers.append(
    "Set-Cookie",
    `${META_OAUTH_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`
  );
  return res;
}
