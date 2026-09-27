import { completePinterestOAuth } from "@/lib/social/platforms/pinterest";
import { oauthCallbackError, readOAuthCallback } from "@/lib/social/oauth-callback";
import { redirectSocialAdmin } from "@/lib/social/oauth-redirect";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const parsed = await readOAuthCallback(req, "pinterest");
  if (!parsed.ok) return parsed.response;
  try {
    await completePinterestOAuth(req, parsed.code);
    return redirectSocialAdmin(req, { connected: "pinterest" });
  } catch (err) {
    return oauthCallbackError(req, "pinterest", err);
  }
}
