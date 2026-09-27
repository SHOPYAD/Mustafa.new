/**
 * Google AI Studio / generativelanguage.googleapis.com model IDs (Aug 2026).
 * This app uses Gemini API keys from aistudio.google.com — not Vertex ADC.
 */

export const GEMINI_DEFAULT_MODEL = "gemini-3.6-flash";

/** Cheapest public-chat model; often eligible for AI Studio free-tier quotas. */
export const GEMINI_SALES_LITE_MODEL = "gemini-3.5-flash-lite";

export type GeminiModelOption = {
  id: string;
  labelAr: string;
  labelEn: string;
};

/** Latest documented text models for the admin picker. */
export const GEMINI_MODEL_OPTIONS: readonly GeminiModelOption[] = [
  {
    id: "gemini-3.5-flash-lite",
    labelAr: "فلاش لايت 3.5 — الأوفر (مستشار الزوار)",
    labelEn: "3.5 Flash-Lite — cheapest for visitor chat",
  },
  {
    id: "gemini-3.1-flash-lite",
    labelAr: "فلاش لايت 3.1 — حجم عالٍ رخيص",
    labelEn: "3.1 Flash-Lite — high-volume cheap",
  },
  {
    id: "gemini-3.6-flash",
    labelAr: "فلاش 3.6 — أقوى (مدفوع غالباً)",
    labelEn: "3.6 Flash — stronger, usually billed",
  },
  {
    id: "gemini-3.7-flash",
    labelAr: "فلاش 3.7 — الأحدث",
    labelEn: "3.7 Flash — newest",
  },
  {
    id: "gemini-3.5-flash",
    labelAr: "فلاش 3.5 — أقوى للأعمال المعقدة",
    labelEn: "3.5 Flash — stronger for complex work",
  },
  {
    id: "gemini-3.1-pro-preview",
    labelAr: "برو 3.1 (معاينة) — استدلال أعمق",
    labelEn: "3.1 Pro Preview — deeper reasoning",
  },
] as const;

const LEGACY_MODEL_IDS = new Set([
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.0-pro",
  "gemini-2.0-flash-001",
  "gemini-2.0-flash-lite-001",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-1.5-flash-8b",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro-latest",
  "gemini-pro",
  "gemini-3-flash-preview",
]);

/** Strip `models/` / `.models/` prefixes Google sometimes returns. */
export function stripGeminiModelPrefix(raw: string): string {
  return raw
    .trim()
    .replace(/^\.+/, "")
    .replace(/^models\//, "");
}

/**
 * Normalize a stored or form model ID. Retired 1.5 / 2.0 / 2.5 IDs
 * (and 3 Flash preview) map to the recommended default.
 */
export function normalizeGeminiModelId(raw?: string | null): string {
  if (!raw || !raw.trim()) return GEMINI_DEFAULT_MODEL;
  const id = stripGeminiModelPrefix(raw);
  if (!id || LEGACY_MODEL_IDS.has(id)) return GEMINI_DEFAULT_MODEL;
  return id;
}

export function isGeminiModelUnavailable(
  status: number,
  message: string
): boolean {
  if (status === 404) return true;
  return /no longer available|not found|NOT_FOUND|is not supported/i.test(
    message
  );
}

export function geminiUnavailableMessageAr(
  requested: string,
  fallback: string,
  retried: boolean,
  retryDetail?: string
): string {
  if (retried && retryDetail) {
    return `النموذج «${requested}» غير متاح. جُرّب البديل الموصى به «${fallback}» وفشل أيضاً: ${retryDetail}`;
  }
  return `النموذج «${requested}» غير متاح للمستخدمين الجدد. حدّث الاختيار إلى «${fallback}» (الموصى به من Google AI Studio).`;
}

export function geminiFallbackSuccessMessageAr(
  requested: string,
  used: string
): string {
  return `الاتصال ناجح عبر «${used}». النموذج المحدد «${requested}» لم يعد متاحاً — احفظ «${used}» في الإعدادات.`;
}

export function geminiAuthErrorMessageAr(): string {
  return "المفتاح غير مقبول. استخدم مفتاحاً من Google AI Studio.";
}

export function isGeminiAuthError(message: string): boolean {
  return /api[_ ]?key|invalid|unauthenticated|permission|PERMISSION_DENIED|API_KEY/i.test(
    message
  );
}
