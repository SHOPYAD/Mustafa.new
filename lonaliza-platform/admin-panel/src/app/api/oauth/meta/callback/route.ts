import { completeMetaOAuth } from "@/lib/social/platforms/meta";
import {
  readCookie,
  SOCIAL_OAUTH_COOKIE,
  verifyOAuthState,
} from "@/lib/social/oauth-state";
import { redirectSocialAdmin } from "@/lib/social/oauth-redirect";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const error = url.searchParams.get("error") || "";
  const code = url.searchParams.get("code") || "";
  const state = url.searchParams.get("state") || "";

  if (error) {
    return redirectSocialAdmin(req, { error: "oauth_denied", provider: "meta" });
  }
  if (!code) {
    return redirectSocialAdmin(req, { error: "missing_code", provider: "meta" });
  }

  const cookieState = readCookie(req, SOCIAL_OAUTH_COOKIE);
  if (
    !state ||
    state !== cookieState ||
    !(await verifyOAuthState(state, "meta"))
  ) {
    return redirectSocialAdmin(req, { error: "invalid_state", provider: "meta" });
  }

  try {
    const created = await completeMetaOAuth(req, code);
    return redirectSocialAdmin(req, {
      connected: "meta",
      facebook: String(created.facebook),
      instagram: String(created.instagram),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "token_exchange_failed";
    const codeHint = /صفحات/.test(message) ? "no_pages" : "token_exchange_failed";
    return redirectSocialAdmin(req, {
      error: codeHint,
      provider: "meta",
      detail: message.slice(0, 180),
    });
  }
}
