import { NextRequest, NextResponse } from "next/server";
import { readCookie } from "@/lib/server/admin-auth";
import { getServerEnv } from "@/lib/server/env-store";
import { resolveSitePublicUrl } from "@/lib/pocketbase/constants";
import { resolveAdsCredentials } from "@/lib/ads/config";
import { listGoogleCustomers } from "@/lib/ads/google/client";
import {
  exchangeGoogleAdsCode,
  GOOGLE_OAUTH_COOKIE,
  verifyOAuthState,
} from "@/lib/ads/google/oauth";
import { saveAdsCredentials } from "@/lib/ads/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const site = resolveSitePublicUrl(await getServerEnv("NEXT_PUBLIC_SITE_URL"));
  const fail = (reason: string) =>
    NextResponse.redirect(`${site}/admin/ads?oauth=google&error=${encodeURIComponent(reason)}`, 302);

  const code = req.nextUrl.searchParams.get("code") || "";
  const state = req.nextUrl.searchParams.get("state") || "";
  const cookie = readCookie(req, GOOGLE_OAUTH_COOKIE) || "";
  if (!code || !(await verifyOAuthState(state, cookie))) {
    return fail("state");
  }

  const creds = await resolveAdsCredentials();
  if (!creds.googleClientId || !creds.googleClientSecret) return fail("config");

  const tokens = await exchangeGoogleAdsCode({
    code,
    clientId: creds.googleClientId,
    clientSecret: creds.googleClientSecret,
  });
  if (!tokens.refresh_token && !tokens.access_token) {
    return fail(tokens.error || "token");
  }

  const next = await saveAdsCredentials({
    googleRefreshToken: tokens.refresh_token || creds.googleRefreshToken,
  });
  if (!next.googleCustomerId && next.googleRefreshToken) {
    try {
      const customers = await listGoogleCustomers({ ...creds, ...next });
      if (customers[0]) {
        await saveAdsCredentials({ googleCustomerId: customers[0] });
      }
    } catch {
      /* admin can paste customer id */
    }
  }

  const res = NextResponse.redirect(`${site}/admin/ads?connected=google`, 302);
  res.headers.append(
    "Set-Cookie",
    `${GOOGLE_OAUTH_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`
  );
  return res;
}
