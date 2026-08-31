/** Shared estimate + WhatsApp confirmation copy for chat, programs, and PDF. */

export const PRICE_ESTIMATE_AR =
  "السعر المعروض تقديري حسب أسعار السوق الحالية. للتأكيد النهائي تواصل مع خدمة العملاء عبر واتساب.";

export const PRICE_ESTIMATE_EN =
  "The displayed price is an estimate based on current market rates. For a confirmed final price, contact customer service on WhatsApp.";

export const PRICE_ESTIMATE_TR =
  "Görünen fiyat güncel piyasa oranlarına dayalı bir tahmindir. Kesin fiyat için müşteri hizmetlerine WhatsApp üzerinden ulaşın.";

export const MARKET_PRICING_RULES = `قواعد التسعير الإلزامية (أسعار سوق تركيا الواقعية — لا تخترع أرقاماً فلكية):

ابنِ السعر من مكونات حقيقية ثم طبّق هامش الوكالة المحدد فقط (لا تضاعف 2× أو 3×):

أسعار ليلية تقريبية لفندق 4–5 نجوم (غرفة مزدوجة، 2026):
- إسطنبول 4★: 80–150 دولار/ليلة | 5★: 150–280 دولار/ليلة
- أنطاليا/بليك/كيمر شاطئ 5★ شامل كلي: 180–380 دولار/ليلة للغرفة
- طرابزون/ريزه/آيدر 4–5★: 70–160 دولار/ليلة
- كابادوكيا كهف 4–5★: 120–260 دولار/ليلة
- سبانجا/بورصة: 70–140 دولار/ليلة

ترانسفير خاص (سيارة خاصة، اتجاه واحد):
- مطار ↔ فندق المدينة: 25–70 دولار
- أنطاليا المطار ↔ بليك/لارا: 35–80 دولار

جولات يومية خاصة (سيارة + سائق، بدون تذاكر طيران):
- جولة مدينة كلاسيكية: 80–180 دولار للمجموعة الصغيرة
- شلالات/جبال/طبيعة: 90–200 دولار
- حديقة ترفيه (لاند أوف ليجندز وأمثالها تذاكر دخول): 45–90 دولار للشخص

لا تُدرج تذكرة طيران حيّة داخل سعر البرنامج. الإقامة + الترانسفير + الجولات المدرجة فقط.
اعرض السعر النهائي للعميل بعد الهامش بالدولار (USD) كـ totalClientPrice.
لا تكشف نسبة الهامش ولا تكلفة الوكالة.`;

export function digitsWhatsApp(raw: string): string {
  return String(raw || "").replace(/\D/g, "");
}

export function whatsappMeUrl(raw: string): string {
  const digits = digitsWhatsApp(raw);
  return digits ? `https://wa.me/${digits}` : "";
}

export function replyHasEstimateNote(reply: string): boolean {
  const t = String(reply || "");
  return /سعر(?:ي)? تقديري|تقديري حسب|واتساب|WhatsApp|tahmin/i.test(t);
}

export function appendEstimateNote(
  reply: string,
  locale: "ar" | "en" | "tr",
  whatsapp: string
): string {
  if (replyHasEstimateNote(reply)) return reply;
  const note =
    locale === "tr"
      ? PRICE_ESTIMATE_TR
      : locale === "en"
        ? PRICE_ESTIMATE_EN
        : PRICE_ESTIMATE_AR;
  const digits = digitsWhatsApp(whatsapp);
  const wa =
    locale === "ar"
      ? digits
        ? `واتساب خدمة العملاء: https://wa.me/${digits}`
        : ""
      : locale === "tr"
        ? digits
          ? `Müşteri hizmetleri WhatsApp: https://wa.me/${digits}`
          : ""
        : digits
          ? `Customer service WhatsApp: https://wa.me/${digits}`
          : "";
  return [reply.trim(), note, wa].filter(Boolean).join("\n\n");
}
