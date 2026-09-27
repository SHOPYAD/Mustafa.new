import { NextResponse } from "next/server";
import {
  exchangeLinkedInCode,
  listLinkedInOrganizations,
  saveLinkedInPage,
} from "@/lib/social/platforms/linkedin";
import { oauthCallbackError, readOAuthCallback } from "@/lib/social/oauth-callback";
import { redirectSocialAdmin } from "@/lib/social/oauth-redirect";
import { pendingCookieHeader, savePendingOAuth } from "@/lib/social/oauth-pending";
import { renderOAuthPickerHtml } from "@/lib/social/oauth-gateway-html";
import { resolveSocialOrigin } from "@/lib/social/env";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const parsed = await readOAuthCallback(req, "linkedin-page");
  if (!parsed.ok) return parsed.response;
  try {
    const exchanged = await exchangeLinkedInCode(req, parsed.code, "linkedin-page");
    const orgs = await listLinkedInOrganizations(exchanged.accessToken);
    if (orgs.length === 0) {
      return redirectSocialAdmin(req, {
        error: "no_pages",
        provider: "linkedin-page",
        detail: "لا توجد صفحة شركة بصلاحية المشرف على هذا الحساب",
      });
    }
    if (orgs.length === 1) {
      await saveLinkedInPage({ ...exchanged, org: orgs[0] });
      return redirectSocialAdmin(req, { connected: "linkedin-page" });
    }
    const origin = await resolveSocialOrigin(req);
    const pending = await savePendingOAuth({
      provider: "linkedin-page",
      accessToken: exchanged.accessToken,
      refreshToken: exchanged.refreshToken,
      tokenExpiresAt: exchanged.tokenExpiresAt,
      scopes: exchanged.scopes,
      displayName: exchanged.displayName,
      picture: exchanged.picture,
      choices: orgs.map((org) => ({ id: org.id, label: org.name, hint: org.vanity })),
    });
    const html = renderOAuthPickerHtml({
      provider: "linkedin-page",
      titleAr: "اختر صفحة لينكدإن",
      descriptionAr: "اختر صفحة الشركة التي تريد ربطها بمحرك النشر. لن يُحفظ الربط قبل التأكيد.",
      actionUrl: `${origin}/api/oauth/linkedin-page/select`,
      pendingId: pending.id,
      fieldName: "organizationId",
      options: pending.choices,
    });
    const res = new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
    res.headers.append("Set-Cookie", pendingCookieHeader(pending.id, origin));
    return res;
  } catch (err) {
    return oauthCallbackError(req, "linkedin-page", err);
  }
}
