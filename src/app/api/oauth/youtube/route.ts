import { NextResponse } from "next/server";
import { buildYoutubeAuthorizeUrl } from "@/lib/social/platforms/youtube";
import {
  createOAuthState,
  oauthCookieHeader,
} from "@/lib/social/oauth-state";
import { requireAdminForOAuth } from "@/lib/social/oauth-redirect";
import { resolveSocialOrigin } from "@/lib/social/env";
import { SocialHttpError } from "@/lib/social/http";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const denied = await requireAdminForOAuth(req);
  if (denied) return denied;

  try {
    const origin = await resolveSocialOrigin(req);
    const state = await createOAuthState("youtube");
    const url = await buildYoutubeAuthorizeUrl(req, state);
    const res = NextResponse.redirect(url, 302);
    res.headers.append("Set-Cookie", oauthCookieHeader(state, origin));
    return res;
  } catch (err) {
    const origin = await resolveSocialOrigin(req);
    const reason =
      err instanceof SocialHttpError ? "missing_credentials" : "oauth_start_failed";
    return NextResponse.redirect(
      `${origin}/admin/social-accounts?error=${encodeURIComponent(reason)}`,
      302
    );
  }
}
