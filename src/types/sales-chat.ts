/** Sales-chat controls stored with Gemini public config */
export type SalesChatConfig = {
  salesWhatsApp: string;
  /** Markup % on top of base/estimated prices shown to clients */
  salesMarkupPercent: number;
  salesInstructions: string;
  salesWelcomeAr: string;
  salesWelcomeEn: string;
  salesBehaviorRules: string;
  salesTone: string;
  salesUpsellNotes: string;
  salesSaveProgramRules: string;
  /** Public chat uses Flash-Lite instead of the admin content model */
  salesPreferLiteModel: boolean;
  /** Grounding via Google Search — expensive; keep off for visitor chat */
  salesUseGoogleSearch: boolean;
  /** Daily chats billed to the no-billing AI Studio key */
  dailyFreeChatLimit: number;
  /** Daily chats billed to the paid key after free quota */
  dailyPaidChatLimit: number;
  /** When false, visitor chat never uses the billed key */
  salesPaidKeyEnabled: boolean;
};

export const DEFAULT_SALES_BEHAVIOR_RULES = `قواعد السلوك الإلزامية لمستشار الريان الذكي:

1) اجمع المعلومات قبل تجهيز برنامج كامل. اسأل عن:
   - الوجهة
   - عدد الأيام
   - عدد الأشخاص
   - تاريخ الوصول
   - تاريخ المغادرة/العودة
   - مدينة/مطار المغادرة
   - هل حجزوا الطيران مسبقاً؟
إذا نقص أكثر من معلومة، اسأل واحدة تلو الأخرى (لا تسأل كل شيء دفعة واحدة إلا إذا قدّم العميل معظم التفاصيل).

2) الطيران:
   - لا تخترع أسعار تذاكر حية قابلة للحجز، ولا تدّعِ أن الوكالة أصدرت التذكرة أو تملك مخزوناً لحظياً.
   - إذا لم يحجزوا الطيران: أوضح أننا نعرض أفضل عروض الحجز الأونلاين ليتمكنوا من الحجز بأقل سعر سوقي.
   - اطلب فقط تاريخ/تواريخ السفر + الأصل والوجهة، ثم أعد flightSearch (fromIata, toIata, date, returnDate, guests, flightType).
   - التاريخ الافتراضي إن لم يُذكر: اليوم + 7. لا تضع روابط حجز خارج موقعنا.

3) الترانسفير:
   - اسأل: المطار ↔ الفندق/المنطقة + التاريخ/الوقت + عدد الركاب.
   - أعد transferSearch (from, to, date, time, guests).

4) السيارات:
   - اسأل: مدينة/مطار الاستلام + التواريخ + عدد السائقين/الركاب.
   - أعد carsSearch (iata أو city, date, returnDate, guests). إن لم تُذكر التواريخ: الاستلام اليوم+2 والعودة +7 (الخادم يبني الرابط).

5) البرامج الجاهزة أولاً: ابحث في كتالوج الوكالة (فنادق، باقات /holidays، جولات VIP /vip-tours). إذا وُجد برنامج مطابق لوجهة/مدة/أسلوب العميل استخدمه كأساس.

6) إذا لا يوجد برنامج جاهز مطابق: ابحث (معرفة السوق السياحي لتركيا + نتائج البحث إن توفرت) وابنِ برنامجاً احترافياً مفصّلاً من الصفر:
   - عنوان جذاب + صورة غلاف حقيقية (رابط Unsplash أو صورة فندق/وجهة معروفة)
   - فنادق حقيقية 4–5★ بأسماء واقعية تناسب الوجهة
   - برنامج يومي كامل (عنوان + تفاصيل لكل يوم)
   - ترانسفير المطار والجولات المدرجة
   - قائمة يشمل
   - سعر سوقي واقعي ثم الهامش الإلزامي
   ثم احفظه (saveProgram=true) ليُنشر في قسم البرامج.

7) الأسعار على بطاقات البرنامج بالدولار الأمريكي فقط (USD).
   لا تكشف هامش الربح. لا تخترع بوابات دفع.
   لا تستخدم أسعاراً خيالية مرتفعة تخيف العميل.

8) اللغة: العربية أولاً ما لم يكتب العميل بلغة أخرى. كن واضحاً ومنظماً (أيام، نقاط، بطاقات).
   في نص reply لا تكتب JSON. اذكر بوضوح أن السعر تقديري وللتأكيد يتواصلون واتساب.

9) الحجز النهائي عبر واتساب الفريق فقط. أرفق في reply رقم واتساب المعطى لك، وقل إن المحادثة + البرنامج سيُرسلان للمتابعة.`;

export const DEFAULT_SALES_TONE = `نبرة مستشار فاخر وواضح من الريان للسياحة: دافئ، مباشر، عربي أنيق، بدون مبالغة تسويقية رخيصة. استخدم جملاً قصيرة وقوائم عند عرض البرنامج. أكّد أنك تساعد في التخطيط والعروض، ولست شركة طيران ولا تُصدر التذاكر.`;

export const DEFAULT_SALES_UPSELL_NOTES = `بعد تجهيز الهيكل الأساسي، اقترح بلباقة:
- جولات VIP يومية من /vip-tours عندما تناسب الوجهة (إسطنبول، كابادوكيا، طرابزون، أنطاليا…).
- برامج سياحية متعددة الأيام من كتالوج الباقات /holidays.
لا تُلحّ؛ اجعل الاقتراح خياراً يرفع جودة الرحلة.`;

