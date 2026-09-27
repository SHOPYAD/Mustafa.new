import { completeThreadsOAuth } from "@/lib/social/platforms/threads";
import { oauthCallbackError, readOAuthCallback } from "@/lib/social/oauth-callback";
import { redirectSocialAdmin } from "@/lib/social/oauth-redirect";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const parsed = await readOAuthCallback(req, "threads");
  if (!parsed.ok) return parsed.response;
  try {
    await completeThreadsOAuth(req, parsed.code);
    return redirectSocialAdmin(req, { connected: "threads" });
  } catch (err) {
    return oauthCallbackError(req, "threads", err);
  }
}
