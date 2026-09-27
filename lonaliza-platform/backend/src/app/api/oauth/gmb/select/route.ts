import { requireAdminForOAuth, redirectSocialAdmin } from "@/lib/social/oauth-redirect";
import { clearPendingCookieHeader, SOCIAL_PENDING_COOKIE, takePendingOAuth } from "@/lib/social/oauth-pending";
import { readCookie } from "@/lib/social/oauth-state";
import { saveGmbLocation } from "@/lib/social/platforms/gmb";
import { resolveSocialOrigin } from "@/lib/social/env";

export const runtime = "nodejs";

async function readBody(req: Request): Promise<{ pendingId: string; locationId: string }> {
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const json = (await req.json()) as { pendingId?: string; locationId?: string };
    return { pendingId: json.pendingId || "", locationId: json.locationId || "" };
  }
  const form = await req.formData();
  return {
    pendingId: String(form.get("pendingId") || ""),
    locationId: String(form.get("locationId") || ""),
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
    return redirectSocialAdmin(req, { error: "invalid_state", provider: "gmb", detail: "انتهت جلسة اختيار الموقع" });
  }
  const pending = await takePendingOAuth(pendingId, "gmb");
  if (!pending) {
    return redirectSocialAdmin(req, { error: "invalid_state", provider: "gmb", detail: "انتهت جلسة اختيار الموقع" });
  }
  const location = pending.choices.find((row) => row.id === body.locationId);
  if (!location) {
    return redirectSocialAdmin(req, {
      error: "no_pages",
      provider: "gmb",
      detail: "لم يتم اختيار موقع صالح",
    });
  }
  try {
    await saveGmbLocation({
      accessToken: pending.accessToken,
      refreshToken: pending.refreshToken,
      tokenExpiresAt: pending.tokenExpiresAt,
      scopes: pending.scopes,
      location: { id: location.id, name: location.label, address: location.hint },
    });
    const res = await redirectSocialAdmin(req, { connected: "gmb" });
    res.headers.append("Set-Cookie", clearPendingCookieHeader(origin));
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "فشل حفظ موقع جوجل أعمالي";
    return redirectSocialAdmin(req, { error: "token_exchange_failed", provider: "gmb", detail: message.slice(0, 180) });
  }
}
