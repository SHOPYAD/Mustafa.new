import { startOAuthFlow } from "@/lib/social/oauth-start";
import { buildLinkedInAuthorizeUrl } from "@/lib/social/platforms/linkedin";
import { getLinkedInSocialEnv, isLinkedInConfigured } from "@/lib/social/env";

export const runtime = "nodejs";

const SVG = `<svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.554V9h3.565v11.452z"/></svg>`;

export async function GET(req: Request) {
  const env = await getLinkedInSocialEnv();
  return startOAuthFlow({
    req,
    provider: "linkedin-page",
    configured: isLinkedInConfigured(env),
    authorizeUrl: (state) => buildLinkedInAuthorizeUrl(req, state, "linkedin-page"),
    gateway: {
      provider: "linkedin-page",
      providerTitleAr: "لينكدإن — صفحة الشركة",
      providerEnglishName: "LinkedIn Organization",
      providerIconSvg: SVG,
      brandColor: "#0a66c2",
      developerPortalUrl: "https://www.linkedin.com/developers/apps",
      steps: [
        {
          stepNumber: 1,
          titleAr: "نفس تطبيق لينكدإن",
          descriptionAr: "أضف Redirect URI الخاص بصفحة الشركة في نفس التطبيق.",
          actionUrl: "https://www.linkedin.com/developers/apps",
          actionLabelAr: "LinkedIn Apps ↗",
        },
        {
          stepNumber: 2,
          titleAr: "صلاحيات المنظمة",
          descriptionAr: "فعّل w_organization_social و rw_organization_admin.",
        },
        {
          stepNumber: 3,
          titleAr: "نسخ المفاتيح",
          descriptionAr: "Client ID و Client Secret من تبويب Auth.",
        },
      ],
      fields: [
        { key: "linkedinClientId", label: "LinkedIn Client ID", placeholder: "78xxxxxx" },
        { key: "linkedinClientSecret", label: "LinkedIn Client Secret", placeholder: "••••••••", isSecret: true },
      ],
    },
  });
}
