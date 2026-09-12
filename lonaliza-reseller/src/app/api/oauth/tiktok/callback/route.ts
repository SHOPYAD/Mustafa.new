import { completeTikTokOAuth } from "@/lib/social/platforms/tiktok";
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
    return redirectSocialAdmin(req, { error: "oauth_denied", provider: "tiktok" });
  }
  if (!code) {
    return redirectSocialAdmin(req, { error: "missing_code", provider: "tiktok" });
  }

  const cookieState = readCookie(req, SOCIAL_OAUTH_COOKIE);
  if (
    !state ||
    state !== cookieState ||
    !(await verifyOAuthState(state, "tiktok"))
  ) {
    return redirectSocialAdmin(req, {
      error: "invalid_state",
      provider: "tiktok",
    });
  }

  try {
    await completeTikTokOAuth(req, code);
    return redirectSocialAdmin(req, { connected: "tiktok" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "token_exchange_failed";
    const codeHint = /تطبيق تيك توك|tiktok app/i.test(message)
      ? "tiktok_app_required"
      : "token_exchange_failed";
    return redirectSocialAdmin(req, {
      error: codeHint,
      provider: "tiktok",
      detail: message.slice(0, 180),
    });
  }
}
