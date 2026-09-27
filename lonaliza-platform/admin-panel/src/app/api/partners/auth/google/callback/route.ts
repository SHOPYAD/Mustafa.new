import { NextRequest, NextResponse } from "next/server";
import { getServerEnv } from "@/lib/server/env-store";
import { getGoogleOAuthCredentials } from "@/lib/pocketbase/google";
import { resolveSitePublicUrl } from "@/lib/pocketbase/constants";
import { upsertResellerCompanyFromGoogle } from "@/lib/server/resale-store";
import {
  createPartnerSessionToken,
  PARTNER_AUTH_COOKIE,
  PARTNER_SESSION_MAX_AGE,
} from "@/lib/server/partner-session";

export const runtime = "nodejs";

const PARTNER_OAUTH_VERIFIER_COOKIE = "liotrip_partner_oauth_verifier";

type GoogleTokenResponse = {
  access_token?: string;
  id_token?: string;
  error?: string;
};

type GoogleUserInfo = {
  sub?: string;
  email?: string;
  name?: string;
};

export async function GET(req: NextRequest) {
  const siteUrl = resolveSitePublicUrl(await getServerEnv("NEXT_PUBLIC_SITE_URL"));
  const { clientId, clientSecret } = await getGoogleOAuthCredentials();
  const code = req.nextUrl.searchParams.get("code") || "";
  const error = req.nextUrl.searchParams.get("error");
  const verifier = req.cookies.get(PARTNER_OAUTH_VERIFIER_COOKIE)?.value || "";

  if (error || !code || !verifier) {
    return NextResponse.redirect(`${siteUrl}/partners?error=auth_failed`, 302);
  }

  const redirectUri = `${siteUrl}/api/partners/auth/google/callback`;

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        code_verifier: verifier,
      }),
    });

    const tokenData = (await tokenRes.json()) as GoogleTokenResponse;
    if (!tokenRes.ok || !tokenData.access_token) {
      return NextResponse.redirect(`${siteUrl}/partners?error=token_exchange`, 302);
    }

    const userRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profile = (await userRes.json()) as GoogleUserInfo;

    if (!profile.email) {
      return NextResponse.redirect(`${siteUrl}/partners?error=email_missing`, 302);
    }

    const company = await upsertResellerCompanyFromGoogle({
      email: profile.email,
      name: profile.name || "",
      googleId: profile.sub || "",
    });

    const token = await createPartnerSessionToken(company.id, company.email);

    const res = NextResponse.redirect(`${siteUrl}/partners/dashboard`, 302);
    res.headers.append(
      "Set-Cookie",
      `${PARTNER_AUTH_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${PARTNER_SESSION_MAX_AGE}; Secure`
    );
    // Clear verifier cookie
    res.headers.append(
      "Set-Cookie",
      `${PARTNER_OAUTH_VERIFIER_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`
    );

    return res;
  } catch (err) {
    console.error("[partners/auth/google/callback] error:", err);
    return NextResponse.redirect(`${siteUrl}/partners?error=server_error`, 302);
  }
}
