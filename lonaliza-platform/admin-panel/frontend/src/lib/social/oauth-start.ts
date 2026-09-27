import { NextResponse } from "next/server";
import { createOAuthState, oauthCookieHeader } from "./oauth-state";
import { requireAdminForOAuth } from "./oauth-redirect";
import { oauthRedirectUri, resolveSocialOrigin } from "./env";
import { renderOAuthGatewayHtml, type OAuthGatewayProps } from "./oauth-gateway-html";
import type { SocialProvider } from "./types";

type GatewaySpec = Omit<OAuthGatewayProps, "redirectUri">;

export async function startOAuthFlow(opts: {
  req: Request;
  provider: SocialProvider;
  configured: boolean;
  credentialsUrl?: string;
  gateway: GatewaySpec;
  authorizeUrl: (state: string) => Promise<string>;
}): Promise<NextResponse> {
  const denied = await requireAdminForOAuth(opts.req);
  if (denied) return denied;

  const origin = await resolveSocialOrigin(opts.req);
  const redirectUri = oauthRedirectUri(origin, opts.provider);
  const html = () =>
    new NextResponse(
      renderOAuthGatewayHtml({
        ...opts.gateway,
        provider: opts.provider,
        redirectUri,
        credentialsUrl: opts.credentialsUrl || "/api/oauth/credentials",
      }),
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );

  if (!opts.configured) return html();

  try {
    const state = await createOAuthState(opts.provider);
    const url = await opts.authorizeUrl(state);
    const res = NextResponse.redirect(url, 302);
    res.headers.append("Set-Cookie", oauthCookieHeader(state, origin));
    return res;
  } catch {
    return html();
  }
}
