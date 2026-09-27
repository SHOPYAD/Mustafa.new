import { requireAdminForOAuth, redirectSocialAdmin } from "@/lib/social/oauth-redirect";
import { clearPendingCookieHeader, SOCIAL_PENDING_COOKIE, takePendingOAuth } from "@/lib/social/oauth-pending";
import { readCookie } from "@/lib/social/oauth-state";
import { saveLinkedInPage } from "@/lib/social/platforms/linkedin";
import { resolveSocialOrigin } from "@/lib/social/env";

export const runtime = "nodejs";

async function readBody(req: Request): Promise<{ pendingId: string; organizationId: string }> {
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const json = (await req.json()) as { pendingId?: string; organizationId?: string };
    return { pendingId: json.pendingId || "", organizationId: json.organizationId || "" };
  }
  const form = await req.formData();
  return {
    pendingId: String(form.get("pendingId") || ""),
    organizationId: String(form.get("organizationId") || ""),
  };
}

export async function POST(req: Request) {
  const denied = await requireAdminForOAuth(req);
  if (denied) return denied;
  const origin = await resolveSocialOrigin(req);
  const body = await readBody(req);
  const cookieId = readCookie(req, SOCIAL_PENDING_COOKIE);
  const pendingId = body.pendingId || cookieId;
  if (!pendingId || (cookieId && cookieId !== pendingId)) {
    return redirectSocialAdmin(req, { error: "invalid_state", provider: "linkedin-page", detail: "انتهت جلسة اختيار الصفحة" });
  }
  const pending = await takePendingOAuth(pendingId, "linkedin-page");
  if (!pending) {
    return redirectSocialAdmin(req, { error: "invalid_state", provider: "linkedin-page", detail: "انتهت جلسة اختيار الصفحة" });
  }
  const org = pending.choices.find((row) => row.id === body.organizationId);
  if (!org) {
    return redirectSocialAdmin(req, {
      error: "no_pages",
      provider: "linkedin-page",
      detail: "لم يتم اختيار صفحة صالحة",
    });
  }
  try {
    await saveLinkedInPage({
      accessToken: pending.accessToken,
      refreshToken: pending.refreshToken,
      tokenExpiresAt: pending.tokenExpiresAt,
      scopes: pending.scopes,
      org: { id: org.id, name: org.label, vanity: org.hint },
    });
    const res = await redirectSocialAdmin(req, { connected: "linkedin-page" });
    res.headers.append("Set-Cookie", clearPendingCookieHeader(origin));
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "فشل حفظ صفحة لينكدإن";
    return redirectSocialAdmin(req, { error: "token_exchange_failed", provider: "linkedin-page", detail: message.slice(0, 180) });
  }
}
