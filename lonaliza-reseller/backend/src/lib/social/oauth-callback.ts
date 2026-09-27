import {
  readCookie,
  SOCIAL_OAUTH_COOKIE,
  verifyOAuthState,
} from "@/lib/social/oauth-state";
import { redirectSocialAdmin } from "@/lib/social/oauth-redirect";
import type { SocialProvider } from "@/lib/social/types";

export async function readOAuthCallback(req: Request, provider: SocialProvider): Promise<
  | { ok: true; code: string }
  | { ok: false; response: Response }
> {
  const url = new URL(req.url);
  const error = url.searchParams.get("error") || "";
  const code = url.searchParams.get("code") || "";
  const state = url.searchParams.get("state") || "";

  if (error) {
    return { ok: false, response: await redirectSocialAdmin(req, { error: "oauth_denied", provider }) };
  }
  if (!code) {
    return { ok: false, response: await redirectSocialAdmin(req, { error: "missing_code", provider }) };
  }
  const cookieState = readCookie(req, SOCIAL_OAUTH_COOKIE);
  if (!state || state !== cookieState || !(await verifyOAuthState(state, provider))) {
    return { ok: false, response: await redirectSocialAdmin(req, { error: "invalid_state", provider }) };
  }
  return { ok: true, code };
}

export async function oauthCallbackError(req: Request, provider: SocialProvider, err: unknown): Promise<Response> {
  const message = err instanceof Error ? err.message : "فشل تبادل الرمز";
  return redirectSocialAdmin(req, {
    error: "token_exchange_failed",
    provider,
    detail: message.slice(0, 180),
  });
}
