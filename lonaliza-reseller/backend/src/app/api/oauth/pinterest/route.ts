import { startOAuthFlow } from "@/lib/social/oauth-start";
import { buildPinterestAuthorizeUrl } from "@/lib/social/platforms/pinterest";
import { getPinterestSocialEnv, isPinterestConfigured } from "@/lib/social/env";

export const runtime = "nodejs";

const SVG = `<svg viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.99 3.992-.281 1.189.597 2.159 1.769 2.159 2.124 0 3.756-2.239 3.756-5.471 0-2.863-2.063-4.863-5.012-4.863-3.414 0-5.418 2.561-5.418 5.207 0 1.031.394 2.138.889 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.888-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/></svg>`;

export async function GET(req: Request) {
  const env = await getPinterestSocialEnv();
  return startOAuthFlow({
    req,
    provider: "pinterest",
    configured: isPinterestConfigured(env),
    authorizeUrl: (state) => buildPinterestAuthorizeUrl(req, state),
    gateway: {
      provider: "pinterest",
      providerTitleAr: "بنترست",
      providerEnglishName: "Pinterest API v5",
      providerIconSvg: SVG,
      brandColor: "#e60023",
      developerPortalUrl: "https://developers.pinterest.com/apps/",
      steps: [
        {
          stepNumber: 1,
          titleAr: "تطبيق Pinterest",
          descriptionAr: "من لوحة المطورين أنشئ تطبيقاً وفعّل pins:write و boards:read.",
          actionUrl: "https://developers.pinterest.com/apps/",
          actionLabelAr: "Pinterest Apps ↗",
        },
        {
          stepNumber: 2,
          titleAr: "Redirect URI",
          descriptionAr: "الصق رابط إعادة التوجيه أدناه.",
        },
        {
          stepNumber: 3,
          titleAr: "App ID و Secret",
          descriptionAr: "انسخهما من إعدادات التطبيق.",
        },
      ],
      fields: [
        { key: "pinterestClientId", label: "Pinterest App ID", placeholder: "148xxxx" },
        { key: "pinterestClientSecret", label: "Pinterest App Secret", placeholder: "••••••••", isSecret: true },
      ],
    },
  });
}
