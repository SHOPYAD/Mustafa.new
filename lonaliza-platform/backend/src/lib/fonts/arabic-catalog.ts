/**
 * Site-wide Arabic type library.
 *
 * Public pages load only the active family (plus the Latin default).
 * The editor / branding picker reads this catalog and calls `loadFont`
 * on demand — never inject all families on a public request.
 */

export type ArabicFontCategory =
  | "naskh"
  | "kufi"
  | "modern-grotesque"
  | "display"
  | "maghrebi"
  | "nastaliq"
  | "ruqaa";

export type ArabicFontFallback = "sans-serif" | "serif";

export type ArabicFontEntry = {
  id: string;
  nameAr: string;
  nameEn: string;
  category: ArabicFontCategory;
  /** Google Fonts family name as used in CSS `font-family`. */
  googleFamily: string;
  /** css2 `family=` slug, including optional `:wght@…`. */
  googleSlug: string;
  fallback: ArabicFontFallback;
};

/** IBM Plex Sans Arabic — UI + headlines, more refined than Cairo/Tajawal. */
export const DEFAULT_ARABIC_FONT_ID = "ibm-plex-sans-arabic";

export const ARABIC_FONT_CATALOG: readonly ArabicFontEntry[] = [
  /* —— Modern grotesque / UI —— */
  {
    id: "ibm-plex-sans-arabic",
    nameAr: "آي بي إم بلكس عربي",
    nameEn: "IBM Plex Sans Arabic",
    category: "modern-grotesque",
    googleFamily: "IBM Plex Sans Arabic",
    googleSlug: "IBM+Plex+Sans+Arabic:wght@300;400;500;600;700",
    fallback: "sans-serif",
  },
  {
    id: "readex-pro",
    nameAr: "ريدكس برو",
    nameEn: "Readex Pro",
    category: "modern-grotesque",
    googleFamily: "Readex Pro",
    googleSlug: "Readex+Pro:wght@300;400;500;600;700",
    fallback: "sans-serif",
  },
  {
    id: "tajawal",
    nameAr: "تجوّال",
    nameEn: "Tajawal",
    category: "modern-grotesque",
    googleFamily: "Tajawal",
    googleSlug: "Tajawal:wght@300;400;500;700;800",
    fallback: "sans-serif",
  },
  {
    id: "cairo",
    nameAr: "القاهرة",
    nameEn: "Cairo",
    category: "modern-grotesque",
    googleFamily: "Cairo",
    googleSlug: "Cairo:wght@300;400;500;600;700;800;900",
    fallback: "sans-serif",
  },
  {
    id: "noto-sans-arabic",
    nameAr: "نوتو سنس عربي",
    nameEn: "Noto Sans Arabic",
    category: "modern-grotesque",
    googleFamily: "Noto Sans Arabic",
    googleSlug: "Noto+Sans+Arabic:wght@300;400;500;600;700",
    fallback: "sans-serif",
  },
  {
    id: "almarai",
    nameAr: "المرعى",
    nameEn: "Almarai",
    category: "modern-grotesque",
    googleFamily: "Almarai",
    googleSlug: "Almarai:wght@300;400;700;800",
    fallback: "sans-serif",
  },
  {
    id: "mada",
    nameAr: "مدى",
    nameEn: "Mada",
    category: "modern-grotesque",
    googleFamily: "Mada",
    googleSlug: "Mada:wght@300;400;500;600;700",
    fallback: "sans-serif",
  },
  {
    id: "changa",
    nameAr: "تشانغا",
    nameEn: "Changa",
    category: "modern-grotesque",
    googleFamily: "Changa",
    googleSlug: "Changa:wght@300;400;500;600;700;800",
    fallback: "sans-serif",
  },
  {
    id: "vazirmatn",
    nameAr: "وزيرمتن",
    nameEn: "Vazirmatn",
    category: "modern-grotesque",
    googleFamily: "Vazirmatn",
    googleSlug: "Vazirmatn:wght@300;400;500;600;700",
    fallback: "sans-serif",
  },
  {
    id: "alexandria",
    nameAr: "الإسكندرية",
    nameEn: "Alexandria",
    category: "modern-grotesque",
    googleFamily: "Alexandria",
    googleSlug: "Alexandria:wght@300;400;500;600;700",
    fallback: "sans-serif",
  },
  {
    id: "fustat",
    nameAr: "الفسطاط",
    nameEn: "Fustat",
    category: "modern-grotesque",
    googleFamily: "Fustat",
    googleSlug: "Fustat:wght@300;400;500;600;700",
    fallback: "sans-serif",
  },
  {
    id: "beiruti",
    nameAr: "بيروتي",
    nameEn: "Beiruti",
    category: "modern-grotesque",
    googleFamily: "Beiruti",
    googleSlug: "Beiruti:wght@300;400;500;600;700",
    fallback: "sans-serif",
  },
  {
    id: "zain",
    nameAr: "زين",
    nameEn: "Zain",
    category: "modern-grotesque",
    googleFamily: "Zain",
    googleSlug: "Zain:wght@300;400;700",
    fallback: "sans-serif",
  },
  {
    id: "lemonada",
    nameAr: "ليمونادة",
    nameEn: "Lemonada",
    category: "modern-grotesque",
    googleFamily: "Lemonada",
    googleSlug: "Lemonada:wght@300;400;500;600;700",
    fallback: "sans-serif",
  },
  {
    id: "baloo-bhaijaan-2",
    nameAr: "بالو بهيجان",
    nameEn: "Baloo Bhaijaan 2",
    category: "modern-grotesque",
    googleFamily: "Baloo Bhaijaan 2",
    googleSlug: "Baloo+Bhaijaan+2:wght@400;500;600;700",
    fallback: "sans-serif",
  },
  {
    id: "el-messiri",
    nameAr: "المسيري",
    nameEn: "El Messiri",
    category: "modern-grotesque",
    googleFamily: "El Messiri",
    googleSlug: "El+Messiri:wght@400;500;600;700",
    fallback: "sans-serif",
  },
  {
    id: "markazi-text",
    nameAr: "مركزي تكست",
    nameEn: "Markazi Text",
    category: "naskh",
    googleFamily: "Markazi Text",
    googleSlug: "Markazi+Text:wght@400;500;600;700",
    fallback: "serif",
  },
  {
    id: "harmattan",
    nameAr: "هرمتان",
    nameEn: "Harmattan",
    category: "modern-grotesque",
    googleFamily: "Harmattan",
    googleSlug: "Harmattan:wght@400;500;600;700",
    fallback: "sans-serif",
  },
  {
    id: "cairo-play",
    nameAr: "القاهرة بلاي",
    nameEn: "Cairo Play",
    category: "display",
    googleFamily: "Cairo Play",
    googleSlug: "Cairo+Play:wght@300;400;500;600;700;800;900",
    fallback: "sans-serif",
  },

  /* —— Kufi —— */
  {
    id: "noto-kufi-arabic",
    nameAr: "نوتو كوفي عربي",
    nameEn: "Noto Kufi Arabic",
    category: "kufi",
    googleFamily: "Noto Kufi Arabic",
    googleSlug: "Noto+Kufi+Arabic:wght@300;400;500;600;700",
    fallback: "sans-serif",
  },
  {
    id: "reem-kufi",
    nameAr: "ريم كوفي",
    nameEn: "Reem Kufi",
    category: "kufi",
    googleFamily: "Reem Kufi",
    googleSlug: "Reem+Kufi:wght@400;500;600;700",
    fallback: "sans-serif",
  },
  {
    id: "reem-kufi-fun",
    nameAr: "ريم كوفي فن",
    nameEn: "Reem Kufi Fun",
    category: "kufi",
    googleFamily: "Reem Kufi Fun",
    googleSlug: "Reem+Kufi+Fun:wght@400;500;600;700",
    fallback: "sans-serif",
  },
  {
    id: "reem-kufi-ink",
    nameAr: "ريم كوفي إنك",
    nameEn: "Reem Kufi Ink",
    category: "kufi",
    googleFamily: "Reem Kufi Ink",
    googleSlug: "Reem+Kufi+Ink",
    fallback: "sans-serif",
  },
  {
    id: "qahiri",
    nameAr: "قاهري",
    nameEn: "Qahiri",
    category: "kufi",
    googleFamily: "Qahiri",
    googleSlug: "Qahiri",
    fallback: "sans-serif",
  },
  {
    id: "kufam",
    nameAr: "كوفام",
    nameEn: "Kufam",
    category: "kufi",
    googleFamily: "Kufam",
    googleSlug: "Kufam:wght@400;500;600;700",
    fallback: "sans-serif",
  },

  /* —— Naskh —— */
  {
    id: "amiri",
    nameAr: "أميري",
    nameEn: "Amiri",
    category: "naskh",
    googleFamily: "Amiri",
    googleSlug: "Amiri:wght@400;700",
    fallback: "serif",
  },
  {
    id: "noto-naskh-arabic",
    nameAr: "نوتو نسخ عربي",
    nameEn: "Noto Naskh Arabic",
    category: "naskh",
    googleFamily: "Noto Naskh Arabic",
    googleSlug: "Noto+Naskh+Arabic:wght@400;500;600;700",
    fallback: "serif",
  },
  {
    id: "scheherazade-new",
    nameAr: "شهرزاد الجديد",
    nameEn: "Scheherazade New",
    category: "naskh",
    googleFamily: "Scheherazade New",
    googleSlug: "Scheherazade+New:wght@400;500;600;700",
    fallback: "serif",
  },
  {
    id: "lateef",
    nameAr: "لطيف",
    nameEn: "Lateef",
    category: "naskh",
    googleFamily: "Lateef",
    googleSlug: "Lateef:wght@400;700",
    fallback: "serif",
  },
  {
    id: "amiri-quran",
    nameAr: "أميري قرآن",
    nameEn: "Amiri Quran",
    category: "naskh",
    googleFamily: "Amiri Quran",
    googleSlug: "Amiri+Quran",
    fallback: "serif",
  },

  /* —— Ruqaa —— */
  {
    id: "aref-ruqaa",
    nameAr: "عارف رقعة",
    nameEn: "Aref Ruqaa",
    category: "ruqaa",
    googleFamily: "Aref Ruqaa",
    googleSlug: "Aref+Ruqaa:wght@400;700",
    fallback: "serif",
  },
  {
    id: "aref-ruqaa-ink",
    nameAr: "عارف رقعة إنك",
    nameEn: "Aref Ruqaa Ink",
    category: "ruqaa",
    googleFamily: "Aref Ruqaa Ink",
    googleSlug: "Aref+Ruqaa+Ink:wght@400;700",
    fallback: "serif",
  },

  /* —— Nastaliq —— */
  {
    id: "gulzar",
    nameAr: "گلزار",
    nameEn: "Gulzar",
    category: "nastaliq",
    googleFamily: "Gulzar",
    googleSlug: "Gulzar",
    fallback: "serif",
  },
  {
    id: "mirza",
    nameAr: "ميرزا",
    nameEn: "Mirza",
    category: "nastaliq",
    googleFamily: "Mirza",
    googleSlug: "Mirza:wght@400;500;600;700",
    fallback: "serif",
  },
  {
    id: "noto-nastaliq-urdu",
    nameAr: "نوتو نستعليق",
    nameEn: "Noto Nastaliq Urdu",
    category: "nastaliq",
    googleFamily: "Noto Nastaliq Urdu",
    googleSlug: "Noto+Nastaliq+Urdu:wght@400;500;600;700",
    fallback: "serif",
  },

  /* —— Display —— */
  {
    id: "lalezar",
    nameAr: "لاله‌زار",
    nameEn: "Lalezar",
    category: "display",
    googleFamily: "Lalezar",
    googleSlug: "Lalezar",
    fallback: "sans-serif",
  },
  {
    id: "jomhuria",
    nameAr: "جمهورية",
    nameEn: "Jomhuria",
    category: "display",
    googleFamily: "Jomhuria",
    googleSlug: "Jomhuria",
    fallback: "sans-serif",
  },
  {
    id: "katibeh",
    nameAr: "كتيبة",
    nameEn: "Katibeh",
    category: "display",
    googleFamily: "Katibeh",
    googleSlug: "Katibeh",
    fallback: "sans-serif",
  },
  {
    id: "marhey",
    nameAr: "مرحي",
    nameEn: "Marhey",
    category: "display",
    googleFamily: "Marhey",
    googleSlug: "Marhey:wght@400;500;600;700",
    fallback: "sans-serif",
  },
  {
    id: "blaka",
    nameAr: "بلاكة",
    nameEn: "Blaka",
    category: "display",
    googleFamily: "Blaka",
    googleSlug: "Blaka",
    fallback: "serif",
  },
  {
    id: "vibes",
    nameAr: "فايبز",
    nameEn: "Vibes",
    category: "display",
    googleFamily: "Vibes",
    googleSlug: "Vibes",
    fallback: "serif",
  },
  {
    id: "handjet",
    nameAr: "هاندجت",
    nameEn: "Handjet",
    category: "display",
    googleFamily: "Handjet",
    googleSlug: "Handjet:wght@400;500;600;700",
    fallback: "sans-serif",
  },

  /* —— Maghrebi-adjacent —— */
  {
    id: "rakkas",
    nameAr: "رقّاص",
    nameEn: "Rakkas",
    category: "maghrebi",
    googleFamily: "Rakkas",
    googleSlug: "Rakkas",
    fallback: "serif",
  },
  {
    id: "ruwudu",
    nameAr: "رُودو",
    nameEn: "Ruwudu",
    category: "maghrebi",
    googleFamily: "Ruwudu",
    googleSlug: "Ruwudu:wght@400;500;600;700",
    fallback: "serif",
  },
  {
    id: "akatab",
    nameAr: "أكاتب",
    nameEn: "Akatab",
    category: "maghrebi",
    googleFamily: "Akatab",
    googleSlug: "Akatab:wght@400;500;600;700",
    fallback: "serif",
  },
];

const BY_ID = new Map(ARABIC_FONT_CATALOG.map((font) => [font.id, font]));

export function getArabicFontById(id: string | undefined | null): ArabicFontEntry {
  if (id && BY_ID.has(id)) return BY_ID.get(id)!;
  return BY_ID.get(DEFAULT_ARABIC_FONT_ID)!;
}

export function isArabicFontId(id: string): boolean {
  return BY_ID.has(id);
}

export function arabicFontStack(id: string | undefined | null): string {
  const font = getArabicFontById(id);
  const family = font.googleFamily.includes(" ")
    ? `'${font.googleFamily}'`
    : font.googleFamily;
  return `${family}, Tahoma, ${font.fallback}`;
}
