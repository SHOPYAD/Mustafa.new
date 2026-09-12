import { completeXOauth } from "@/lib/social/platforms/x";
import { readCookie, SOCIAL_OAUTH_COOKIE, verifyOAuthState } from "@/lib/social/oauth-state";
import { redirectSocialAdmin } from "@/lib/social/oauth-redirect";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const error = url.searchParams.get("error") || "";
  const code = url.searchParams.get("code") || "";
  const state = url.searchParams.get("state") || "";

  if (error) {
    return redirectSocialAdmin(req, { error: "oauth_denied", provider: "x" });
  }
  if (!code) {
    return redirectSocialAdmin(req, { error: "missing_code", provider: "x" });
  }

  const cookieState = readCookie(req, SOCIAL_OAUTH_COOKIE);
  const verifier = readCookie(req, "alrayyan_x_pkce");
  if (!state || state !== cookieState || !(await verifyOAuthState(state, "x"))) {
    return redirectSocialAdmin(req, { error: "invalid_state", provider: "x" });
  }
  if (!verifier) {
    return redirectSocialAdmin(req, { error: "invalid_state", provider: "x", detail: "pkce_missing" });
  }

  try {
    await completeXOauth(req, code, verifier);
    return redirectSocialAdmin(req, { connected: "x" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "token_exchange_failed";
    return redirectSocialAdmin(req, {
      error: "token_exchange_failed",
      provider: "x",
      detail: message.slice(0, 180),
    });
  }
}
