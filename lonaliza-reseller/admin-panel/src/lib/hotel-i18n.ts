import type { Locale } from "@/lib/i18n/types";

export function rapidApiLang(locale?: string): string {
  if (locale === "ar") return "ar";
  if (locale === "tr") return "tr";
  return "en_US";
}

const AMENITY_MAP: Record<string, Partial<Record<Locale, string>>> = {
  pool: { ar: "مسبح", en: "Pool", tr: "Havuz" },
  "free high speed internet (wifi)": {
    ar: "إنترنت مجاني عالي السرعة (واي فاي)",
    en: "Free high-speed internet (WiFi)",
    tr: "Ücretsiz yüksek hızlı internet (WiFi)",
  },
  "free high speed internet": {
    ar: "إنترنت مجاني عالي السرعة",
    en: "Free high-speed internet",
    tr: "Ücretsiz yüksek hızlı internet",
  },
  wifi: { ar: "واي فاي", en: "WiFi", tr: "WiFi" },
  "wi-fi": { ar: "واي فاي", en: "WiFi", tr: "WiFi" },
  parking: { ar: "موقف سيارات", en: "Parking", tr: "Otopark" },
  "free parking": { ar: "موقف مجاني", en: "Free parking", tr: "Ücretsiz otopark" },
  quaint: { ar: "أجواء ساحرة", en: "Quaint", tr: "Şirin" },
  romantic: { ar: "رومانسي", en: "Romantic", tr: "Romantik" },
  "fitness center with gym / workout room": {
    ar: "مركز لياقة بدنية",
    en: "Fitness center / gym",
    tr: "Fitness merkezi / spor salonu",
  },
  "fitness center": { ar: "مركز لياقة", en: "Fitness center", tr: "Fitness merkezi" },
  spa: { ar: "سبا", en: "Spa", tr: "Spa" },
  restaurant: { ar: "مطعم", en: "Restaurant", tr: "Restoran" },
  bar: { ar: "بار", en: "Bar", tr: "Bar" },
  "air conditioning": { ar: "تكييف", en: "Air conditioning", tr: "Klima" },
  breakfast: { ar: "إفطار", en: "Breakfast", tr: "Kahvaltı" },
  "free breakfast": { ar: "إفطار مجاني", en: "Free breakfast", tr: "Ücretsiz kahvaltı" },
  "free breakfast available": {
    ar: "إفطار مجاني متاح",
    en: "Free breakfast available",
    tr: "Ücretsiz kahvaltı mevcut",
  },
  "breakfast included": { ar: "إفطار مشمول", en: "Breakfast included", tr: "Kahvaltı dahil" },
  "free cancellation": { ar: "إلغاء مجاني", en: "Free cancellation", tr: "Ücretsiz iptal" },
  "non-refundable": { ar: "غير قابل للاسترداد", en: "Non-refundable", tr: "İade edilemez" },
  "non refundable": { ar: "غير قابل للاسترداد", en: "Non-refundable", tr: "İade edilemez" },
  "no prepayment": { ar: "بدون دفع مقدم", en: "No prepayment", tr: "Ön ödeme yok" },
  "غرفة فندقية": { ar: "غرفة فندقية", en: "Hotel room", tr: "Otel odası" },
  "سرير واحد": { ar: "سرير واحد", en: "1 bed", tr: "1 yatak" },
  "سريران": { ar: "سريران", en: "2 beds", tr: "2 yatak" },
  "pay at hotel": { ar: "الدفع في الفندق", en: "Pay at hotel", tr: "Otelde öde" },
  "pay at stay": { ar: "الدفع عند الإقامة", en: "Pay at stay", tr: "Konaklamada öde" },
  hotels: { ar: "فنادق", en: "Hotels", tr: "Oteller" },
  "b&bs & inns": { ar: "نُزُل وبيوت ضيافة", en: "B&Bs & Inns", tr: "Pansiyonlar" },
  condo: { ar: "شقق فندقية", en: "Condo", tr: "Konut" },
  "specialty lodging": { ar: "إقامة مميزة", en: "Specialty lodging", tr: "Özel konaklama" },
  lodge: { ar: "نُزُل", en: "Lodge", tr: "Lodge" },
  hostel: { ar: "نزل شباب", en: "Hostel", tr: "Hostel" },
  villa: { ar: "فيلا", en: "Villa", tr: "Villa" },
  campground: { ar: "مخيم", en: "Campground", tr: "Kamp alanı" },
  "standard room": { ar: "غرفة قياسية", en: "Standard room", tr: "Standart oda" },
  "double room": { ar: "غرفة مزدوجة", en: "Double room", tr: "Çift kişilik oda" },
  "twin room": { ar: "غرفة توأم", en: "Twin room", tr: "İki yataklı oda" },
  "double or twin room": {
    ar: "غرفة مزدوجة أو توأم",
    en: "Double or twin room",
    tr: "Çift veya twin oda",
  },
  "deluxe room": { ar: "غرفة ديلوكس", en: "Deluxe room", tr: "Deluxe oda" },
  suite: { ar: "جناح", en: "Suite", tr: "Suit" },
  "family room": { ar: "غرفة عائلية", en: "Family room", tr: "Aile odası" },
  "king room": { ar: "غرفة كينغ", en: "King room", tr: "King oda" },
  "queen room": { ar: "غرفة كوين", en: "Queen room", tr: "Queen oda" },
  "room only": { ar: "غرفة فقط", en: "Room only", tr: "Sadece oda" },
  "special offers": { ar: "عروض خاصة", en: "Special offers", tr: "Özel fırsatlar" },
  hotel: { ar: "فندق", en: "Hotel", tr: "Otel" },
  apartment: { ar: "شقة", en: "Apartment", tr: "Apartman" },
  resort: { ar: "منتجع", en: "Resort", tr: "Resort" },
  guesthouse: { ar: "بيت ضيافة", en: "Guesthouse", tr: "Pansiyon" },
  fitness: { ar: "لياقة", en: "Fitness", tr: "Fitness" },
  elevator: { ar: "مصعد", en: "Elevator", tr: "Asansör" },
  beach: { ar: "شاطئ", en: "Beach", tr: "Plaj" },
  "under 1 km": { ar: "أقل من 1 كم", en: "Under 1 km", tr: "1 km altında" },
  "under 2 km": { ar: "أقل من 2 كم", en: "Under 2 km", tr: "2 km altında" },
  "under 5 km": { ar: "أقل من 5 كم", en: "Under 5 km", tr: "5 km altında" },
  "under 10 km": { ar: "أقل من 10 كم", en: "Under 10 km", tr: "10 km altında" },
  "includes breakfast": { ar: "يشمل الإفطار", en: "Includes breakfast", tr: "Kahvaltı dahil" },
  "5-star rating": { ar: "تصنيف 5 نجوم", en: "5-star rating", tr: "5 yıldız" },
  yesterday: { ar: "أمس", en: "Yesterday", tr: "Dün" },
  today: { ar: "اليوم", en: "Today", tr: "Bugün" },
};

