import { completeYoutubeOAuth } from "@/lib/social/platforms/youtube";
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
    return redirectSocialAdmin(req, { error: "oauth_denied", provider: "youtube" });
  }
  if (!code) {
    return redirectSocialAdmin(req, { error: "missing_code", provider: "youtube" });
  }

  const cookieState = readCookie(req, SOCIAL_OAUTH_COOKIE);
  if (
    !state ||
    state !== cookieState ||
    !(await verifyOAuthState(state, "youtube"))
  ) {
    return redirectSocialAdmin(req, {
      error: "invalid_state",
      provider: "youtube",
    });
  }

  try {
    await completeYoutubeOAuth(req, code);
    return redirectSocialAdmin(req, { connected: "youtube" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "token_exchange_failed";
    const codeHint = /قناة/.test(message) ? "no_channel" : "token_exchange_failed";
    return redirectSocialAdmin(req, {
      error: codeHint,
      provider: "youtube",
      detail: message.slice(0, 180),
    });
  }
}
