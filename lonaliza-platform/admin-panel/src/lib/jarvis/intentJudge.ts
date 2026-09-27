/**
 * JARVIS Intent Judge & Barge-In Fast Interrupter
 * Lonaliza Sovereign Cyber Operating System
 *
 * Multilingual Intent Classification & Barge-In Interruption Matrix
 * Supports Arabic, Turkish, English, and French
 */

export type IntentCategory =
  | "BARGE_IN"
  | "SUBSTATION_NAVIGATE"
  | "SWARM_DIRECTIVE"
  | "TELEMETRY_QUERY"
  | "CONVERSATION"
  | "PASSIVE_CHATTER";

export interface IntentJudgmentResult {
  category: IntentCategory;
  confidence: number; // 0.0 - 1.0
  targetSectorId?: string;
  targetRoute?: string;
  isBargeIn: boolean;
  cleanDirective?: string;
  detectedLocale: string;
}

// Multilingual Barge-In Stop Words Matrix
export const BARGE_IN_STOP_WORDS_MAP: Record<string, string[]> = {
  ar: ["توقف", "اسكت", "اصمت", "بس", "خلاص", "كافي", "إلغاء", "وقف", "هدوء"],
  tr: ["dur", "sus", "yeter", "tamam", "iptal", "kes", "duraklat"],
  en: ["stop", "pause", "be quiet", "shut up", "cancel", "halt", "silence", "enough"],
  fr: ["arrête", "silence", "assez", "pause", "annule", "tais-toi", "stop"],
};

// All stop words flat set for quick O(1) matching
export const ALL_STOP_WORDS = new Set(
  Object.values(BARGE_IN_STOP_WORDS_MAP).flatMap((words) => words.map((w) => w.toLowerCase()))
);

// Sector trigger keywords across 4 languages
interface SectorTrigger {
  sectorId: string;
  keywords: string[];
}

const SECTOR_TRIGGERS: SectorTrigger[] = [
  {
    sectorId: "sector-flights",
    keywords: [
      "طيران", "رحلات", "تذاكر", "مطار", "amadeus", "gds",
      "uçuş", "uçak", "bilet", "havalimanı", "flight", "flights", "airline", "vol", "vols", "billet"
    ],
  },
  {
    sectorId: "sector-hotels",
    keywords: [
      "فندق", "فنادق", "غرف", "حجز فندقي", "ضيافة", "bedbanks",
      "otel", "oteller", "konaklama", "oda", "hotel", "hotels", "rooms", "hébergement", "chambres"
    ],
  },
  {
    sectorId: "sector-fleet",
    keywords: [
      "سيارات", "نقل", "توصيل", "أسطول", "سائق",
      "transfer", "araç", "araba", "filo", "şoför", "cars", "fleet", "transfers", "véhicules"
    ],
  },
  {
    sectorId: "sector-packages",
    keywords: [
      "باقات", "عطلات", "جولات", "تأشيرات", "برامج سياحية",
      "tur", "turlar", "tatil", "vize", "paket", "packages", "tours", "holidays", "visa", "vacances"
    ],
  },
  {
    sectorId: "sector-b2b",
    keywords: [
      "شركاء", "وكالات", "موزعين", "b2b", "وايت ليبل", "ديبوزيت",
      "bayi", "acente", "ortak", "resale", "whitelabel", "distributor", "agences", "partenaires"
    ],
  },
  {
    sectorId: "sector-treasury",
    keywords: [
      "مالية", "خزينة", "دفع", "فواتير", "عملات", "استرداد", "مدفوعات",
      "ödeme", "muhasebe", "fatura", "kasa", "kur", "cüzdan", "finance", "payments", "treasury", "invoices", "paiements"
    ],
  },
  {
    sectorId: "sector-growth",
    keywords: [
      "تسويق", "إعلانات", "كوبونات", "عمولة", "حملات", "نمو",
      "pazarlama", "reklam", "kupon", "affiliate", "marketing", "ads", "coupons", "croissance", "publicité"
    ],
  },
  {
    sectorId: "sector-publishing",
    keywords: [
      "نشر", "محتوى", "مدونة", "سوشيال", "ريلز", "مقالات",
      "yayın", "içerik", "blog", "makale", "medya", "publish", "blog", "content", "social", "articles"
    ],
  },
  {
    sectorId: "sector-apps",
    keywords: [
      "تطبيق", "موبايل", "pwa", "محرر", "واجهة", "تخصيص",
      "mobil", "uygulama", "tasarım", "editor", "mobile", "app", "ui", "visual", "application"
    ],
  },
  {
    sectorId: "sector-brain",
    keywords: [
      "وكلاء", "مشرف", "أتمتة", "ذاكرة", "سيرفرات", "qdrant", "ذكاء",
      "ajan", "otomasyon", "beyin", "hafıza", "swarm", "agents", "automation", "memory", "intelligence"
    ],
  },
];