const ROOM_PHRASE: Array<[RegExp, Partial<Record<Locale, string>>]> = [
  [
    /^standard king room with sofa bed$/i,
    {
      ar: "غرفة قياسية كينج بسرير أريكة",
      en: "Standard King Room with Sofa Bed",
      tr: "Kanepe yataklı standart king oda",
    },
  ],
  [
    /^deluxe room city view king bed$/i,
    {
      ar: "غرفة ديلوكس بإطلالة على المدينة وسرير كينغ",
      en: "Deluxe Room City View King Bed",
      tr: "Şehir manzaralı deluxe king oda",
    },
  ],
  [
    /^deluxe room sea view king bed$/i,
    {
      ar: "غرفة ديلوكس بإطلالة بحرية وسرير كينغ",
      en: "Deluxe Room Sea View King Bed",
      tr: "Deniz manzaralı deluxe king oda",
    },
  ],
  [
    /^superior room city view king bed$/i,
    {
      ar: "غرفة سوبيريور بإطلالة على المدينة وسرير كينغ",
      en: "Superior Room City View King Bed",
      tr: "Şehir manzaralı superior king oda",
    },
  ],
  [
    /^superior room sea view king bed$/i,
    {
      ar: "غرفة سوبيريور بإطلالة بحرية وسرير كينغ",
      en: "Superior Room Sea View King Bed",
      tr: "Deniz manzaralı superior king oda",
    },
  ],
  [
    /^apollo room city view king bed$/i,
    {
      ar: "غرفة أبولو بإطلالة على المدينة وسرير كينغ",
      en: "Apollo Room City View King Bed",
      tr: "Şehir manzaralı Apollo king oda",
    },
  ],
  [
    /^apollo room sea view king bed$/i,
    {
      ar: "غرفة أبولو بإطلالة بحرية وسرير كينغ",
      en: "Apollo Room Sea View King Bed",
      tr: "Deniz manzaralı Apollo king oda",
    },
  ],
  [
    /^apollo suite sea view/i,
    {
      ar: "جناح أبولو بإطلالة بحرية",
      en: "Apollo Suite Sea View",
      tr: "Deniz manzaralı Apollo suit",
    },
  ],
  [/double or twin/i, AMENITY_MAP["double or twin room"]],
];

