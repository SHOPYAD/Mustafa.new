import { NextResponse } from "next/server";
import { buildTikTokAuthorizeUrl, tiktokConfigured } from "@/lib/social/platforms/tiktok";
import { createOAuthState, oauthCookieHeader } from "@/lib/social/oauth-state";
import { requireAdminForOAuth } from "@/lib/social/oauth-redirect";
import { resolveSocialOrigin, oauthRedirectUri } from "@/lib/social/env";
import { renderOAuthGatewayHtml } from "@/lib/social/oauth-gateway-html";

export const runtime = "nodejs";

const TIKTOK_SVG = `<svg viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.5 6.27 6.27 0 0 0 1.86-4.49V8.71a8.18 8.18 0 0 0 4.91 1.63V6.89a4.85 4.85 0 0 1-1-.2z"/></svg>`;

export async function GET(req: Request) {
  const denied = await requireAdminForOAuth(req);
  if (denied) return denied;

  const origin = await resolveSocialOrigin(req);
  const redirectUri = oauthRedirectUri(origin, "tiktok");

  if (!(await tiktokConfigured())) {
    const html = renderOAuthGatewayHtml({
      provider: "tiktok",
      providerTitleAr: "تيك توك للأعمال",
      providerEnglishName: "TikTok for Developers",
      providerIconSvg: TIKTOK_SVG,
      brandColor: "#00f2fe",
      redirectUri,
      steps: [
        {
          stepNumber: 1,
          titleAr: "إنشاء تطبيق على TikTok for Developers",
          descriptionAr: "ادخل إلى منصة مطوري تيك توك واضغط على «Add an App» لإنشاء تطبيق جديد.",
          actionUrl: "https://developers.tiktok.com/",
          actionLabelAr: "لوحة تيك توك ↗",
        },
        {
          stepNumber: 2,
          titleAr: "إضافة منتج Login Kit و Redirect URI",
          descriptionAr: "قم بتفعيل «Login Kit» والصق رابط إعادة التوجيه المصرح به الموضح أدناه في خانة Redirect Domains.",
        },
        {
          stepNumber: 3,
          titleAr: "نسخ Client Key و Client Secret",
          descriptionAr: "انسخ المفاتيح من قسم App Details وضعها في الحقول أدناه لتفعيل الربط.",
        },
      ],
      fields: [
        {
          key: "tiktokClientKey",
          label: "مفتاح العميل (TikTok Client Key)",
          placeholder: "مثال: aw3k79df89j...",
          helpTextAr: "تجد هذا المفتاح في قسم App Credentials.",
        },
        {
          key: "tiktokClientSecret",
          label: "المفتاح السري (TikTok Client Secret)",
          placeholder: "••••••••••••••••••••••••••••••••",
          isSecret: true,
        },
      ],
      developerPortalUrl: "https://developers.tiktok.com/",
    });
    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  try {
    const state = await createOAuthState("tiktok");
    const url = await buildTikTokAuthorizeUrl(req, state);
    const res = NextResponse.redirect(url, 302);
    res.headers.append("Set-Cookie", oauthCookieHeader(state, origin));
    return res;
  } catch {
    const html = renderOAuthGatewayHtml({
      provider: "tiktok",
      providerTitleAr: "تيك توك للأعمال",
      providerEnglishName: "TikTok for Developers",
      providerIconSvg: TIKTOK_SVG,
      brandColor: "#00f2fe",
      redirectUri,
      steps: [
        {
          stepNumber: 1,
          titleAr: "تحديث مفاتيح TikTok",
          descriptionAr: "يرجى التحقق من صلاحيات التطبيق على تيك توك وإعادة إدخال المفاتيح.",
          actionUrl: "https://developers.tiktok.com/",
          actionLabelAr: "لوحة تيك توك ↗",
        },
      ],
      fields: [
        { key: "tiktokClientKey", label: "مفتاح العميل (TikTok Client Key)", placeholder: "aw3k79df89j..." },
        { key: "tiktokClientSecret", label: "المفتاح السري (TikTok Client Secret)", placeholder: "••••••••••••••••", isSecret: true },
      ],
      developerPortalUrl: "https://developers.tiktok.com/",
    });
    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}
