import { NextResponse } from "next/server";
import { buildYoutubeAuthorizeUrl } from "@/lib/social/platforms/youtube";
import { createOAuthState, oauthCookieHeader } from "@/lib/social/oauth-state";
import { requireAdminForOAuth } from "@/lib/social/oauth-redirect";
import { resolveSocialOrigin, getYoutubeSocialEnv, isYoutubeConfigured, oauthRedirectUri } from "@/lib/social/env";
import { renderOAuthGatewayHtml } from "@/lib/social/oauth-gateway-html";

export const runtime = "nodejs";

const YOUTUBE_SVG = `<svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`;

export async function GET(req: Request) {
  const denied = await requireAdminForOAuth(req);
  if (denied) return denied;

  const origin = await resolveSocialOrigin(req);
  const redirectUri = oauthRedirectUri(origin, "youtube");
  const env = await getYoutubeSocialEnv();

  if (!isYoutubeConfigured(env)) {
    const html = renderOAuthGatewayHtml({
      provider: "youtube",
      providerTitleAr: "يوتيوب وجوجل",
      providerEnglishName: "YouTube & Google Cloud",
      providerIconSvg: YOUTUBE_SVG,
      brandColor: "#ff0000",
      redirectUri,
      steps: [
        {
          stepNumber: 1,
          titleAr: "فتح Google Cloud Console وتفعيل YouTube Data API v3",
          descriptionAr: "اضغط على الزر لفتح منصة جوجل كلاود وقم بتمكين YouTube Data API v3 لمشروعك.",
          actionUrl: "https://console.cloud.google.com/apis/library/youtube.googleapis.com",
          actionLabelAr: "تفعيل API ↗",
        },
        {
          stepNumber: 2,
          titleAr: "إنشاء OAuth 2.0 Client ID وتعيين رابط Callback",
          descriptionAr: "من قائمة Credentials اضغط «Create Credentials -> OAuth client ID» واختر Web Application والصق رابط إعادة التوجيه بالأسفل.",
          actionUrl: "https://console.cloud.google.com/apis/credentials",
          actionLabelAr: "إنشاء مفاتيح ↗",
        },
        {
          stepNumber: 3,
          titleAr: "نسخ Client ID و Client Secret",
          descriptionAr: "انسخ المعرفين والصقهما في الخانات أدناه للبدء بتسجيل الدخول الفوري.",
        },
      ],
      fields: [
        {
          key: "youtubeClientId",
          label: "معرف العميل (Google Client ID)",
          placeholder: "12345-abc.apps.googleusercontent.com",
          helpTextAr: "تجد هذا المعرف في صفحة Credentials بجوجل كلاود.",
        },
        {
          key: "youtubeClientSecret",
          label: "المفتاح السري (Google Client Secret)",
          placeholder: "••••••••••••••••••••••••••••••••",
          isSecret: true,
        },
      ],
      developerPortalUrl: "https://console.cloud.google.com/apis/credentials",
    });
    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  try {
    const state = await createOAuthState("youtube");
    const url = await buildYoutubeAuthorizeUrl(req, state);
    const res = NextResponse.redirect(url, 302);
    res.headers.append("Set-Cookie", oauthCookieHeader(state, origin));
    return res;
  } catch {
    const html = renderOAuthGatewayHtml({
      provider: "youtube",
      providerTitleAr: "يوتيوب وجوجل",
      providerEnglishName: "YouTube & Google Cloud",
      providerIconSvg: YOUTUBE_SVG,
      brandColor: "#ff0000",
      redirectUri,
      steps: [
        {
          stepNumber: 1,
          titleAr: "مراجعة مفاتيح Google",
          descriptionAr: "يرجى التأكد من تطابق الـ Redirect URI مع النطاق المعتمد.",
          actionUrl: "https://console.cloud.google.com/apis/credentials",
          actionLabelAr: "لوحة Google ↗",
        },
      ],
      fields: [
        { key: "youtubeClientId", label: "Google Client ID", placeholder: "12345-abc.apps.googleusercontent.com" },
        { key: "youtubeClientSecret", label: "Google Client Secret", placeholder: "••••••••••••••••", isSecret: true },
      ],
      developerPortalUrl: "https://console.cloud.google.com/apis/credentials",
    });
    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}
