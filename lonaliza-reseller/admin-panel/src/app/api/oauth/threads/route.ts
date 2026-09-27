import { startOAuthFlow } from "@/lib/social/oauth-start";
import { buildThreadsAuthorizeUrl } from "@/lib/social/platforms/threads";
import { getThreadsSocialEnv, isThreadsConfigured } from "@/lib/social/env";

export const runtime = "nodejs";

const SVG = `<svg viewBox="0 0 24 24"><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.514C2.35 18.44 1.5 15.586 1.5 12.07 1.5 5.505 6.791.24 13.32.24c3.313 0 6.077 1.042 8.015 3.013C23.246 5.198 24.24 7.89 24.24 11.2c0 5.262-2.646 8.96-7.012 9.805-.47.09-.9-.24-.9-.72v-2.31c2.79.54 3.42-1.02 3.42-1.02.46-1.17 1.12-1.48 1.12-1.48.92-.63-.07-.62-.07-.62-.91.06-1.39.93-1.39.93-.9 1.55-2.36 1.1-2.94.84-.09-.65-.35-1.1-.64-1.35 2.23-.25 4.57-1.11 4.57-4.95 0-1.09-.39-1.98-1.03-2.68.1-.25.45-1.27-.1-2.65 0 0-.84-.27-2.75 1.02a9.6 9.6 0 0 0-5 0c-1.91-1.29-2.75-1.02-2.75-1.02-.55 1.38-.2 2.4-.1 2.65-.64.7-1.03 1.59-1.03 2.68 0 3.83 2.33 4.7 4.55 4.95-.36.31-.68.92-.68 1.85v2.74c0 .10.20.0.4.72C8.79 22.96 6.04 24 12.186 24z"/></svg>`;

export async function GET(req: Request) {
  const env = await getThreadsSocialEnv();
  return startOAuthFlow({
    req,
    provider: "threads",
    configured: isThreadsConfigured(env),
    authorizeUrl: (state) => buildThreadsAuthorizeUrl(req, state),
    gateway: {
      provider: "threads",
      providerTitleAr: "ثريدز",
      providerEnglishName: "Threads API",
      providerIconSvg: SVG,
      brandColor: "#000000",
      developerPortalUrl: "https://developers.facebook.com/apps/",
      steps: [
        {
          stepNumber: 1,
          titleAr: "تطبيق Threads في Meta",
          descriptionAr: "أضف منتج Threads في Meta for Developers — ليست بالضرورة نفس مفاتيح فيسبوك.",
          actionUrl: "https://developers.facebook.com/apps/",
          actionLabelAr: "Meta Apps ↗",
        },
        {
          stepNumber: 2,
          titleAr: "Redirect URI",
          descriptionAr: "الصق رابط إعادة التوجيه أدناه في إعدادات Threads.",
        },
        {
          stepNumber: 3,
          titleAr: "THREADS_APP_ID و Secret",
          descriptionAr: "انسخ معرّف تطبيق ثريدز والسر.",
        },
      ],
      fields: [
        { key: "threadsAppId", label: "Threads App ID", placeholder: "1234567890" },
        { key: "threadsAppSecret", label: "Threads App Secret", placeholder: "••••••••", isSecret: true },
      ],
    },
  });
}
