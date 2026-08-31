import { NextResponse } from "next/server";
import { buildTikTokAuthorizeUrl, tiktokConfigured } from "@/lib/social/platforms/tiktok";
import {
  createOAuthState,
  oauthCookieHeader,
} from "@/lib/social/oauth-state";
import { requireAdminForOAuth } from "@/lib/social/oauth-redirect";
import { resolveSocialOrigin } from "@/lib/social/env";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const denied = await requireAdminForOAuth(req);
  if (denied) return denied;

  const origin = await resolveSocialOrigin(req);
  if (!(await tiktokConfigured())) {
    return NextResponse.redirect(
      `${origin}/admin/social-accounts?error=tiktok_app_required`,
      302
    );
  }

  try {
    const state = await createOAuthState("tiktok");
    const url = await buildTikTokAuthorizeUrl(req, state);
    const res = NextResponse.redirect(url, 302);
    res.headers.append("Set-Cookie", oauthCookieHeader(state, origin));
    return res;
  } catch {
    return NextResponse.redirect(
      `${origin}/admin/social-accounts?error=oauth_start_failed`,
      302
    );
  }
}
