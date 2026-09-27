/**
 * Comprehensive Multilingual Airline Names Dictionary (AR, EN, TR, FR)
 * Provides verified full carrier names for global and regional airlines.
 */

export interface AirlineLocalization {
  code: string;
  nameEn: string;
  nameAr: string;
  nameTr: string;
  nameFr: string;
}

export const AIRLINE_DICTIONARY: Record<string, AirlineLocalization> = {
  // Turkish Carriers
  TK: { code: "TK", nameEn: "Turkish Airlines", nameAr: "الخطوط الجوية التركية", nameTr: "Türk Hava Yolları", nameFr: "Turkish Airlines" },
  PC: { code: "PC", nameEn: "Pegasus Airlines", nameAr: "طيران بيغاسوس", nameTr: "Pegasus Hava Yolları", nameFr: "Pegasus Airlines" },
  XQ: { code: "XQ", nameEn: "SunExpress", nameAr: "صن إكسبريس", nameTr: "SunExpress", nameFr: "SunExpress" },
  VF: { code: "VF", nameEn: "AJet", nameAr: "إيه جيت", nameTr: "AJet", nameFr: "AJet" },
  XC: { code: "XC", nameEn: "Corendon Airlines", nameAr: "كوريندون للطيران", nameTr: "Corendon Havayolları", nameFr: "Corendon Airlines" },
  FH: { code: "FH", nameEn: "Freebird Airlines", nameAr: "فري بيرد للطيران", nameTr: "Freebird Havayolları", nameFr: "Freebird Airlines" },

  // Saudi Arabian Carriers
  SV: { code: "SV", nameEn: "Saudia", nameAr: "الخطوط السعودية", nameTr: "Suudi Arabistan Havayolları", nameFr: "Saudia" },
  XY: { code: "XY", nameEn: "flynas", nameAr: "طيران ناس", nameTr: "Flynas", nameFr: "flynas" },
  F3: { code: "F3", nameEn: "flyadeal", nameAr: "طيران أديل", nameTr: "Flyadeal", nameFr: "flyadeal" },
  RX: { code: "RX", nameEn: "Riyadh Air", nameAr: "طيران الرياض", nameTr: "Riyad Hava Yolları", nameFr: "Riyadh Air" },

  // Gulf & Middle Eastern Carriers
  EK: { code: "EK", nameEn: "Emirates", nameAr: "طيران الإمارات", nameTr: "Emirates", nameFr: "Emirates" },
  QR: { code: "QR", nameEn: "Qatar Airways", nameAr: "الخطوط الجوية القطرية", nameTr: "Katar Havayolları", nameFr: "Qatar Airways" },
  FZ: { code: "FZ", nameEn: "flydubai", nameAr: "فلاي دبي", nameTr: "Flydubai", nameFr: "flydubai" },
  G9: { code: "G9", nameEn: "Air Arabia", nameAr: "العربية للطيران", nameTr: "Air Arabia", nameFr: "Air Arabia" },
  EY: { code: "EY", nameEn: "Etihad Airways", nameAr: "الاتحاد للطيران", nameTr: "Etihad Havayolları", nameFr: "Etihad Airways" },
  WY: { code: "WY", nameEn: "Oman Air", nameAr: "الطيران العماني", nameTr: "Umman Havayolları", nameFr: "Oman Air" },
  OV: { code: "OV", nameEn: "SalamAir", nameAr: "طيران السلام", nameTr: "SalamAir", nameFr: "SalamAir" },
  KU: { code: "KU", nameEn: "Kuwait Airways", nameAr: "الخطوط الجوية الكويتية", nameTr: "Kuveyt Havayolları", nameFr: "Kuwait Airways" },
  J9: { code: "J9", nameEn: "Jazeera Airways", nameAr: "طيران الجزيرة", nameTr: "Jazeera Airways", nameFr: "Jazeera Airways" },
  GF: { code: "GF", nameEn: "Gulf Air", nameAr: "طيران الخليج", nameTr: "Gulf Air", nameFr: "Gulf Air" },
  RJ: { code: "RJ", nameEn: "Royal Jordanian", nameAr: "الملكية الأردنية", nameTr: "Kraliyet Ürdün Havayolları", nameFr: "Royal Jordanian" },
  ME: { code: "ME", nameEn: "Middle East Airlines", nameAr: "طيران الشرق الأوسط", nameTr: "Orta Doğu Havayolları", nameFr: "Middle East Airlines" },
  IA: { code: "IA", nameEn: "Iraqi Airways", nameAr: "الخطوط الجوية العراقية", nameTr: "Irak Havayolları", nameFr: "Iraqi Airways" },
  RB: { code: "RB", nameEn: "Syrian Air", nameAr: "السورية للطيران", nameTr: "Suriye Havayolları", nameFr: "Syrian Air" },
  IY: { code: "IY", nameEn: "Yemenia", nameAr: "الخطوط الجوية اليمنية", nameTr: "Yemen Havayolları", nameFr: "Yemenia" },

  // North African & Egyptian Carriers
  MS: { code: "MS", nameEn: "EgyptAir", nameAr: "مصر للطيران", nameTr: "Mısır Havayolları", nameFr: "EgyptAir" },
  E5: { code: "E5", nameEn: "AlMasria Universal Airlines", nameAr: "المصرية العالمية للطيران", nameTr: "AlMasria Universal Airlines", nameFr: "AlMasria Universal Airlines" },
  SM: { code: "SM", nameEn: "Air Cairo", nameAr: "إير كايرو", nameTr: "Air Cairo", nameFr: "Air Cairo" },
  NP: { code: "NP", nameEn: "Nile Air", nameAr: "النيل للطيران", nameTr: "Nile Air", nameFr: "Nile Air" },
  NE: { code: "NE", nameEn: "Nesma Airlines", nameAr: "طيران نسما", nameTr: "Nesma Havayolları", nameFr: "Nesma Airlines" },
  FT: { code: "FT", nameEn: "FlyEgypt", nameAr: "فلاي إيجيبت", nameTr: "FlyEgypt", nameFr: "FlyEgypt" },
  AT: { code: "AT", nameEn: "Royal Air Maroc", nameAr: "الخطوط الملكية المغربية", nameTr: "Fas Kraliyet Havayolları", nameFr: "Royal Air Maroc" },
  "3O": { code: "3O", nameEn: "Air Arabia Maroc", nameAr: "العربية للطيران المغرب", nameTr: "Air Arabia Maroc", nameFr: "Air Arabia Maroc" },
  TU: { code: "TU", nameEn: "Tunisair", nameAr: "الخطوط التونسية", nameTr: "Tunus Havayolları", nameFr: "Tunisair" },
  BJ: { code: "BJ", nameEn: "Nouvelair", nameAr: "نوفلار تونس", nameTr: "Nouvelair", nameFr: "Nouvelair" },
  AH: { code: "AH", nameEn: "Air Algérie", nameAr: "الخطوط الجوية الجزائرية", nameTr: "Cezayir Havayolları", nameFr: "Air Algérie" },
  LN: { code: "LN", nameEn: "Libyan Airlines", nameAr: "الخطوط الجوية الليبية", nameTr: "Libya Havayolları", nameFr: "Libyan Airlines" },
  SD: { code: "SD", nameEn: "Sudan Airways", nameAr: "الخطوط الجوية السودانية", nameTr: "Sudan Havayolları", nameFr: "Sudan Airways" },
  ET: { code: "ET", nameEn: "Ethiopian Airlines", nameAr: "الخطوط الجوية الإثيوبية", nameTr: "Etiyopya Havayolları", nameFr: "Ethiopian Airlines" },

  // Major European Carriers
  BA: { code: "BA", nameEn: "British Airways", nameAr: "الخطوط الجوية البريطانية", nameTr: "İngiliz Havayolları", nameFr: "British Airways" },
  AF: { code: "AF", nameEn: "Air France", nameAr: "الخطوط الجوية الفرنسية", nameTr: "Fransa Havayolları", nameFr: "Air France" },
  LH: { code: "LH", nameEn: "Lufthansa", nameAr: "لوفتهانزا الألمانية", nameTr: "Lufthansa", nameFr: "Lufthansa" },
  KL: { code: "KL", nameEn: "KLM Royal Dutch Airlines", nameAr: "الخطوط الملكية الهولندية KLM", nameTr: "KLM Hollanda Kraliyet Havayolları", nameFr: "KLM Royal Dutch Airlines" },
  IB: { code: "IB", nameEn: "Iberia", nameAr: "الخطوط الإسبانية إيبيريا", nameTr: "İberya Havayolları", nameFr: "Iberia" },
  AZ: { code: "AZ", nameEn: "ITA Airways", nameAr: "إيتا إيروايز الإيطالية", nameTr: "ITA Airways", nameFr: "ITA Airways" },
  LX: { code: "LX", nameEn: "Swiss International Air Lines", nameAr: "الخطوط الجوية السويسرية", nameTr: "İsviçre Uluslararası Havayolları", nameFr: "Swiss International Air Lines" },
  OS: { code: "OS", nameEn: "Austrian Airlines", nameAr: "الخطوط الجوية النمساوية", nameTr: "Avusturya Havayolları", nameFr: "Austrian Airlines" },
  SN: { code: "SN", nameEn: "Brussels Airlines", nameAr: "خطوط بروكسل الجوية", nameTr: "Brüksel Havayolları", nameFr: "Brussels Airlines" },
  TP: { code: "TP", nameEn: "TAP Air Portugal", nameAr: "طيران تاب البرتغالي", nameTr: "TAP Portekiz Havayolları", nameFr: "TAP Air Portugal" },
  SK: { code: "SK", nameEn: "SAS Scandinavian Airlines", nameAr: "الخطوط الجوية الاسكندنافية SAS", nameTr: "İskandinav Havayolları", nameFr: "SAS Scandinavian Airlines" },
  AY: { code: "AY", nameEn: "Finnair", nameAr: "فين إير الفنلندية", nameTr: "Finnair", nameFr: "Finnair" },
  EI: { code: "EI", nameEn: "Aer Lingus", nameAr: "إير لينغوس الأيرلندية", nameTr: "Aer Lingus", nameFr: "Aer Lingus" },
  A3: { code: "A3", nameEn: "Aegean Airlines", nameAr: "خطوط إيجيان الجوية اليونانية", nameTr: "Ege Havayolları", nameFr: "Aegean Airlines" },
  LO: { code: "LO", nameEn: "LOT Polish Airlines", nameAr: "الخطوط الجوية البولندية لوت", nameTr: "LOT Polonya Havayolları", nameFr: "LOT Polish Airlines" },
  RO: { code: "RO", nameEn: "TAROM", nameAr: "تاروم الرومانية", nameTr: "TAROM", nameFr: "TAROM" },
  JU: { code: "JU", nameEn: "Air Serbia", nameAr: "طيران صربيا", nameTr: "Sırbistan Havayolları", nameFr: "Air Serbia" },

  // European Low-Cost Carriers
  FR: { code: "FR", nameEn: "Ryanair", nameAr: "رايان إير", nameTr: "Ryanair", nameFr: "Ryanair" },
  U2: { code: "U2", nameEn: "easyJet", nameAr: "إيزي جيت", nameTr: "easyJet", nameFr: "easyJet" },
  W6: { code: "W6", nameEn: "Wizz Air", nameAr: "ويز إير", nameTr: "Wizz Air", nameFr: "Wizz Air" },
  W4: { code: "W4", nameEn: "Wizz Air Malta", nameAr: "ويز إير مالطا", nameTr: "Wizz Air Malta", nameFr: "Wizz Air Malta" },
  "5W": { code: "5W", nameEn: "Wizz Air Abu Dhabi", nameAr: "ويز إير أبوظبي", nameTr: "Wizz Air Abu Dhabi", nameFr: "Wizz Air Abu Dhabi" },
  VY: { code: "VY", nameEn: "Vueling Airlines", nameAr: "فولينغ للطيران", nameTr: "Vueling Havayolları", nameFr: "Vueling Airlines" },
  TO: { code: "TO", nameEn: "Transavia France", nameAr: "ترانسافيا فرنسا", nameTr: "Transavia Fransa", nameFr: "Transavia France" },
  HV: { code: "HV", nameEn: "Transavia", nameAr: "ترانسافيا", nameTr: "Transavia", nameFr: "Transavia" },
  DY: { code: "DY", nameEn: "Norwegian Air", nameAr: "النرويجية للطيران", nameTr: "Norveç Havayolları", nameFr: "Norwegian Air" },
  EW: { code: "EW", nameEn: "Eurowings", nameAr: "يورو وينجز", nameTr: "Eurowings", nameFr: "Eurowings" },

  // North American Carriers
  AA: { code: "AA", nameEn: "American Airlines", nameAr: "الخطوط الجوية الأمريكية", nameTr: "Amerikan Havayolları", nameFr: "American Airlines" },
  DL: { code: "DL", nameEn: "Delta Air Lines", nameAr: "دلتا إيرلاينز", nameTr: "Delta Havayolları", nameFr: "Delta Air Lines" },
  UA: { code: "UA", nameEn: "United Airlines", nameAr: "يونايتد إيرلاينز", nameTr: "United Havayolları", nameFr: "United Airlines" },
  AC: { code: "AC", nameEn: "Air Canada", nameAr: "طيران كندا", nameTr: "Kanada Havayolları", nameFr: "Air Canada" },

  // Asian & Worldwide Carriers
  SQ: { code: "SQ", nameEn: "Singapore Airlines", nameAr: "الخطوط الجوية السنغافورية", nameTr: "Singapur Havayolları", nameFr: "Singapore Airlines" },
  CX: { code: "CX", nameEn: "Cathay Pacific", nameAr: "كاثاي باسيفيك", nameTr: "Cathay Pacific", nameFr: "Cathay Pacific" },
  MH: { code: "MH", nameEn: "Malaysia Airlines", nameAr: "الخطوط الجوية الماليزية", nameTr: "Malezya Havayolları", nameFr: "Malaysia Airlines" },
  TG: { code: "TG", nameEn: "Thai Airways", nameAr: "الخطوط الجوية الدولية التايلاندية", nameTr: "Tayland Havayolları", nameFr: "Thai Airways" },
  GA: { code: "GA", nameEn: "Garuda Indonesia", nameAr: "جارودا إندونيسيا", nameTr: "Garuda Indonesia", nameFr: "Garuda Indonesia" },
  AI: { code: "AI", nameEn: "Air India", nameAr: "طيران الهند", nameTr: "Hindistan Havayolları", nameFr: "Air India" },
  PK: { code: "PK", nameEn: "Pakistan International Airlines", nameAr: "الخطوط الجوية الدولية الباكستانية PIA", nameTr: "Pakistan Uluslararası Havayolları", nameFr: "Pakistan International Airlines" },
  BG: { code: "BG", nameEn: "Biman Bangladesh Airlines", nameAr: "خطوط بيمان بنغلاديش الجوية", nameTr: "Biman Bangladeş Havayolları", nameFr: "Biman Bangladesh Airlines" },
  UL: { code: "UL", nameEn: "SriLankan Airlines", nameAr: "الخطوط الجوية السريلانكية", nameTr: "SriLankan Havayolları", nameFr: "SriLankan Airlines" },
  CZ: { code: "CZ", nameEn: "China Southern Airlines", nameAr: "خطوط جنوب الصين الجوية", nameTr: "Güney Çin Havayolları", nameFr: "China Southern Airlines" },
  CA: { code: "CA", nameEn: "Air China", nameAr: "طيران الصين", nameTr: "Çin Havayolları", nameFr: "Air China" },
  MU: { code: "MU", nameEn: "China Eastern Airlines", nameAr: "خطوط شرق الصين الجوية", nameTr: "Doğu Çin Havayolları", nameFr: "China Eastern Airlines" },
  KE: { code: "KE", nameEn: "Korean Air", nameAr: "الخطوط الجوية الكورية", nameTr: "Kore Havayolları", nameFr: "Korean Air" },
  OZ: { code: "OZ", nameEn: "Asiana Airlines", nameAr: "خطوط آسيانا الجوية", nameTr: "Asiana Havayolları", nameFr: "Asiana Airlines" },
  JL: { code: "JL", nameEn: "Japan Airlines", nameAr: "الخطوط الجوية اليابانية JAL", nameTr: "Japon Havayolları", nameFr: "Japan Airlines" },
  NH: { code: "NH", nameEn: "ANA All Nippon Airways", nameAr: "أول نيبون إيرويز اليابانية ANA", nameTr: "Tüm Nippon Havayolları", nameFr: "All Nippon Airways" },
  QF: { code: "QF", nameEn: "Qantas", nameAr: "كانتاس الأسترالية", nameTr: "Qantas", nameFr: "Qantas" },
  VA: { code: "VA", nameEn: "Virgin Australia", nameAr: "فيرجن أستراليا", nameTr: "Virgin Avustralya", nameFr: "Virgin Australia" },
  VS: { code: "VS", nameEn: "Virgin Atlantic", nameAr: "فيرجن أتلانتيك", nameTr: "Virgin Atlantic", nameFr: "Virgin Atlantic" },
  SU: { code: "SU", nameEn: "Aeroflot", nameAr: "أيروفلوت الروسية", nameTr: "Aeroflot Rus Havayolları", nameFr: "Aeroflot" },
  S7: { code: "S7", nameEn: "S7 Airlines", nameAr: "إس سيفن إيرلاينز", nameTr: "S7 Havayolları", nameFr: "S7 Airlines" },
  KC: { code: "KC", nameEn: "Air Astana", nameAr: "طيران أستانا", nameTr: "Air Astana", nameFr: "Air Astana" },
  HY: { code: "HY", nameEn: "Uzbekistan Airways", nameAr: "خطوط أوزبكستان الجوية", nameTr: "Özbekistan Havayolları", nameFr: "Uzbekistan Airways" },
  J2: { code: "J2", nameEn: "Azerbaijan Airlines", nameAr: "الخطوط الجوية الأذربيجانية أزال", nameTr: "Azerbaycan Havayolları (AZAL)", nameFr: "Azerbaijan Airlines" },
};