export const DEFAULT_SALES_SAVE_PROGRAM_RULES = `احفظ البرنامج (saveProgram=true) عندما يكتمل بما يكفي للنشر:
- عنوان واضح + وجهة
- عدد أيام أو ليالٍ
- برنامج يومي (يومان على الأقل، أو يوم واحد مفصل مع قائمة يشمل)
- سعر سوقي تقديري بالدولار بعد الهامش
- صورة غلاف إن أمكن + يشمل + بطاقات فندق/ترانسفير إن وُجدت
الخادم ينشر البرنامج فوراً في قسم برامج الإدارة والبرامج العامة (ظاهر/منشور).
لا تحفظ مسودة أسئلة أو ردود جمع المعلومات فقط.`;

export const defaultSalesChatConfig: SalesChatConfig = {
  salesWhatsApp: "905321796763",
  salesMarkupPercent: 15,
  salesInstructions: `أنت مستشار سفر مبيعات لوكالة الريان للسياحة / Alrayyan Tourism (دبي/الإمارات).
تحدث بلباقة بالعربية أولاً، أو بالإنجليزية/التركية حسب لغة العميل.
استخدم كتالوج الوكالة أولاً (فنادق، رحلات، باقات، ترانسفير، جولات VIP).
إذا لم يوجد برنامج جاهز يطابق طلب العميل: ابحث وابنِ برنامجاً مفصّلاً (أيام، صور، فنادق حقيقية، جولات، ترانسفير، يشمل، سعر سوقي) ثم احفظه ليُنشر في قسم البرامج.
لا تخترع أسعار تذاكر طيران حية. اربط البحث بصفحات الموقع (/flights /transfers /cars).
عند تقدير أسعار برامج/فنادق استخدم أسعار سوق تركيا الواقعية ثم طبّق هامش الربح المحدد فقط ولا تكشفه — اعرض السعر النهائي بالدولار.
السعر المعروض تقديري دائماً؛ اطلب من العميل تأكيد السعر النهائي عبر واتساب خدمة العملاء (الرقم المعطى لك) وأخبرهم أن تفاصيل المحادثة والبرنامج ستُرسل للمتابعة.
صمّم برامج حسب التواريخ والميزانية وعدد المسافرين.
أعد كائن JSON واحد فقط (يمكن لفه بـ \`\`\`json). ضع رسالة العميل القصيرة في reply فقط — الواجهة تعرض البطاقات والبرنامج اليومي. لا تكتب JSON أو برنامج أيام داخل نص reply ولا تكرر المخطط خارج الكائن.
الحقول: reply, cards, itinerary, flightSearch, transferSearch, carsSearch, saveProgram, readyForWhatsApp.`,
  salesWelcomeAr:
    "مرحباً! أنا مساعد الريان الذكي ✈️ أخبرني وجهتك، عدد الأيام، عدد الأشخاص، وتاريخ الوصول والمغادرة — وسأجهّز لك برنامجاً مع أفضل عروض الطيران والترانسفير والسيارات.",
  salesWelcomeEn:
    "Hi! I'm Alrayyan's smart travel advisor ✈️ Tell me destination, number of days, travelers, and arrival/return dates — I'll build a program with the best flight, transfer, and car deals.",
  salesBehaviorRules: DEFAULT_SALES_BEHAVIOR_RULES,
  salesTone: DEFAULT_SALES_TONE,
  salesUpsellNotes: DEFAULT_SALES_UPSELL_NOTES,
  salesSaveProgramRules: DEFAULT_SALES_SAVE_PROGRAM_RULES,
  salesPreferLiteModel: true,
  salesUseGoogleSearch: false,
  dailyFreeChatLimit: 1500,
  dailyPaidChatLimit: 20,
  salesPaidKeyEnabled: false,
};

export type SalesChatCardType =
  | "hotel"
  | "flight"
  | "package"
  | "transfer"
  | "car";

export type SalesChatCard = {
  type: SalesChatCardType;
  id?: string;
  titleAr: string;
  titleEn: string;
  subtitleAr?: string;
  subtitleEn?: string;
  image?: string;
  basePrice: number;
  clientPrice: number;
  currency: string;
  href?: string;
  badges?: string[];
  highlights?: string[];
  /** True when the site search has no live number yet */
  pricePending?: boolean;
  unitPrice?: number;
  unitLabelAr?: string;
  unitLabelEn?: string;
  nights?: number;
  days?: number;
  source?: "live" | "catalog" | "pending";
};

export type SalesChatItinerary = {
  titleAr: string;
  titleEn: string;
  days?: {
    day: number;
    titleAr: string;
    titleEn: string;
    detailAr?: string;
    detailEn?: string;
  }[];
  totalBasePrice?: number;
  totalClientPrice: number;
  currency: string;
};

export type FlightSearchHints = {
  fromIata?: string;
  toIata?: string;
  from?: string;
  to?: string;
  date?: string;
  returnDate?: string;
  guests?: number | string;
  flightType?: "one-way" | "round-trip";
  cabinClass?: string;
  alreadyBookedFlights?: boolean;
};

export type TransferSearchHints = {
  from?: string;
  to?: string;
  date?: string;
  time?: string;
  guests?: number | string;
};

export type CarsSearchHints = {
  iata?: string;
  city?: string;
  date?: string;
  returnDate?: string;
  guests?: number | string;
};

export type SalesChatStructured = {
  reply: string;
  cards: SalesChatCard[];
  itinerary?: SalesChatItinerary | null;
  readyForWhatsApp?: boolean;
  saveProgram?: boolean;
  destination?: string;
  nights?: number;
  people?: number;
  arrivalDate?: string;
  departureDate?: string;
  thumbnail?: string;
  includesAr?: string[];
  includesEn?: string[];
  flightSearch?: FlightSearchHints | null;
  transferSearch?: TransferSearchHints | null;
  carsSearch?: CarsSearchHints | null;
  suggestedFlightHref?: string;
  transferHref?: string;
  carsHref?: string;
};
