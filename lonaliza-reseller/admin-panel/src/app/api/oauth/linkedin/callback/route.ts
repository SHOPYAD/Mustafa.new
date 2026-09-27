import { completeLinkedInPersonalOAuth } from "@/lib/social/platforms/linkedin";
import { oauthCallbackError, readOAuthCallback } from "@/lib/social/oauth-callback";
import { redirectSocialAdmin } from "@/lib/social/oauth-redirect";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const parsed = await readOAuthCallback(req, "linkedin");
  if (!parsed.ok) return parsed.response;
  try {
    await completeLinkedInPersonalOAuth(req, parsed.code);
    return redirectSocialAdmin(req, { connected: "linkedin" });
  } catch (err) {
    return oauthCallbackError(req, "linkedin", err);
  }
}