/**
 * Returns the localized full name of an airline for the current language.
 * Falls back to supplied name or original carrier code.
 */
export function getLocalizedAirlineName(
  codeOrName?: string | null,
  fallbackOrLocale?: string,
  locale?: string
): string {
  if (!codeOrName) return "";
  let lang = "ar";
  let fallback = "";
  if (locale) {
    lang = locale;
    fallback = fallbackOrLocale || "";
  } else if (fallbackOrLocale && ["ar", "en", "tr", "fr"].includes(fallbackOrLocale.toLowerCase())) {
    lang = fallbackOrLocale.toLowerCase();
  } else {
    fallback = fallbackOrLocale || "";
  }

  const raw = String(codeOrName).trim();
  const upper = raw.toUpperCase();

  // Try direct lookup by 2-letter IATA code
  let entry = AIRLINE_DICTIONARY[upper];

  // Try fuzzy match against known names or aliases if code is not 2 letters
  if (!entry) {
    const folded = raw.toLowerCase();
    for (const item of Object.values(AIRLINE_DICTIONARY)) {
      if (
        item.nameEn.toLowerCase() === folded ||
        item.nameAr.toLowerCase() === folded ||
        item.nameTr.toLowerCase() === folded ||
        item.nameFr.toLowerCase() === folded ||
        folded.includes(item.nameEn.toLowerCase()) ||
        item.nameEn.toLowerCase().includes(folded)
      ) {
        entry = item;
        break;
      }
    }
  }

  if (entry) {
    if (lang === "ar") return entry.nameAr;
    if (lang === "tr") return entry.nameTr;
    if (lang === "fr") return entry.nameFr;
    return entry.nameEn;
  }

  return fallback || raw;
}

export const getLocalizedAirline = getLocalizedAirlineName;
