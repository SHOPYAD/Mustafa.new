import { NextResponse } from "next/server";
import { buildXAuthorizeUrl, createXPkce } from "@/lib/social/platforms/x";
import { createOAuthState, oauthCookieHeader } from "@/lib/social/oauth-state";
import { requireAdminForOAuth } from "@/lib/social/oauth-redirect";
import { resolveSocialOrigin, getXSocialEnv, isXConfigured, oauthRedirectUri } from "@/lib/social/env";
import { renderOAuthGatewayHtml } from "@/lib/social/oauth-gateway-html";

export const runtime = "nodejs";

const X_SVG = `<svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`;

function pkceCookie(value: string, origin: string): string {
  const secure = origin.startsWith("https:") ? "; Secure" : "";
  return `alrayyan_x_pkce=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600${secure}`;
}

export async function GET(req: Request) {
  const denied = await requireAdminForOAuth(req);
  if (denied) return denied;

  const origin = await resolveSocialOrigin(req);
  const redirectUri = oauthRedirectUri(origin, "x");
  const env = await getXSocialEnv();

  if (!isXConfigured(env)) {
    const html = renderOAuthGatewayHtml({
      provider: "x",
      providerTitleAr: "إكس (تويتر)",
      providerEnglishName: "X (Twitter Developer Portal)",
      providerIconSvg: X_SVG,
      brandColor: "#1d9bf0",
      redirectUri,
      steps: [
        {
          stepNumber: 1,
          titleAr: "إنشاء مشروع وتطبيق على X Developer Portal",
          descriptionAr: "ادخل إلى منصة مطوري X، وأنشئ مشروعاً (Project) جديداً وتطبيقاً بداخله.",
          actionUrl: "https://developer.x.com/en/portal/dashboard",
          actionLabelAr: "لوحة X Developers ↗",
        },
        {
          stepNumber: 2,
          titleAr: "إعداد User authentication settings",
          descriptionAr: "فعل OAuth 2.0 واختر نوع التطبيق Web App، والصق رابط إعادة التوجيه أدناه في خانة Callback URI.",
        },
        {
          stepNumber: 3,
          titleAr: "نسخ Client ID و Client Secret",
          descriptionAr: "انسخ المفاتيح وضعها في الحقول أدناه لتفعيل النشر والتفاعل التلقائي.",
        },
      ],
      fields: [
        {
          key: "xClientId",
          label: "معرف العميل (X Client ID)",
          placeholder: "VGxSZmVq...",
          helpTextAr: "تجد هذا المعرف في قسم Keys and Tokens.",
        },
        {
          key: "xClientSecret",
          label: "المفتاح السري (X Client Secret)",
          placeholder: "••••••••••••••••••••••••••••••••",
          isSecret: true,
        },
      ],
      developerPortalUrl: "https://developer.x.com/en/portal/dashboard",
    });
    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  try {
    const state = await createOAuthState("x");
    const pkce = createXPkce();
    const url = await buildXAuthorizeUrl(req, state, pkce.challenge);
    const res = NextResponse.redirect(url, 302);
    res.headers.append("Set-Cookie", oauthCookieHeader(state, origin));
    res.headers.append("Set-Cookie", pkceCookie(pkce.verifier, origin));
    return res;
  } catch {
    const html = renderOAuthGatewayHtml({
      provider: "x",
      providerTitleAr: "إكس (تويتر)",
      providerEnglishName: "X (Twitter Developer Portal)",
      providerIconSvg: X_SVG,
      brandColor: "#1d9bf0",
      redirectUri,
      steps: [
        {
          stepNumber: 1,
          titleAr: "مراجعة مفاتيح X API",
          descriptionAr: "يرجى مراجعة إعدادات المصادقة في X Developer Portal.",
          actionUrl: "https://developer.x.com/en/portal/dashboard",
          actionLabelAr: "لوحة X ↗",
        },
      ],
      fields: [
        { key: "xClientId", label: "X Client ID", placeholder: "VGxSZmVq..." },
        { key: "xClientSecret", label: "X Client Secret", placeholder: "••••••••••••••••", isSecret: true },
      ],
      developerPortalUrl: "https://developer.x.com/en/portal/dashboard",
    });
    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}
