import {
  AUTOMATION_TIMEZONE,
  isAutomationJobType,
  type AutomationJobInput,
  type AutomationJobType,
  type AutomationLocale,
} from "./types";

const TYPE_HINTS: Array<{ type: AutomationJobType; keys: string[] }> = [
  { type: "articles.translate", keys: ["ترجم", "ترجمة", "translate"] },
  { type: "articles.research_and_publish", keys: ["مقال", "مقالة", "مقالات", "article", "blog"] },
  { type: "trips.discover_and_draft", keys: ["رحلة", "رحلات", "trip", "trips"] },
  { type: "programs.discover_and_draft", keys: ["برنامج", "برامج", "program"] },
  { type: "activities.discover_and_draft", keys: ["نشاط", "أنشطة", "activity"] },
  { type: "leads.whatsapp_campaign", keys: ["واتساب", "whatsapp", "واتس"] },
  { type: "leads.telegram_campaign", keys: ["تلغرام", "تيليغرام", "telegram"] },
  { type: "leads.email_campaign", keys: ["إيميل", "ايميل", "بريد", "email"] },
  { type: "otp.send", keys: ["otp", "رمز تحقق"] },
  { type: "booking.abandoned_reminder", keys: ["حجز متروك", "سلة", "abandoned"] },
  { type: "booking.post_trip_review", keys: ["تقييم", "مراجعة", "review"] },
  { type: "visa.alert", keys: ["تأشيرة", "فيزا", "visa"] },
  { type: "marketing.seasonal_campaign", keys: ["موسم", "موسمية", "seasonal"] },
  { type: "pricing.watch", keys: ["سعر", "أسعار", "price"] },
  { type: "marketing.birthday_offer", keys: ["ميلاد", "birthday"] },
  { type: "leads.score", keys: ["درجة", "score", "تقييم عميل"] },
  { type: "studio.weekly_plan", keys: ["خطة أسبوع", "خطة محتوى", "weekly plan"] },
  { type: "studio.generate_image", keys: ["صورة", "nano banana", "ولّد صورة"] },
  { type: "studio.generate_video", keys: ["فيديو", "ريل", "veo", "omni"] },
  { type: "studio.schedule_publish", keys: ["جدول نشر", "انشر لاحقا", "schedule publish"] },
  { type: "admin.weekly_digest", keys: ["ملخص أسبوعي", "digest"] },
  { type: "places.reviews", keys: ["جوجل ماب", "تقييمات النشاط", "places"] },
  { type: "ads.ctwa_lookalike", keys: ["lookalike", "واتساب إعلان", "ctwa", "جمهور مشابه"] },
];

function inferType(text: string): AutomationJobType {
  const lower = text.toLowerCase();
  for (const row of TYPE_HINTS) {
    if (row.keys.some((key) => lower.includes(key.toLowerCase()))) return row.type;
  }
  return "articles.research_and_publish";
}

function inferCron(text: string): string {
  const lower = text.toLowerCase();
  if (/أسبوع|weekly|كل أسبوع/.test(lower)) return "0 9 * * 1";
  if (/ساع|hourly|كل ساعة/.test(lower)) return "0 * * * *";
  if (/شهر|monthly/.test(lower)) return "0 9 1 * *";
  return "0 9 * * *";
}

function inferCount(text: string, fallback: number): number {
  const match = text.match(/(\d+)\s*(مقال|رحلة|برنامج|نشاط|رسالة|article|trip|item)?/i);
  if (!match) return fallback;
  const n = Number(match[1]);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(50, Math.round(n));
}

function inferLocales(text: string): AutomationLocale[] {
  const found: AutomationLocale[] = [];
  if (/عربي|arabic|\bar\b/i.test(text)) found.push("ar");
  if (/ترك|turkish|\btr\b/i.test(text)) found.push("tr");
  if (/إنجل|انجليز|english|\ben\b/i.test(text)) found.push("en");
  return found.length ? found : ["ar", "tr", "en"];
}

/**
 * Best-effort Arabic/English brief → job draft.
 * Copilot should still call upsertAutomationJob with structured fields.
 */
export function parseAutomationPrompt(prompt: string, typeHint?: string): AutomationJobInput {
  const text = prompt.trim();
  const type = isAutomationJobType(typeHint) ? typeHint : inferType(text);
  const count = inferCount(text, 3);
  const dryRun = /تجريب|dry\s*-?run|بدون نشر/i.test(text);
  const enabled = !/إيقاف|pause|disable|عطّل/i.test(text);
  return {
    name: text.slice(0, 80) || type,
    type,
    enabled,
    cron: inferCron(text),
    timezone: AUTOMATION_TIMEZONE,
    maxPerRun: count,
    maxPerDay: Math.max(count, count * 2),
    locales: inferLocales(text),
    dryRun,
    consentSource: /crm|موافقة|opt-?in|عملاء/i.test(text) ? "crm_opt_in" : undefined,
    settings: { sourcePrompt: text },
  };
}
