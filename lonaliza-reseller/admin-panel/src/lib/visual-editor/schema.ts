import type { Locale } from "@/lib/i18n/types";

export const HOMEPAGE_SECTION_TYPES = [
  "hero",
  "search",
  "categories",
  "destinations",
  "banners",
  "flashDeals",
  "packages",
  "hotels",
  "cars",
  "transfers",
  "visa",
  "flightDeals",
  "vipTours",
  "coupons",
  "points",
  "affiliate",
  "whyUs",
  "stats",
  "testimonials",
  "trust",
  "partners",
  "blog",
  "newsletter",
  "contact",
  "cta",
  "copilot", /* Agent C: copilot pipeline */
] as const;

export type HomepageSectionType = (typeof HOMEPAGE_SECTION_TYPES)[number];

export const HOMEPAGE_SECTION_CATEGORIES = [
  "hero",
  "services",
  "offers",
  "rewards",
  "destinations",
  "story",
] as const;

export type HomepageSectionCategory = (typeof HOMEPAGE_SECTION_CATEGORIES)[number];

export type HeroPackageSource = "live" | "custom";

export const HERO_OFFER_KINDS = [
  "package",
  "hotel",
  "flight",
  "transfer",
  "car",
  "visa",
  "tour",
] as const;

export type HeroOfferKind = (typeof HERO_OFFER_KINDS)[number];

export function isHeroOfferKind(value: unknown): value is HeroOfferKind {
  return (HERO_OFFER_KINDS as readonly string[]).includes(String(value || ""));
}

/** One hero offer card — live catalog id (any site service) or a custom editor card. */
export type HeroPackageItem = {
  id: string;
  source: HeroPackageSource;
  kind?: HeroOfferKind;
  liveId?: string;
  titleAr?: string;
  titleEn?: string;
  titleTr?: string;
  taglineAr?: string;
  taglineEn?: string;
  taglineTr?: string;
  image?: string;
  price?: number;
  href?: string;
};

export const HERO_PACKAGE_SETTING_KEYS = [
  "showHeroPackages",
  "heroPackageIds",
  "heroCustomPackages",
  "heroPackagesJson",
] as const;

export type LocalizedCopy = {
  ar: string;
  en: string;
  tr: string;
  fr?: string;
  [lang: string]: string | undefined;
};

export type SectionStyles = {
  background: string;
  accent: string;
  textColor: string;
  overlay: string;
  /* Agent E: settings panel + card design */
  cardWidth?: string;
  cardMinHeight?: string;
  cardBorderWidth?: string;
  cardBorderColor?: string;
  cardBorderStyle?: string;
  cardRadius?: string;
  cardPadding?: string;
  cardShadow?: string;
  cardBackground?: string;
  cardImageHeight?: string;
  cardTitleSize?: string;
  cardDescSize?: string;
  cardPriceSize?: string;
  cardColumns?: string;
  buttonRadius?: string;
  buttonPadding?: string;
  buttonBg?: string;
  buttonColor?: string;
  buttonBorder?: string;
  buttonHoverBg?: string;
};

export type CardStyleKey =
  | "cardWidth"
  | "cardMinHeight"
  | "cardBorderWidth"
  | "cardBorderColor"
  | "cardBorderStyle"
  | "cardRadius"
  | "cardPadding"
  | "cardShadow"
  | "cardBackground"
  | "cardImageHeight"
  | "cardTitleSize"
  | "cardDescSize"
  | "cardPriceSize"
  | "cardColumns"
  | "buttonRadius"
  | "buttonPadding"
  | "buttonBg"
  | "buttonColor"
  | "buttonBorder"
  | "buttonHoverBg";

export type HomepageSectionInstance = {
  instanceId: string;
  type: HomepageSectionType;
  hidden: boolean;
  texts: Record<string, LocalizedCopy>;
  styles: SectionStyles;
  settings: Record<string, string | number | boolean>;
};

export type HomepageTemplateDraft = {
  layout: HomepageSectionInstance[];
  global: {
    navy: string;
    emerald: string;
  };
  elementOverrides?: Record<string, Record<string, unknown>>;
};

export type HomepageTemplateFile = {
  version: number;
  updatedAt: string;
  publishedAt: string | null;
  draft: HomepageTemplateDraft;
  published: HomepageTemplateDraft | null;
};

export const TEMPLATE_SEED_VERSION = 5;

/** Hidden from ADD SECTIONS — merged into `contact`. Type kept for old drafts. */
export const HOMEPAGE_CATALOG_HIDDEN_TYPES = new Set<HomepageSectionType>(["cta"]);

export function catalogSectionTypes(): HomepageSectionType[] {
  return HOMEPAGE_SECTION_TYPES.filter((type) => !HOMEPAGE_CATALOG_HIDDEN_TYPES.has(type));
}

export const ALRAYYAN_NAVY = "#2e1065";
export const ALRAYYAN_EMERALD = "#7c3aed";

