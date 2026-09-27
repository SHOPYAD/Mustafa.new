import { NextResponse } from "next/server";
import { buildMetaAuthorizeUrl } from "@/lib/social/platforms/meta";
import { createOAuthState, oauthCookieHeader } from "@/lib/social/oauth-state";
import { requireAdminForOAuth } from "@/lib/social/oauth-redirect";
import { resolveSocialOrigin, getMetaSocialEnv, isMetaConfigured, oauthRedirectUri } from "@/lib/social/env";
import { renderOAuthGatewayHtml } from "@/lib/social/oauth-gateway-html";

export const runtime = "nodejs";

const META_SVG = `<svg viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/></svg>`;

export async function GET(req: Request) {
  const denied = await requireAdminForOAuth(req);
  if (denied) return denied;

  const origin = await resolveSocialOrigin(req);
  const redirectUri = oauthRedirectUri(origin, "meta");
  const env = await getMetaSocialEnv();

  if (!isMetaConfigured(env)) {
    const html = renderOAuthGatewayHtml({
      provider: "meta",
      providerTitleAr: "فيسبوك وإنستغرام",
      providerEnglishName: "Meta (Facebook & Instagram)",
      providerIconSvg: META_SVG,
      brandColor: "#1877f2",
      redirectUri,
      steps: [
        {
          stepNumber: 1,
          titleAr: "إنشاء تطبيق مجاني على Meta for Developers",
          descriptionAr: "اضغط على الزر وافتح لوحة المطورين، ثم اضغط على «إنشاء تطبيق (Create App)» واختر النوع «أعمال (Business)» أو «أخرى (Other)».",
          actionUrl: "https://developers.facebook.com/apps/create/",
          actionLabelAr: "إنشاء تطبيق ↗",
        },
        {
          stepNumber: 2,
          titleAr: "إضافة منتج Facebook Login وتعيين الرابط",
          descriptionAr: "من القائمة الجانبية للتطبيق، أضف «Facebook Login for Business» ثم في قسم Settings الصق رابط إعادة التوجيه الموجود بالأسفل في خانة Valid OAuth Redirect URIs.",
          actionUrl: "https://developers.facebook.com/apps/",
          actionLabelAr: "لوحة التطبيقات ↗",
        },
        {
          stepNumber: 3,
          titleAr: "نسخ معرف التطبيق والمفتاح السري (App ID & Secret)",
          descriptionAr: "من القائمة اذهب إلى App Settings -> Basic، وانسخ App ID و App Secret والصقهما في الحقول أدناه.",
          actionUrl: "https://developers.facebook.com/apps/",
          actionLabelAr: "إعدادات التطبيق ↗",
        },
      ],
      fields: [
        {
          key: "metaAppId",
          label: "معرف التطبيق (Meta App ID)",
          placeholder: "مثال: 108392019482710",
          helpTextAr: "تجد هذا الرقم في أعلى صفحة التطبيق في Meta for Developers.",
        },
        {
          key: "metaAppSecret",
          label: "المفتاح السري للتطبيق (Meta App Secret)",
          placeholder: "••••••••••••••••••••••••••••••••",
          helpTextAr: "اضغط على «Show» بجانب App Secret في صفحة Basic Settings لنسخه.",
          isSecret: true,
        },
      ],
      developerPortalUrl: "https://developers.facebook.com/apps/",
    });
    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  try {
    const state = await createOAuthState("meta");
    const url = await buildMetaAuthorizeUrl(req, state);
    const res = NextResponse.redirect(url, 302);
    res.headers.append("Set-Cookie", oauthCookieHeader(state, origin));
    return res;
  } catch {
    const html = renderOAuthGatewayHtml({
      provider: "meta",
      providerTitleAr: "فيسبوك وإنستغرام",
      providerEnglishName: "Meta (Facebook & Instagram)",
      providerIconSvg: META_SVG,
      brandColor: "#1877f2",
      redirectUri,
      steps: [
        {
          stepNumber: 1,
          titleAr: "تحديث مفاتيح Meta App ID والسر",
          descriptionAr: "يرجى مراجعة التطبيق في Meta for Developers والتأكد من تفعيل صلاحيات pages_manage_posts و instagram_content_publish.",
          actionUrl: "https://developers.facebook.com/apps/",
          actionLabelAr: "لوحة Meta Apps ↗",
        },
      ],
      fields: [
        {
          key: "metaAppId",
          label: "معرف التطبيق (Meta App ID)",
          placeholder: "مثال: 108392019482710",
        },
        {
          key: "metaAppSecret",
          label: "المفتاح السري (Meta App Secret)",
          placeholder: "••••••••••••••••••••••••••••••••",
          isSecret: true,
        },
      ],
      developerPortalUrl: "https://developers.facebook.com/apps/",
    });
    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}