function normKey(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLowerCase();
}

export function humanizeHotelLabel(text: string): string {
  return String(text || "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/[_./-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function localizeHotelLabel(text: string, locale: Locale): string {
  const raw = humanizeHotelLabel(text);
  if (!raw) return "";
  const direct = AMENITY_MAP[normKey(raw)] || AMENITY_MAP[normKey(text)];
  if (direct) return direct[locale] || direct.en || raw;
  const daysAgo = raw.match(/^(\d+)\s+days?\s+ago$/i);
  if (daysAgo) {
    const n = daysAgo[1];
    if (locale === "ar") return `منذ ${n} أيام`;
    if (locale === "tr") return `${n} gün önce`;
    return `${n} days ago`;
  }
  return raw;
}

export function localizeRoomType(text: string, locale: Locale): string {
  const raw = (text || "").replace(/\s+/g, " ").trim();
  if (!raw) return "";
  const exact = AMENITY_MAP[normKey(raw)];
  if (exact) return exact[locale] || exact.en || raw;
  for (const [re, copy] of ROOM_PHRASE) {
    if (!re.test(raw)) continue;
    const rest = raw.replace(re, "").trim();
    if (rest === "" || /^with\b|^and\b/i.test(rest)) return copy[locale] || copy.en || raw;
  }
  return raw;
}

export function localizeAmenityList(items: string[], locale: Locale): string[] {
  return items.map((item) => localizeHotelLabel(item, locale));
}

export function professionalHotelBlurb(input: {
  name: string;
  stars: number;
  city: string;
  amenities: string[];
  locale: Locale;
}): string {
  const name = (input.name || "").trim();
  const city = (input.city || "").trim();
  const amenities = input.amenities.filter(Boolean).slice(0, 6).map((item) =>
    localizeHotelLabel(item, input.locale)
  );
  const amenityLine = amenities.length ? amenities.join(input.locale === "ar" ? "، " : ", ") : "";
  if (input.locale === "ar") {
    const stars = input.stars > 0 ? `بتصنيف ${input.stars} نجوم` : "";
    const where = city ? `في ${city}` : "";
    const extras = amenityLine ? `من أبرز مرافقه: ${amenityLine}.` : "";
    return [`${name} فندق`, stars, where].filter(Boolean).join(" ") + (extras ? `. ${extras}` : ".");
  }
  if (input.locale === "tr") {
    const stars = input.stars > 0 ? `${input.stars} yıldızlı` : "";
    const where = city ? `${city} konumunda` : "";
    const extras = amenityLine ? `Öne çıkan olanaklar: ${amenityLine}.` : "";
    return [`${name}`, stars, "otel", where].filter(Boolean).join(" ") + (extras ? `. ${extras}` : ".");
  }
  const stars = input.stars > 0 ? `${input.stars}-star` : "";
  const where = city ? `in ${city}` : "";
  const extras = amenityLine ? `Highlights include ${amenityLine}.` : "";
  return [`${name} is a`, stars, "hotel", where].filter(Boolean).join(" ") + (extras ? `. ${extras}` : ".");
}
