/**
 * Google AI Studio / generativelanguage.googleapis.com model IDs (2026 Standards).
 * Integrates official 2026 Gemini generations (Flash, Flash-Lite, Pro Preview)
 * with Reasoning Modes (Thinking Budget: Low, Medium, High) and token pricing.
 */

export const GEMINI_DEFAULT_MODEL = "gemini-3.6-flash";

/** Cheapest public-chat model; 100% eligible for AI Studio free-tier quotas. */
export const GEMINI_SALES_LITE_MODEL = "gemini-3.5-flash-lite";

export type GeminiReasoningMode = "off" | "low" | "medium" | "high";

export interface GeminiModelInfo {
  id: string;
  name: string;
  labelAr: string;
  labelEn: string;
  tier: "free" | "balanced" | "flagship";
  promptPricePerM: number;     // USD per 1M Input Tokens
  completionPricePerM: number; // USD per 1M Output Tokens (includes generated thinking tokens)
  contextLength: number;       // Context window in tokens
  descriptionAr: string;
  recommendedFor: string;
  isFree: boolean;             // Available in Google AI Studio 100% Free Quota
  supportedReasoningModes: GeminiReasoningMode[];
  defaultReasoningMode: GeminiReasoningMode;
  thinkingBudgetByMode: Record<GeminiReasoningMode, number>;
}

export type GeminiModelOption = {
  id: string;
  labelAr: string;
  labelEn: string;
};

/** Official 2026 Gemini models catalog with reasoning modes & token pricing */
export const GEMINI_2026_MODELS: readonly GeminiModelInfo[] = [
  {
    id: "gemini-3.5-flash-lite",
    name: "Gemini 3.5 Flash-Lite",
    labelAr: "فلاش لايت 3.5 — فائق السرعة والاقتصادي الأول",
    labelEn: "3.5 Flash-Lite — ultra-fast & free tier ready",
    tier: "free",
    promptPricePerM: 0.075,
    completionPricePerM: 0.30,
    contextLength: 1000000,
    descriptionAr: "النموذج الاقتصادي الأسرع على الإطلاق من Google AI Studio، متاح بالحصة المجانية 100% (1,500 طلب/يوم - 0.00$)، مثالي لشات الموقع وتطبيق الجوال.",
    recommendedFor: "استشارات الزوار، تطبيق الجوال، وتصنيف الاستفسارات الخفيفة",
    isFree: true,
    supportedReasoningModes: ["off", "low"],
    defaultReasoningMode: "off",
    thinkingBudgetByMode: { off: 0, low: 1024, medium: 4096, high: 16384 },
  },
  {
    id: "gemini-3.1-flash-lite",
    name: "Gemini 3.1 Flash-Lite",
    labelAr: "فلاش لايت 3.1 — حجم ضخم وتكلفة منخفضة",
    labelEn: "3.1 Flash-Lite — high-volume economical",
    tier: "free",
    promptPricePerM: 0.075,
    completionPricePerM: 0.30,
    contextLength: 1000000,
    descriptionAr: "معالجة مكثفة لحجم بيانات ضخم بتكلفة شبه منعدمة، متوافق بالكامل مع الحصة المجانية.",
    recommendedFor: "الترجمات الجماعية، معالجة الجداول، والتحديثات الدورية",
    isFree: true,
    supportedReasoningModes: ["off", "low"],
    defaultReasoningMode: "off",
    thinkingBudgetByMode: { off: 0, low: 1024, medium: 4096, high: 16384 },
  },
  {
    id: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    labelAr: "فلاش 3.6 — متوازن متعدد القدرات (المعيار الافتراضي)",
    labelEn: "3.6 Flash — balanced & reasoning standard",
    tier: "balanced",
    promptPricePerM: 0.15,
    completionPricePerM: 0.60,
    contextLength: 1000000,
    descriptionAr: "النموذج الشامل الأكثر توازناً، يجمع بين السرعة الفائقة والاستدلال السريع، متاح بالحصة المجانية بحد 15 RPM.",
    recommendedFor: "وكلاء المبيعات، تصميم الرحلات، والتواصل المباشر مع العملاء",
    isFree: true,
    supportedReasoningModes: ["off", "low", "medium"],
    defaultReasoningMode: "low",
    thinkingBudgetByMode: { off: 0, low: 2048, medium: 8192, high: 24576 },
  },
  {
    id: "gemini-3.7-flash",
    name: "Gemini 3.7 Flash",
    labelAr: "فلاش 3.7 — استدلال هجين وتفكير ديناميكي متقدم",
    labelEn: "3.7 Flash — hybrid reasoning & dynamic thinking",
    tier: "balanced",
    promptPricePerM: 0.15,
    completionPricePerM: 0.60,
    contextLength: 1000000,
    descriptionAr: "أحدث أجيال فلاش لدعم التفكير التكيفي (Dynamic Thinking)، ممتاز للتخطيط المعقد وصياغة المقالات التحريرية.",
    recommendedFor: "التخطيط السياحي المتقدم، تدقيق الباقات، وصياغة البرامج",
    isFree: false,
    supportedReasoningModes: ["low", "medium", "high"],
    defaultReasoningMode: "medium",
    thinkingBudgetByMode: { off: 0, low: 2048, medium: 8192, high: 32768 },
  },
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    labelAr: "فلاش 3.8 — الجيل الأحدث والأعلى كفاءة لعام 2026",
    labelEn: "3.8 Flash — newest 2026 cutting-edge generation",
    tier: "flagship",
    promptPricePerM: 0.20,
    completionPricePerM: 0.80,
    contextLength: 1000000,
    descriptionAr: "طراز 2026 الأحدث للاستجابة فائقة الذكاء وإدارة التدفقات التلقائية المتقدمة والربط بين الأنظمة.",
    recommendedFor: "التشغيل الآلي المعقد، تحليل سلوك العملاء، والتكامل الذكي",
    isFree: false,
    supportedReasoningModes: ["low", "medium", "high"],
    defaultReasoningMode: "medium",
    thinkingBudgetByMode: { off: 0, low: 2048, medium: 8192, high: 32768 },
  },
  {
    id: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro Preview",
    labelAr: "برو 3.1 (معاينة) — الاستدلال المعرفي الأعمق والتدقيق السيادي",
    labelEn: "3.1 Pro Preview — deep reasoning & sovereign supervisor",
    tier: "flagship",
    promptPricePerM: 1.25,
    completionPricePerM: 5.00,
    contextLength: 2000000,
    descriptionAr: "القدرة الاستدلالية القصوى لتحليل البيانات الضخمة، مخصص للمشرف العام والتدقيق المالي والسيادي وفحص الأمان.",
    recommendedFor: "المشرف العام (Supervisor Brain)، التدقيق المالي، وحوكمة النظام",
    isFree: false,
    supportedReasoningModes: ["medium", "high"],
    defaultReasoningMode: "high",
    thinkingBudgetByMode: { off: 0, low: 4096, medium: 16384, high: 32768 },
  },
] as const;

