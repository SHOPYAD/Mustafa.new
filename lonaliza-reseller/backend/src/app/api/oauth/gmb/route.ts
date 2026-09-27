import { startOAuthFlow } from "@/lib/social/oauth-start";
import { buildGmbAuthorizeUrl } from "@/lib/social/platforms/gmb";
import { getGmbSocialEnv, isGmbConfigured } from "@/lib/social/env";

export const runtime = "nodejs";

const SVG = `<svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>`;

export async function GET(req: Request) {
  const env = await getGmbSocialEnv();
  return startOAuthFlow({
    req,
    provider: "gmb",
    configured: isGmbConfigured(env),
    authorizeUrl: (state) => buildGmbAuthorizeUrl(req, state),
    gateway: {
      provider: "gmb",
      providerTitleAr: "جوجل أعمالي",
      providerEnglishName: "Google Business Profile",
      providerIconSvg: SVG,
      brandColor: "#4285f4",
      developerPortalUrl: "https://console.cloud.google.com/apis/credentials",
      steps: [
        {
          stepNumber: 1,
          titleAr: "تفعيل Business Profile APIs",
          descriptionAr: "Account Management API و Business Information API.",
          actionUrl: "https://console.cloud.google.com/apis/library",
          actionLabelAr: "Google APIs ↗",
        },
        {
          stepNumber: 2,
          titleAr: "Redirect URI",
          descriptionAr: "يمكن استخدام عميل يوتيوب إن سُجّل هذا الرابط.",
        },
        {
          stepNumber: 3,
          titleAr: "المفاتيح",
          descriptionAr: "Client ID و Client Secret من Google Cloud.",
        },
      ],
      fields: [
        { key: "gmbClientId", label: "Google Client ID", placeholder: "12345-abc.apps.googleusercontent.com" },
        { key: "gmbClientSecret", label: "Google Client Secret", placeholder: "••••••••", isSecret: true },
      ],
    },
  });
}