/** Search widget appearance keys stored on hero/search `settings`. */
export const SEARCH_WIDGET_SETTING_KEYS = [
  "tabBarBg",
  "tabActiveBg",
  "tabActiveText",
  "tabIdleText",
  "panelBg",
  "showTabFlight",
  "showTabHoliday",
  "showTabHotel",
  "showTabTours",
  "showTabTransfers",
  "showTabCars",
  "showTabInsurance",
  "showTabVisa",
  "showTabOffers",
  "iconFlight",
  "iconHoliday",
  "iconHotel",
  "iconTours",
  "iconTransfers",
  "iconCars",
  "iconInsurance",
  "iconVisa",
  "iconOffers",
] as const;

export const DEFAULT_SECTION_STYLES: SectionStyles = {
  background: "",
  accent: "",
  textColor: "",
  overlay: "",
};

export function emptyCopy(ar = "", en = "", tr = ""): LocalizedCopy {
  return { ar, en, tr };
}

export function pickCopy(copy: LocalizedCopy | undefined, locale: Locale): string {
  if (!copy) return "";
  if (locale === "ar") return copy.ar || copy.en || copy.tr;
  if (locale === "tr") return copy.tr || copy.ar || copy.en;
  return copy.en || copy.ar || copy.tr;
}

export function isHomepageSectionType(value: string): value is HomepageSectionType {
  return (HOMEPAGE_SECTION_TYPES as readonly string[]).includes(value);
}

export function sectionCategory(type: HomepageSectionType): HomepageSectionCategory {
  switch (type) {
    case "hero":
    case "search":
      return "hero";
    case "categories":
    case "hotels":
    case "cars":
    case "transfers":
    case "visa":
    case "flightDeals":
      return "services";
    case "flashDeals":
    case "packages":
    case "vipTours":
      return "offers";
    case "coupons":
    case "points":
    case "affiliate":
      return "rewards";
    case "destinations":
    case "banners":
      return "destinations";
    case "whyUs":
    case "stats":
    case "testimonials":
    case "trust":
    case "partners":
    case "blog":
    case "newsletter":
    case "contact":
    case "cta":
    case "copilot": /* Agent C: copilot pipeline */
      return "story";
    default: {
      const _never: never = type;
      return _never;
    }
  }
}

export function sectionCategoryLabel(category: HomepageSectionCategory): LocalizedCopy {
  switch (category) {
    case "hero":
      return emptyCopy("الهيرو والبحث", "Hero & search", "Kahraman ve arama");
    case "services":
      return emptyCopy("الخدمات", "Services", "Hizmetler");
    case "offers":
      return emptyCopy("العروض", "Offers / flash", "Fırsatlar");
    case "rewards":
      return emptyCopy("كوبونات ونقاط", "Coupons / points / affiliate", "Kupon / puan / ortaklık");
    case "destinations":
      return emptyCopy("الوجهات والبنرات", "Destinations / banners", "Destinasyonlar / bannerlar");
    case "story":
      return emptyCopy("القصة والثقة", "Story & trust", "Hikâye ve güven");
    default: {
      const _never: never = category;
      return _never;
    }
  }
}

export function defaultHeroPackageItems(): HeroPackageItem[] {
  return [
    { id: "live-tp-01", source: "live", liveId: "tp-01" },
    { id: "live-tp-02", source: "live", liveId: "tp-02" },
    { id: "live-tp-03", source: "live", liveId: "tp-03" },
  ];
}

export function parseHeroPackages(
  settings: Record<string, string | number | boolean>
): HeroPackageItem[] {
  const rawJson = settings.heroPackagesJson;
  if (typeof rawJson === "string" && rawJson.trim()) {
    try {
      const parsed = JSON.parse(rawJson) as unknown;
      if (Array.isArray(parsed) && parsed.length) {
        return parsed
          .filter((item): item is HeroPackageItem => Boolean(item && typeof item === "object"))
          .map((item) => ({
            id: String(item.id || `pkg-${Math.random().toString(36).slice(2, 7)}`),
            source: item.source === "custom" ? "custom" : "live",
            kind: isHeroOfferKind(item.kind) ? item.kind : "package",
            liveId: item.liveId ? String(item.liveId) : undefined,
            titleAr: item.titleAr ? String(item.titleAr) : undefined,
            titleEn: item.titleEn ? String(item.titleEn) : undefined,
            titleTr: item.titleTr ? String(item.titleTr) : undefined,
            taglineAr: item.taglineAr ? String(item.taglineAr) : undefined,
            taglineEn: item.taglineEn ? String(item.taglineEn) : undefined,
            taglineTr: item.taglineTr ? String(item.taglineTr) : undefined,
            image: item.image ? String(item.image) : undefined,
            price: typeof item.price === "number" ? item.price : Number(item.price) || undefined,
            href: item.href ? String(item.href) : undefined,
          }));
      }
    } catch {
      /* fall through */
    }
  }

  const ids = typeof settings.heroPackageIds === "string" ? settings.heroPackageIds : "";
  const live = ids
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .map((liveId) => ({
      id: `live-${liveId}`,
      source: "live" as const,
      kind: "package" as const,
      liveId,
    }));

  let custom: HeroPackageItem[] = [];
  const customRaw = settings.heroCustomPackages;
  if (typeof customRaw === "string" && customRaw.trim()) {
    try {
      const parsed = JSON.parse(customRaw) as unknown;
      if (Array.isArray(parsed)) {
        custom = parsed
          .filter((item): item is HeroPackageItem => Boolean(item && typeof item === "object"))
          .map((item) => ({
            ...item,
            id: String(item.id || `custom-${Math.random().toString(36).slice(2, 7)}`),
            source: "custom" as const,
          }));
      }
    } catch {
      custom = [];
    }
  }

  const merged = [...live, ...custom];
  return merged.length ? merged : defaultHeroPackageItems();
}