/** Latest documented text models for the admin picker (compatible with legacy callers). */
export const GEMINI_MODEL_OPTIONS: readonly GeminiModelOption[] = GEMINI_2026_MODELS.map((m) => ({
  id: m.id,
  labelAr: m.labelAr,
  labelEn: m.labelEn,
}));

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

export function getGeminiModelById(id: string): GeminiModelInfo | undefined {
  const norm = normalizeGeminiModelId(id);
  return GEMINI_2026_MODELS.find((m) => m.id === norm || m.id === id);
}

export function getThinkingBudgetForMode(modelId: string, mode?: GeminiReasoningMode): number {
  const model = getGeminiModelById(modelId);
  const targetMode = mode || model?.defaultReasoningMode || "low";
  if (targetMode === "off") return 0;
  return model?.thinkingBudgetByMode[targetMode] ?? 2048;
}

export function calculateGeminiCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number,
  thinkingTokens: number = 0
): number {
  const model = getGeminiModelById(modelId);
  if (!model) return 0;
  const inCost = (inputTokens / 1_000_000) * model.promptPricePerM;
  const outCost = ((outputTokens + thinkingTokens) / 1_000_000) * model.completionPricePerM;
  return Math.round((inCost + outCost) * 100_000) / 100_000;
}

export const DEFAULT_GEMINI_FALLBACK_CASCADE = {
  tier1: "gemini-3.6-flash",
  tier2: "gemini-3.5-flash-lite",
  tier3: "gemini-3.1-flash-lite",
  tier4: "gemini-3.5-flash-lite",
  enabled: true,
};

export const DEFAULT_GEMINI_AGENT_MODELS: Record<string, string> = {
  planner_concierge: "gemini-3.6-flash",
  sales: "gemini-3.5-flash-lite",
  social: "gemini-3.7-flash",
  app_concierge: "gemini-3.5-flash-lite",
  b2b_landing: "gemini-3.6-flash",
  supervisor: "gemini-3.1-pro-preview",
  ads: "gemini-3.6-flash",
  email: "gemini-3.5-flash-lite",
};

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
