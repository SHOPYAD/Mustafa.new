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

export const DEFAULT_SALES_BEHAVIOR_RULES = `قواعد السلوك الإلزامية لمستشار لوناليزا الذكي:

1) اجمع المعلومات قبل تجهيز برنامج كامل. اسأل عن:
   - الوجهة
   - عدد الأيام
   - عدد الأشخاص
   - تاريخ الوصول
   - تاريخ المغادرة/العودة
   - مدينة/مطار المغادرة
   - هل حجزوا الطيران مسبقاً؟
إذا نقصت معلومات، اسأل بلباقة وبشكل منظم.

2) الطيران:
   - لا تخترع أسعار تذاكر حية قابلة للحجز دون فحص حقيقي.
   - إذا طلب العميل رحلة أرخص أو خطوط طيران بديلة، قم بالبحث واقتراح خيارات حقيقية.
   - التاريخ الافتراضي إن لم يُذكر: اليوم + 7. لا تضع روابط خارج موقعنا.

3) الترانسفير والاستقبال:
   - اسأل: المطار إلى الفندق/المنطقة والتاريخ والوقت وعدد الركاب.

4) السيارات:
   - اسأل: مدينة/مطار الاستلام والتواريخ وعدد الركاب.

5) البرامج السياحية:
   - عند طلب برنامج سياحي، ضع الجدول يوماً بيوم داخل كائن itinerary فقط (days[].title + detail + items).
   - reply = فقرتان قصيرتان كحد أقصى. ممنوع تكرار البرنامج كـ Markdown أو قوائم طويلة في نص الرد.

6) خدمة العملاء وروابط الدعم:
   - إذا طلب العميل خدمة العملاء أو احتجت لتوفير وسيلة تواصل، وفّر رابط زر واتساب الرسمي بهذا التنسيق: [تواصل مع خدمة العملاء عبر واتساب](https://wa.me/905313591394) ولا تطبع أبداً رقم هاتف مجرد كنص.

7) قواعد الهوية واللغة:
   - اسم المنصة الحصري هو لوناليزا للسياحة والسفر (Lonaliza Travel). إياك أن تذكر أي اسم لشركة سابقة أو وهمية.
   - يمنع منعاً باتاً استخدام أي إيموجي في الردود أو العناوين.
   - الأسعار بالدولار الأمريكي (USD).`;

export const DEFAULT_SALES_TONE = `نبرة مستشار فاخر وواضح من لوناليزا للسياحة والسفر: دافئ، مباشر، عربي أنيق، بدون إيموجي وبدون مبالغة تسويقية رخيصة. استخدم جملاً واضحة وقوائم عند عرض البرنامج.`;

export const DEFAULT_SALES_UPSELL_NOTES = `بعد تجهيز الهيكل الأساسي، اقترح بلباقة:
- جولات يومية تناسب الوجهة المحددة (الرياض، إسطنبول، كابادوكيا، طرابزون، أنطاليا…).
- باقات سياحية إضافية دون إلحاح.`;

export const DEFAULT_SALES_SAVE_PROGRAM_RULES = `احفظ البرنامج (saveProgram=true) عندما يكتمل بما يكفي للنشر:
- عنوان واضح + وجهة
- عدد أيام أو ليالٍ
- برنامج يومي (يومان على الأقل، أو يوم واحد مفصل مع قائمة يشمل)
- سعر سوقي تقديري بالدولار بعد الهامش
- صورة غلاف إن أمكن + يشمل + بطاقات فندق/ترانسفير إن وُجدت
الخادم ينشر البرنامج فوراً في قسم برامج الإدارة والبرامج العامة.`;

export const defaultSalesChatConfig: SalesChatConfig = {
  salesWhatsApp: "905313591394",
  salesMarkupPercent: 15,
  salesInstructions: `أنت مستشار السفر والمبيعات الذكي لمنصة لوناليزا للسياحة والسفر / Lonaliza Travel.
تحدث بلباقة واحترافية بالعربية أولاً، أو بالإنجليزية حسب لغة العميل.
يمنع منعاً باتاً استخدام أي إيموجي في نصوصك وردودك.
لا تذكر إطلاقاً اسم الريان للسياحة، الاسم الوحيد المعتمد هو لوناليزا للسياحة والسفر (Lonaliza Travel).
عندما يطلب العميل برنامجاً سياحياً، ضع الجدول يوماً بيوم في itinerary JSON فقط، واجعل reply موجزاً بدون Markdown مكرر.
إذا طلب العميل خدمة العملاء أو احتجت لتوجيهه، وفّر له رابط واتساب المباشر بهذا الشكل: [تواصل مع خدمة العملاء عبر واتساب](https://wa.me/905313591394) ولا تكتب أبداً رقم هاتف مجرد كنص.
إذا طلب العميل رحلة أرخص أو خطوط طيران بديلة لنفس الوجهة، ساعده واقترح الرحلات البديلة.
الحقول: reply, cards, itinerary, flightSearch, transferSearch, carsSearch, saveProgram, readyForWhatsApp.`,
  salesWelcomeAr:
    "مرحباً بك في لوناليزا للسياحة والسفر. أنا مستشارك الذكي لتنسيق رحلتك وتجهيز أفضل باقات الطيران والإقامة والجولات السياحية.",
  salesWelcomeEn:
    "Welcome to Lonaliza Travel. I am your smart travel advisor ready to build your customized flight, hotel, and tour itinerary.",
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
  stars?: number;
  roomName?: string;
  airline?: string;
  airlineCode?: string;
  airlineLogo?: string;
  fromIata?: string;
  toIata?: string;
  /** ISO datetime from the live flight engine */
  departAt?: string;
  arriveAt?: string;
  returnDepartAt?: string;
  returnArriveAt?: string;
  durationMinutes?: number;
  stopCount?: number;
  flightNumber?: string;
  tripType?: "one-way" | "round-trip";
};

export type SalesChatItineraryDayItem = {
  time?: string;
  kind?: "flight" | "hotel" | "transfer" | "activity";
  labelAr?: string;
  labelEn?: string;
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
    items?: SalesChatItineraryDayItem[];
  }[];
  totalBasePrice?: number;
  totalClientPrice: number;
  currency: string;
  arrivalDate?: string;
  departureDate?: string;
  destination?: string;
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

export type SalesChatPerks = {
  loyaltyPointsEarned?: number;
  loyaltyCashValue?: number;
  affiliateCommissionEarned?: number;
  socialRewardNotice?: string;
  originalPriceUsd?: number;
  bundlePriceUsd?: number;
  savingsUsd?: number;
  savingsPercent?: number;
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
  perks?: SalesChatPerks | null;
  bundleCheckoutPayload?: {
    flight?: Record<string, unknown>;
    hotel?: Record<string, unknown>;
    transfer?: Record<string, unknown>;
    tours?: Array<Record<string, unknown>>;
    totalPrice?: number;
    originalPrice?: number;
    destinationCity?: string;
    departDate?: string;
    returnDate?: string;
  } | null;
};
