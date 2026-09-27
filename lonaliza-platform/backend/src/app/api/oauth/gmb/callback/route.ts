import { NextResponse } from "next/server";
import { exchangeGmbCode, listGmbLocations, saveGmbLocation } from "@/lib/social/platforms/gmb";
import { oauthCallbackError, readOAuthCallback } from "@/lib/social/oauth-callback";
import { redirectSocialAdmin } from "@/lib/social/oauth-redirect";
import { pendingCookieHeader, savePendingOAuth } from "@/lib/social/oauth-pending";
import { renderOAuthPickerHtml } from "@/lib/social/oauth-gateway-html";
import { resolveSocialOrigin } from "@/lib/social/env";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const parsed = await readOAuthCallback(req, "gmb");
  if (!parsed.ok) return parsed.response;
  try {
    const exchanged = await exchangeGmbCode(req, parsed.code);
    const locations = await listGmbLocations(exchanged.accessToken);
    if (locations.length === 0) {
      return redirectSocialAdmin(req, {
        error: "no_pages",
        provider: "gmb",
        detail: "لا يوجد موقع Google Business مرتبط بهذا الحساب",
      });
    }
    if (locations.length === 1) {
      await saveGmbLocation({ ...exchanged, location: locations[0] });
      return redirectSocialAdmin(req, { connected: "gmb" });
    }
    const origin = await resolveSocialOrigin(req);
    const pending = await savePendingOAuth({
      provider: "gmb",
      accessToken: exchanged.accessToken,
      refreshToken: exchanged.refreshToken,
      tokenExpiresAt: exchanged.tokenExpiresAt,
      scopes: exchanged.scopes,
      choices: locations.map((loc) => ({ id: loc.id, label: loc.name, hint: loc.address })),
    });
    const html = renderOAuthPickerHtml({
      provider: "gmb",
      titleAr: "اختر موقع جوجل أعمالي",
      descriptionAr: "اختر الموقع المحلي الذي تريد النشر عليه. لن يُحفظ الربط قبل التأكيد.",
      actionUrl: `${origin}/api/oauth/gmb/select`,
      pendingId: pending.id,
      fieldName: "locationId",
      options: pending.choices,
    });
    const res = new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
    res.headers.append("Set-Cookie", pendingCookieHeader(pending.id, origin));
    return res;
  } catch (err) {
    return oauthCallbackError(req, "gmb", err);
  }
}