export class IntentJudge {
  /**
   * Fast check for Barge-In interruption (called on every raw STT word)
   */
  public static isBargeIn(text: string): boolean {
    const tokens = text.toLowerCase().trim().split(/\s+/);
    for (const token of tokens) {
      const stripped = token.replace(/[^a-zA-Z\u0621-\u064Açğıöşüéèàê]/g, "");
      if (ALL_STOP_WORDS.has(stripped)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Evaluates user utterance and determines the appropriate sovereign action
   */
  public static judge(text: string, defaultLocale = "ar"): IntentJudgmentResult {
    const trimmed = text.trim();
    if (!trimmed) {
      return {
        category: "PASSIVE_CHATTER",
        confidence: 0,
        isBargeIn: false,
        detectedLocale: defaultLocale,
      };
    }

    // 1. Barge-In check
    if (this.isBargeIn(trimmed)) {
      return {
        category: "BARGE_IN",
        confidence: 0.99,
        isBargeIn: true,
        detectedLocale: defaultLocale,
      };
    }

    const lower = trimmed.toLowerCase();

    // 2. Navigation Intent Check (Open Sub-Station HUD)
    const navVerbs = [
      "افتح", "عرض", "أظهر", "شغل", "انتقل إلى", "محطة", "قسم",
      "aç", "göster", "git", "bölümü", "istasyonu",
      "open", "show", "navigate", "display", "view", "go to",
      "ouvre", "affiche", "montre", "consulte"
    ];

    const hasNavVerb = navVerbs.some((verb) => lower.includes(verb));

    for (const trigger of SECTOR_TRIGGERS) {
      const match = trigger.keywords.some((kw) => lower.includes(kw));
      if (match) {
        if (hasNavVerb || lower.length < 35) {
          return {
            category: "SUBSTATION_NAVIGATE",
            confidence: hasNavVerb ? 0.95 : 0.82,
            targetSectorId: trigger.sectorId,
            isBargeIn: false,
            cleanDirective: trimmed,
            detectedLocale: defaultLocale,
          };
        }
      }
    }

    // 3. Telemetry Query Intent
    const telemetryVerbs = [
      "كم", "ما هو", "إحصائيات", "تقرير", "معدل", "نسبة",
      "kaç", "durum", "rapor", "oran", "ne kadar",
      "how many", "what is", "stats", "telemetry", "metrics", "rate",
      "combien", "statistiques", "rapport", "taux"
    ];

    if (telemetryVerbs.some((v) => lower.includes(v))) {
      return {
        category: "TELEMETRY_QUERY",
        confidence: 0.88,
        isBargeIn: false,
        cleanDirective: trimmed,
        detectedLocale: defaultLocale,
      };
    }

    // 4. Swarm Directive Intent
    const directiveVerbs = [
      "وجه", "أمر", "كلف", "ابدأ", "أصلح", "نفذ", "عدل",
      "yönlendir", "görevlendir", "başlat", "uygula", "düzelt",
      "direct", "command", "assign", "launch", "execute", "optimize",
      "dirige", "ordonne", "lance", "exécute"
    ];

    if (directiveVerbs.some((v) => lower.includes(v)) || trimmed.length > 25) {
      return {
        category: "SWARM_DIRECTIVE",
        confidence: 0.90,
        isBargeIn: false,
        cleanDirective: trimmed,
        detectedLocale: defaultLocale,
      };
    }

    // Default conversational query
    return {
      category: "CONVERSATION",
      confidence: 0.75,
      isBargeIn: false,
      cleanDirective: trimmed,
      detectedLocale: defaultLocale,
    };
  }
}
