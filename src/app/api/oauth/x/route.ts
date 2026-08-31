import { NextResponse } from "next/server";
import { buildXAuthorizeUrl, createXPkce } from "@/lib/social/platforms/x";
import { createOAuthState, oauthCookieHeader } from "@/lib/social/oauth-state";
import { requireAdminForOAuth } from "@/lib/social/oauth-redirect";
import { resolveSocialOrigin } from "@/lib/social/env";
import { SocialHttpError } from "@/lib/social/http";

export const runtime = "nodejs";

function pkceCookie(value: string, origin: string): string {
  const secure = origin.startsWith("https:") ? "; Secure" : "";
  return `alrayyan_x_pkce=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${secure}`;
}

export async function GET(req: Request) {
  const denied = await requireAdminForOAuth(req);
  if (denied) return denied;
  try {
    const origin = await resolveSocialOrigin(req);
    const state = await createOAuthState("x");
    const pkce = createXPkce();
    const url = await buildXAuthorizeUrl(req, state, pkce.challenge);
    const res = NextResponse.redirect(url, 302);
    res.headers.append("Set-Cookie", oauthCookieHeader(state, origin));
    res.headers.append("Set-Cookie", pkceCookie(pkce.verifier, origin));
    return res;
  } catch (err) {
    const origin = await resolveSocialOrigin(req);
    const reason = err instanceof SocialHttpError ? "missing_credentials" : "oauth_start_failed";
    return NextResponse.redirect(
      `${origin}/admin/social-accounts?error=${encodeURIComponent(reason)}&provider=x`,
      302
    );
  }
}
