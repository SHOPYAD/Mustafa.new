import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServerEnv } from "@/lib/server/env-store";
import {
  ensureUsersGoogleProviderFromEnv,
  getGoogleOAuthCredentials,
  googleFailRedirectPath,
  logGoogleAuthError,
  safeOAuthNextPath,
} from "@/lib/pocketbase/google";
import {
  OAUTH_NEXT_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  resolveSitePublicUrl,
} from "@/lib/pocketbase/constants";

export const runtime = "nodejs";

function cookieHeader(name: string, value: string, maxAge: number): string {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Secure`;
}

export async function GET(req: NextRequest) {
  const siteUrl = resolveSitePublicUrl(
    await getServerEnv("NEXT_PUBLIC_SITE_URL")
  );
  const { clientId, clientSecret } = await getGoogleOAuthCredentials();
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { ok: false, error: "Google OAuth keys are missing" },
      { status: 400 }
    );
  }

  const synced = await ensureUsersGoogleProviderFromEnv();
  if (!synced.ok) {
    logGoogleAuthError("ensure-provider", new Error(synced.error || "sync_failed"));
    return NextResponse.redirect(
      `${siteUrl}${googleFailRedirectPath("google_config")}`,
      302
    );
  }

  const redirectUri = `${siteUrl}/api/auth/callback`;
  const next = safeOAuthNextPath(
    req.nextUrl.searchParams.get("next") || "/account"
  );

  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const state = randomBytes(16).toString("base64url");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    code_challenge: challenge,
    code_challenge_method: "S256",
    access_type: "offline",
    prompt: "select_account",
    state,
  });

  const res = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    302
  );
  res.headers.append("Set-Cookie", cookieHeader(OAUTH_VERIFIER_COOKIE, verifier, 600));
  res.headers.append("Set-Cookie", cookieHeader(OAUTH_NEXT_COOKIE, next, 600));
  return res;
}