export function serializeHeroPackages(items: HeroPackageItem[]): string {
  return JSON.stringify(items);
}

export function generateInstanceId(type: HomepageSectionType): string {
  return `${type}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function sectionLabel(type: HomepageSectionType): LocalizedCopy {
  switch (type) {
    case "hero":
      return emptyCopy("الهيرو", "Hero", "Kahraman");
    case "search":
      return emptyCopy("البحث", "Search", "Arama");
    case "categories":
      return emptyCopy("شريط الخدمات", "Service bar", "Hizmet çubuğu");
    case "destinations":
      return emptyCopy("الوجهات", "Destinations", "Destinasyonlar");
    case "packages":
      return emptyCopy("الباقات", "Packages", "Paketler");
    case "hotels":
      return emptyCopy("الفنادق", "Hotels", "Oteller");
    case "cars":
      return emptyCopy("السيارات", "Cars", "Araçlar");
    case "transfers":
      return emptyCopy("الترانسفير", "Transfers", "Transferler");
    case "whyUs":
      return emptyCopy("لماذا نحن", "Why us", "Neden biz");
    case "stats":
      return emptyCopy("الإحصائيات", "Stats", "İstatistikler");
    case "testimonials":
      return emptyCopy("آراء العملاء", "Testimonials", "Yorumlar");
    case "blog":
      return emptyCopy("المدونة", "Blog", "Blog");
    case "newsletter":
      return emptyCopy("النشرة", "Newsletter", "Bülten");
    case "contact":
      return emptyCopy("تواصل واطلب اتصالاً", "Call back & contact", "Geri arama ve iletişim");
    case "cta":
      return emptyCopy("تواصل واطلب اتصالاً", "Call back & contact", "Geri arama ve iletişim");
    case "copilot": /* Agent C: copilot pipeline */
      return emptyCopy("قسم مخصص", "Custom section", "Özel bölüm");
    case "flashDeals":
      return emptyCopy("عروض سريعة", "Flash deals", "Flaş fırsatlar");
    case "visa":
      return emptyCopy("التأشيرات", "Visa", "Vize");
    case "flightDeals":
      return emptyCopy("عروض الطيران", "Flight deals", "Uçuş fırsatları");
    case "vipTours":
      return emptyCopy("جولات VIP", "VIP tours", "VIP turlar");
    case "trust":
      return emptyCopy("الثقة", "Trust", "Güven");
    case "partners":
      return emptyCopy("الشركاء", "Partners", "Ortaklar");
    case "coupons":
      return emptyCopy("الكوبونات", "Coupons", "Kuponlar");
    case "points":
      return emptyCopy("نقاط الولاء", "Loyalty points", "Sadakat puanları");
    case "affiliate":
      return emptyCopy("نظام المسوّقين", "Affiliate", "Ortaklık");
    case "banners":
      return emptyCopy("بطاقات وجهات فاخرة", "Premium destination cards", "Premium destinasyon kartları");
    default: {
      const _never: never = type;
      return _never;
    }
  }
}

function copy(ar: string, en: string, tr: string): LocalizedCopy {
  return { ar, en, tr };
}

function mergedContactTexts(): Record<string, LocalizedCopy> {
  return {
    title: copy("نرد بسرعة — اترك رقمك", "We reply fast — leave your number", "Hızlı dönüş — numaranızı bırakın"),
    subtitle: copy(
      "فريق لوناليزا يتواصل خلال دقائق لترتيب الرحلة.",
      "The Lonaliza team calls back within minutes to arrange the trip.",
      "Lonaliza ekibi seyahati ayarlamak için dakikalar içinde arar."
    ),
    button: copy("اطلب اتصالاً", "Request a callback", "Geri arama iste"),
    ctaTitle: copy("جاهز لترتيب الرحلة؟", "Ready to arrange the trip?", "Seyahati ayarlamaya hazır mısınız?"),
    ctaSubtitle: copy(
      "راسلنا أو ابدأ الآن — فريق لوناليزا يرد بسرعة.",
      "Write to us or start now — the Lonaliza team replies quickly.",
      "Yazın veya hemen başlayın — Lonaliza ekibi hızlı döner."
    ),
    ctaButton: copy("تواصل معنا", "Contact us", "Bize yazın"),
  };
}

function newsletterSectionTexts(): Record<string, LocalizedCopy> {
  return {
    eyebrow: copy("النشرة البريدية", "Email newsletter", "E-posta bülteni"),
    title: copy("عروض وتركيا في بريدك", "Turkey offers in your inbox", "Türkiye fırsatları gelen kutunuzda"),
    subtitle: copy(
      "صفقات قصيرة المدى ونشرات موسمية — بلا إزعاج.",
      "Short-lived deals and seasonal notes — no noise.",
      "Kısa süreli fırsatlar ve mevsim notları — gürültü yok."
    ),
    placeholder: copy("بريدك الإلكتروني", "Your email", "E-posta adresiniz"),
    button: copy("اشترك", "Subscribe", "Abone ol"),
  };
}

function premiumBannerTexts(): Record<string, LocalizedCopy> {
  return {
    eyebrow: copy("مجموعات لوناليزا", "Lonaliza collections", "Lonaliza koleksiyonları"),
    title: copy(
      "وجهات أيقونية — اختر مدينتك",
      "Iconic destinations — pick your city",
      "İkonik destinasyonlar — şehrini seç"
    ),
    subtitle: copy(
      "بطاقات فاخرة تنقلك مباشرة إلى باقات كل مدينة.",
      "Premium cards that take you straight to each city’s packages.",
      "Sizi her şehrin paketlerine götüren premium kartlar."
    ),
  };
}

function makeSection(
  type: HomepageSectionType,
  texts: Record<string, LocalizedCopy>,
  settings: Record<string, string | number | boolean> = {},
  styles: Partial<SectionStyles> = {}
): HomepageSectionInstance {
  return {
    instanceId: `${type}-default`,
    type,
    hidden: false,
    texts,
    styles: { ...DEFAULT_SECTION_STYLES, ...styles },
    settings,
  };
}

function extraSectionDefaults(type: HomepageSectionType): Record<string, LocalizedCopy> | null {
  switch (type) {
    case "flashDeals":
      return {
        eyebrow: copy("لفترة محدودة", "Limited time", "Sınırlı süre"),
        title: copy("عروض سريعة", "Flash deals", "Flaş fırsatlar"),
        subtitle: copy(
          "مقاعد وأسعار تتغير خلال ساعات.",
          "Seats and prices that move within hours.",
          "Saatler içinde değişen koltuk ve fiyatlar."
        ),
      };
    case "visa":
      return {
        title: copy("تأشيرات إلكترونية", "eVisa services", "e-Vize hizmetleri"),
        subtitle: copy(
          "إرشاد واضح قبل أن تبدأ الطلب.",
          "Clear guidance before you start the application.",
          "Başvurudan önce net yönlendirme."
        ),
      };
    case "flightDeals":
      return {
        title: copy("مسارات طيران مميزة", "Featured flight routes", "Öne çıkan uçuş hatları"),
        subtitle: copy(
          "أسعار استرشادية لأكثر الوجهات طلباً.",
          "Guide prices on the most requested routes.",
          "En çok istenen hatlarda yönlendirici fiyatlar."
        ),
      };
    case "vipTours":
      return {
        title: copy("جولات يومية VIP", "VIP day tours", "VIP günlük turlar"),
        subtitle: copy(
          "سائق خاص ومسار مرن داخل تركيا.",
          "A private driver and a flexible route in Turkey.",
          "Türkiye’de özel şoför ve esnek rota."
        ),
      };
    case "trust":
      return {
        title: copy("تحجز بثقة", "Book with confidence", "Güvenle rezervasyon"),
        subtitle: copy(
          "مرخّصون تورساب وشركة سياحية معتمدة في تركيا. رحلتك آمنة معنا.",
          "TURSAB licensed and a certified tourism company in Turkey. Your trip is safe with us.",
          "TÜRSAB lisanslı ve Türkiye’de onaylı turizm şirketiyiz. Yolculuğunuz bizimle güvende."
        ),
      };
    case "partners":
      return {
        title: copy("شركاء السفر", "Travel partners", "Seyahat ortakları"),
        subtitle: copy(
          "شراكات طيران وضيافة مختارة لرحلتك في تركيا.",
          "Selected airline and hospitality partners for your Turkey trip.",
          "Türkiye seyahatiniz için seçilmiş havayolu ve konaklama ortakları."
        ),
        /* Agent L2: live inspector bind */
        statHotels: copy("200+", "200+", "200+"),
        statHotelsLabel: copy("فندق شريك", "Partner hotels", "Partner oteller"),
        statAirlines: copy("50+", "50+", "50+"),
        statAirlinesLabel: copy("شركة طيران", "Airlines", "Havayolları"),
        statCountries: copy("180+", "180+", "180+"),
        statCountriesLabel: copy("دولة", "Countries", "Ülke"),
        statSupport: copy("24/7", "24/7", "24/7"),
        statSupportLabel: copy("دعم", "Support", "Destek"),
      };
    case "coupons":
      return {
        eyebrow: copy("وفّر الآن", "Save now", "Şimdi tasarruf"),
        title: copy("كوبونات حجز فعّالة", "Live booking coupons", "Canlı rezervasyon kuponları"),
        subtitle: copy(
          "أكواد خصم من نظام الولاء — طبّقها قبل الدفع.",
          "Discount codes from loyalty — apply them before you pay.",
          "Sadakat indirim kodları — ödemeden önce uygulayın."
        ),
        button: copy("تصفح العروض", "Browse offers", "Fırsatları gör"),
      };
    case "points":
      return {
        eyebrow: copy("ولاء لوناليزا", "Lonaliza loyalty", "Lonaliza sadakati"),
        title: copy("اجمع نقاطاً مع كل حجز", "Earn points on every booking", "Her rezervasyonda puan kazanın"),
        subtitle: copy(
          "حوّل النقاط إلى قسيمة للدفع أو الخصم.",
          "Turn points into a voucher for payment or discount.",
          "Puanları ödeme veya indirim kuponuna çevirin."
        ),
        button: copy("محفظة النقاط", "Points wallet", "Puan cüzdanı"),
      };
    case "affiliate":
      return {
        eyebrow: copy("شارك واربح", "Share and earn", "Paylaş ve kazan"),
        title: copy("برنامج المسوّقين بالعمولة", "Affiliate commission program", "Ortaklık komisyon programı"),
        subtitle: copy(
          "شارك رابطك واحصل على عمولة من حجوزات الطيران والفنادق والباقات.",
          "Share your link and earn commission on flights, hotels, and packages.",
          "Bağlantınızı paylaşın; uçuş, otel ve paketlerden komisyon kazanın."
        ),
        button: copy("ابدأ التسويق", "Start promoting", "Tanıtıma başla"),
      };
    case "banners":
      return premiumBannerTexts();
    case "categories":
      return {
        eyebrow: copy("خدماتنا", "Our services", "Hizmetlerimiz"),
        title: copy("احجز ما تحتاجه في مكان واحد", "Book everything in one place", "Her şey tek yerde"),
      };
    case "transfers":
      return {
        eyebrow: copy("المطار", "Airport", "Havalimanı"),
        title: copy("ترانسفير خاص من المطار", "Private airport transfers", "Özel havalimanı transferi"),
        subtitle: copy(
          "سائق ينتظرك عند البوابة — إسطنبول، أنطاليا، بودروم والمزيد.",
          "A driver waiting at the gate — Istanbul, Antalya, Bodrum and more.",
          "Kapıda sizi bekleyen şoför — İstanbul, Antalya, Bodrum ve daha fazlası."
        ),
      };
    case "contact":
    case "cta":
      return mergedContactTexts();
    case "newsletter":
      return newsletterSectionTexts();
    case "hero":
    case "search":
    case "destinations":
    case "packages":
    case "hotels":
    case "cars":
    case "whyUs":
    case "stats":
    case "testimonials":
    case "blog":
    case "copilot": /* Agent C: copilot pipeline */
      return null;
    default: {
      const _never: never = type;
      return _never;
    }
  }
}

export function defaultSectionForType(type: HomepageSectionType): HomepageSectionInstance {
  const base = defaultHomepageDraft().layout.find((item) => item.type === type);
  if (base) {
    return {
      ...base,
      instanceId: generateInstanceId(type),
      texts: Object.fromEntries(
        Object.entries(base.texts).map(([key, value]) => [key, { ...value }])
      ),
      styles: { ...base.styles },
      settings: { ...base.settings },
    };
  }
  const extras = extraSectionDefaults(type);
  const created = makeSection(type, extras || { title: sectionLabel(type), subtitle: emptyCopy() });
  return { ...created, instanceId: generateInstanceId(type) };
}

export function defaultHomepageDraft(): HomepageTemplateDraft {
  return {
    global: {
      navy: ALRAYYAN_NAVY,
      emerald: ALRAYYAN_EMERALD,
    },
    elementOverrides: {},
    layout: [
      makeSection(
        "hero",
        {
          eyebrow: copy("لوناليزا للسياحة", "Lonaliza Tourism", "Lonaliza Turizm"),
          title: copy(
            "رحلة تركية تُدار كما يجب",
            "A Turkey trip, handled properly",
            "Türkiye seyahati, doğru şekilde"
          ),
          subtitle: copy(
            "طيران، فنادق، باقات يومية وسيارات خاصة — من إسطنبول إلى كابادوكيا.",
            "Flights, hotels, day packages and private cars — from Istanbul to Cappadocia.",
            "Uçuş, otel, günlük paket ve özel araç — İstanbul’dan Kapadokya’ya."
          ),
          cta: copy("ابدأ التخطيط", "Start planning", "Planlamaya başla"),
        },
        {
          showSearch: true,
          showHeroPackages: true,
          heroPackageIds: "tp-01,tp-02,tp-03",
          heroCustomPackages: "[]",
          heroPackagesJson: JSON.stringify(defaultHeroPackageItems()),
          image: "",
          tabBarBg: "var(--brand-header)",
          tabActiveBg: "var(--brand-button)",
          tabActiveText: "#ffffff",
          tabIdleText: "#1e1b4b",
          panelBg: "rgba(255,255,255,0.96)",
          showTabFlight: true,
          showTabHoliday: true,
          showTabHotel: true,
          showTabTours: true,
          showTabTransfers: true,
          showTabCars: true,
          showTabInsurance: true,
          showTabVisa: true,
          showTabOffers: true,
          iconFlight: "",
          iconHoliday: "",
          iconHotel: "",
          iconTours: "",
          iconTransfers: "",
          iconCars: "",
          iconInsurance: "",
          iconVisa: "",
          iconOffers: "",
        }
      ),
      {
        ...makeSection(
          "search",
          {
            title: copy("ابحث عن رحلتك", "Search your trip", "Seferinizi arayın"),
            subtitle: copy(
              "طيران، فنادق، جولات أو سيارة — اختر التبويب وابدأ.",
              "Flights, hotels, tours or a car — pick a tab and go.",
              "Uçuş, otel, tur veya araç — sekmeyi seçin."
            ),
          },
          {
            visible: false,
            tabBarBg: "var(--brand-header)",
            tabActiveBg: "var(--brand-button)",
            tabActiveText: "#ffffff",
            tabIdleText: "#1e1b4b",
            panelBg: "#ffffff",
            showTabFlight: true,
            showTabHoliday: true,
            showTabHotel: true,
            showTabTours: true,
            showTabTransfers: true,
            showTabCars: true,
            showTabInsurance: true,
            showTabVisa: true,
            showTabOffers: true,
            iconFlight: "",
            iconHoliday: "",
            iconHotel: "",
            iconTours: "",
            iconTransfers: "",
            iconCars: "",
            iconInsurance: "",
            iconVisa: "",
            iconOffers: "",
          }
        ),
        hidden: true,
      },
      {
        ...makeSection("categories", {
          eyebrow: copy("خدماتنا", "Our services", "Hizmetlerimiz"),
          title: copy("كل رحلتك من تبويب واحد", "Your whole trip, one place", "Tüm seyahatiniz tek yerde"),
        }),
        hidden: true,
      },
      makeSection("destinations", {
        eyebrow: copy("وجهات مختارة", "Curated destinations", "Seçilmiş destinasyonlar"),
        title: copy("أجمل مدن تركيا", "Turkey’s finest cities", "Türkiye’nin en güzel şehirleri"),
        subtitle: copy(
          "إسطنبول، كابادوكيا، أنطاليا والمزيد — باقات تبدأ من سعر واضح.",
          "Istanbul, Cappadocia, Antalya and more — packages with a clear starting price.",
          "İstanbul, Kapadokya, Antalya ve daha fazlası — net başlangıç fiyatı."
        ),
      }),
      makeSection("flashDeals", {
        eyebrow: copy("لفترة محدودة", "Limited time", "Sınırlı süre"),
        title: copy("عروض سريعة", "Flash deals", "Flaş fırsatlar"),
        subtitle: copy(
          "مقاعد وأسعار تتغير خلال ساعات.",
          "Seats and prices that move within hours.",
          "Saatler içinde değişen koltuk ve fiyatlar."
        ),
      }),
      makeSection("packages", {
        eyebrow: copy("باقات العطلات", "Holiday packages", "Tatil paketleri"),
        title: copy("برامج مختارة بعناية", "Handpicked programs", "Özenle seçilmiş programlar"),
        subtitle: copy(
          "أيام محسوبة، تنقل خاص، وفنادق تناسب أسلوب سفرك.",
          "Counted days, private transfers, and hotels that match how you travel.",
          "Hesaplı günler, özel transfer ve seyahat tarza uyan oteller."
        ),
      }),
      makeSection("hotels", {
        eyebrow: copy("الإقامة", "Stays", "Konaklama"),
        title: copy("فنادق مختارة في تركيا", "Handpicked hotels in Turkey", "Türkiye’de seçili oteller"),
        subtitle: copy(
          "من البوسفور إلى الكهوف — إقامات نراجعها قبل أن نعرضها.",
          "From the Bosphorus to cave suites — stays we review before we list.",
          "Boğaz’dan mağara süitlerine — listelemeden önce incelediğimiz konaklamalar."
        ),
      }),
      makeSection("cars", {
        eyebrow: copy("التنقل", "Getting around", "Ulaşım"),
        title: copy("سيارات وتأجير من المطار", "Cars from the airport", "Havalimanından araç kiralama"),
        subtitle: copy(
          "SUV، عائلية أو فان — استلام من مطارات تركيا الرئيسية.",
          "SUV, family or van — pickup at Turkey’s main airports.",
          "SUV, aile veya van — Türkiye’nin ana havalimanlarından teslim."
        ),
      }),
      makeSection("transfers", {
        eyebrow: copy("المطار", "Airport", "Havalimanı"),
        title: copy("ترانسفير خاص من المطار", "Private airport transfers", "Özel havalimanı transferi"),
        subtitle: copy(
          "سائق ينتظرك عند البوابة — إسطنبول، أنطاليا، بودروم والمزيد.",
          "A driver waiting at the gate — Istanbul, Antalya, Bodrum and more.",
          "Kapıda sizi bekleyen şoför — İstanbul, Antalya, Bodrum ve daha fazlası."
        ),
      }),
      makeSection("visa", {
        title: copy("تأشيرات إلكترونية", "eVisa services", "e-Vize hizmetleri"),
        subtitle: copy(
          "إرشاد واضح قبل أن تبدأ الطلب.",
          "Clear guidance before you start the application.",
          "Başvurudan önce net yönlendirme."
        ),
      }),
      makeSection("flightDeals", {
        title: copy("مسارات طيران مميزة", "Featured flight routes", "Öne çıkan uçuş hatları"),
        subtitle: copy(
          "أسعار استرشادية لأكثر الوجهات طلباً.",
          "Guide prices on the most requested routes.",
          "En çok istenen hatlarda yönlendirici fiyatlar."
        ),
      }),
      makeSection("vipTours", {
        title: copy("جولات يومية VIP", "VIP day tours", "VIP günlük turlar"),
        subtitle: copy(
          "سائق خاص ومسار مرن داخل تركيا.",
          "A private driver and a flexible route in Turkey.",
          "Türkiye’de özel şoför ve esnek rota."
        ),
      }),
      makeSection("whyUs", {
        eyebrow: copy("لماذا لوناليزا", "Why Lonaliza", "Neden Lonaliza"),
        title: copy("فريق يعرف تركيا عن قرب", "A team that knows Turkey", "Türkiye’yi yakından bilen ekip"),
        subtitle: copy(
          "دعم عربي، سائقون محليون، وحجز واضح بلا مفاجآت.",
          "Arabic support, local drivers, and bookings without surprises.",
          "Arapça destek, yerel sürücüler ve sürprizsiz rezervasyon."
        ),
      }),
      makeSection(
        "stats",
        {
          eyebrow: copy("أرقامنا", "By the numbers", "Rakamlarla"),
          title: copy("ثقة تُبنى بالحجوزات", "Trust built on bookings", "Rezervasyonla kurulan güven"),
          travelersLabel: copy("مسافر سعيد", "Happy travelers", "Mutlu yolcu"),
          destinationsLabel: copy("وجهة", "Destinations", "Destinasyon"),
          packagesLabel: copy("باقة", "Packages", "Paket"),
          yearsLabel: copy("سنة خبرة", "Years of care", "Yıllık deneyim"),
        },
        {
          travelers: 1500,
          destinations: 80,
          packages: 350,
          years: 12,
        }
      ),
      makeSection("testimonials", {
        eyebrow: copy("قصص الضيوف", "Guest stories", "Misafir hikâyeleri"),
        title: copy("ماذا يقول من سافر معنا", "What our travelers say", "Misafirlerimiz ne diyor"),
        subtitle: copy(
          "عائلات، رحلات عمل، ومنطاد عند الفجر — بنفس الاهتمام.",
          "Families, business trips, and dawn balloons — the same care.",
          "Aileler, iş seyahatleri ve şafak balonu — aynı özen."
        ),
      }),
      makeSection("trust", {
        title: copy("تحجز بثقة", "Book with confidence", "Güvenle rezervasyon"),
        subtitle: copy(
          "مرخّصون تورساب وشركة سياحية معتمدة في تركيا. رحلتك آمنة معنا.",
          "TURSAB licensed and a certified tourism company in Turkey. Your trip is safe with us.",
          "TÜRSAB lisanslı ve Türkiye’de onaylı turizm şirketiyiz. Yolculuğunuz bizimle güvende."
        ),
      }),
      makeSection("partners", {
        title: copy("شركاء السفر", "Travel partners", "Seyahat ortakları"),
        subtitle: copy(
          "شراكات طيران وضيافة مختارة لرحلتك في تركيا.",
          "Selected airline and hospitality partners for your Turkey trip.",
          "Türkiye seyahatiniz için seçilmiş havayolu ve konaklama ortakları."
        ),
        /* Agent L2: live inspector bind */
        statHotels: copy("200+", "200+", "200+"),
        statHotelsLabel: copy("فندق شريك", "Partner hotels", "Partner oteller"),
        statAirlines: copy("50+", "50+", "50+"),
        statAirlinesLabel: copy("شركة طيران", "Airlines", "Havayolları"),
        statCountries: copy("180+", "180+", "180+"),
        statCountriesLabel: copy("دولة", "Countries", "Ülke"),
        statSupport: copy("24/7", "24/7", "24/7"),
        statSupportLabel: copy("دعم", "Support", "Destek"),
      }),
      makeSection("blog", {
        eyebrow: copy("دليل السفر", "Travel guide", "Seyahat rehberi"),
        title: copy("أحدث المقالات", "Latest articles", "Son yazılar"),
        subtitle: copy(
          "نصائح عملية لتركيا: مواسم، أحياء، ومسارات يومية.",
          "Practical Turkey notes: seasons, neighborhoods, and day routes.",
          "Pratik Türkiye notları: sezonlar, semtler ve günlük rotalar."
        ),
      }),
      makeSection("contact", mergedContactTexts()),
    ],
  };
}

export function defaultHomepageTemplateFile(): HomepageTemplateFile {
  const draft = defaultHomepageDraft();
  return {
    version: TEMPLATE_SEED_VERSION,
    updatedAt: new Date().toISOString(),
    publishedAt: null,
    draft,
    published: null,
  };
}

export function cloneDraft(draft: HomepageTemplateDraft): HomepageTemplateDraft {
  return JSON.parse(JSON.stringify(draft)) as HomepageTemplateDraft;
}

export function findSection(
  draft: HomepageTemplateDraft,
  instanceId: string
): HomepageSectionInstance | undefined {
  return draft.layout.find((item) => item.instanceId === instanceId);
}

export function assertNever(value: never, message: string): never {
  throw new Error(`${message}: ${String(value)}`);
}

const LIBRARY_ONLY_SEED_TYPES = new Set<HomepageSectionType>([
  "coupons",
  "points",
  "affiliate",
  "banners",
  "cta",
  "newsletter",
]);

function isSeedInstance(item: HomepageSectionInstance): boolean {
  return item.instanceId.endsWith("-default");
}

/** Drop seed-injected library-only sections (`*-default` ids). Catalog-added instances stay. */
export function stripInjectedRewardSections(
  draft: HomepageTemplateDraft
): HomepageTemplateDraft {
  const layout = draft.layout.filter((item) => {
    if (!LIBRARY_ONLY_SEED_TYPES.has(item.type)) return true;
    return !isSeedInstance(item);
  });
  if (layout.length === draft.layout.length) return draft;
  return { ...draft, layout };
}

/** Fold leftover `cta` slabs into the single `contact` section. */
export function mergeContactAndCtaSections(
  draft: HomepageTemplateDraft
): HomepageTemplateDraft {
  const contact = draft.layout.find((item) => item.type === "contact");
  const ctas = draft.layout.filter((item) => item.type === "cta");
  if (!ctas.length) return draft;

  const firstCta = ctas[0];
  const fallback = mergedContactTexts();

  if (contact) {
    const layout = draft.layout
      .map((item) => {
        if (item.instanceId !== contact.instanceId) return item;
        return {
          ...item,
          texts: {
            ...fallback,
            ...item.texts,
            ctaTitle: item.texts.ctaTitle || firstCta?.texts.title || fallback.ctaTitle,
            ctaSubtitle: item.texts.ctaSubtitle || firstCta?.texts.subtitle || fallback.ctaSubtitle,
            ctaButton: item.texts.ctaButton || firstCta?.texts.button || fallback.ctaButton,
          },
        };
      })
      .filter((item) => item.type !== "cta");
    return { ...draft, layout };
  }

  const layout = draft.layout
    .map((item) => {
      if (item.instanceId !== firstCta?.instanceId) return item;
      return {
        ...item,
        type: "contact" as const,
        texts: {
          ...fallback,
          ...item.texts,
          ctaTitle: item.texts.ctaTitle || item.texts.title || fallback.ctaTitle,
          ctaSubtitle: item.texts.ctaSubtitle || item.texts.subtitle || fallback.ctaSubtitle,
          ctaButton: item.texts.ctaButton || item.texts.button || fallback.ctaButton,
        },
      };
    })
    .filter((item) => item.type !== "cta");
  return { ...draft, layout };
}

/** Insert missing core section types — never inject library-only seeds. */
export function ensureOriginalHomepageSections(
  draft: HomepageTemplateDraft
): HomepageTemplateDraft {
  const merged = mergeContactAndCtaSections(draft);
  const have = new Set(merged.layout.map((item) => item.type));
  const extras = defaultHomepageDraft().layout.filter(
    (item) => !have.has(item.type) && !LIBRARY_ONLY_SEED_TYPES.has(item.type)
  );
  const next = extras.length
    ? { ...merged, layout: [...merged.layout, ...extras.map((item) => ({ ...item }))] }
    : merged;
  return stripInjectedRewardSections(next);
}
