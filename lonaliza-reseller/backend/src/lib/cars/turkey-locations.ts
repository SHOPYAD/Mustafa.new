import type { Locale } from "@/lib/i18n/types";

export type LocationType = "city" | "airport";

export interface TurkeyLocation {
  id: string;
  slug: string;
  type: LocationType;
  names: { ar: string; en: string; tr: string };
  iata?: string;
  cityId?: string;
  lat?: number;
  lng?: number;
}

function city(
  id: string,
  en: string,
  ar: string,
  tr: string,
  lat?: number,
  lng?: number
): TurkeyLocation {
  return {
    id,
    slug: id,
    type: "city",
    names: { en, ar, tr },
    ...(lat != null && lng != null ? { lat, lng } : {}),
  };
}

function airport(
  iata: string,
  en: string,
  ar: string,
  tr: string,
  cityId: string,
  lat?: number,
  lng?: number
): TurkeyLocation {
  const code = iata.toUpperCase();
  const id = `airport-${code.toLowerCase()}`;
  return {
    id,
    slug: id,
    type: "airport",
    names: { en, ar, tr },
    iata: code,
    cityId,
    ...(lat != null && lng != null ? { lat, lng } : {}),
  };
}

/** 81 provinces + main tourist cities. */
const CITIES: TurkeyLocation[] = [
  city("adana", "Adana", "أضنة", "Adana", 37.0, 35.3213),
  city("adiyaman", "Adıyaman", "أديامان", "Adıyaman", 37.7648, 38.2786),
  city("afyonkarahisar", "Afyonkarahisar", "أفيون قره حصار", "Afyonkarahisar", 38.7507, 30.5567),
  city("agri", "Ağrı", "أغري", "Ağrı", 39.7191, 43.0503),
  city("amasya", "Amasya", "أماسيا", "Amasya", 40.6533, 35.8331),
  city("ankara", "Ankara", "أنقرة", "Ankara", 39.9334, 32.8597),
  city("antalya", "Antalya", "أنطاليا", "Antalya", 36.8969, 30.7133),
  city("artvin", "Artvin", "أرتفين", "Artvin", 41.1828, 41.8183),
  city("aydin", "Aydın", "أيدين", "Aydın", 37.8444, 27.8458),
  city("balikesir", "Balıkesir", "باليكسير", "Balıkesir", 39.6484, 27.8826),
  city("bilecik", "Bilecik", "بيليجك", "Bilecik", 40.1426, 29.9793),
  city("bingol", "Bingöl", "بينغول", "Bingöl", 38.8855, 40.4966),
  city("bitlis", "Bitlis", "بتليس", "Bitlis", 38.4006, 42.1095),
  city("bolu", "Bolu", "بولو", "Bolu", 40.735, 31.6061),
  city("burdur", "Burdur", "بوردور", "Burdur", 37.7203, 30.2908),
  city("bursa", "Bursa", "بورصة", "Bursa", 40.1885, 29.061),
  city("canakkale", "Çanakkale", "جنق قلعة", "Çanakkale", 40.1553, 26.4142),
  city("cankiri", "Çankırı", "جانقري", "Çankırı", 40.6013, 33.6134),
  city("corum", "Çorum", "جوروم", "Çorum", 40.5506, 34.9556),
  city("denizli", "Denizli", "دنيزلي", "Denizli", 37.7765, 29.0864),
  city("diyarbakir", "Diyarbakır", "ديار بكر", "Diyarbakır", 37.9144, 40.2306),
  city("edirne", "Edirne", "أدرنة", "Edirne", 41.6771, 26.5557),
  city("elazig", "Elazığ", "إلازيغ", "Elazığ", 38.6748, 39.2225),
  city("erzincan", "Erzincan", "أرضنجان", "Erzincan", 39.7505, 39.4914),
  city("erzurum", "Erzurum", "أرضروم", "Erzurum", 39.9055, 41.2658),
  city("eskisehir", "Eskişehir", "إسكي شهير", "Eskişehir", 39.7767, 30.5206),
  city("gaziantep", "Gaziantep", "غازي عنتاب", "Gaziantep", 37.0662, 37.3833),
  city("giresun", "Giresun", "غيرسون", "Giresun", 40.9128, 38.3895),
  city("gumushane", "Gümüşhane", "كوموش خانة", "Gümüşhane", 40.4608, 39.4808),
  city("hakkari", "Hakkâri", "هكاري", "Hakkâri", 37.5744, 43.7408),
  city("hatay", "Hatay", "هاتاي", "Hatay", 36.2023, 36.1613),
  city("isparta", "Isparta", "إسبرطة", "Isparta", 37.7648, 30.5566),
  city("mersin", "Mersin", "مرسين", "Mersin", 36.8121, 34.6415),
  city("istanbul", "Istanbul", "إسطنبول", "İstanbul", 41.0082, 28.9784),
  city("izmir", "Izmir", "إزمير", "İzmir", 38.4237, 27.1428),
  city("kars", "Kars", "قارص", "Kars", 40.6013, 43.0975),
  city("kastamonu", "Kastamonu", "قسطموني", "Kastamonu", 41.3767, 33.7765),
  city("kayseri", "Kayseri", "قيصري", "Kayseri", 38.7205, 35.4826),
  city("kirklareli", "Kırklareli", "قرقلر إيلي", "Kırklareli", 41.7351, 27.2252),
  city("kirsehir", "Kırşehir", "قير شهر", "Kırşehir", 39.1461, 34.1606),
  city("kocaeli", "Kocaeli", "قوجه إيلي", "Kocaeli", 40.7654, 29.9408),
  city("konya", "Konya", "قونية", "Konya", 37.8746, 32.4932),
  city("kutahya", "Kütahya", "كوتاهيا", "Kütahya", 39.4167, 29.9833),
  city("malatya", "Malatya", "ملاطية", "Malatya", 38.3554, 38.3335),
  city("manisa", "Manisa", "مانيسا", "Manisa", 38.614, 27.4296),
  city("kahramanmaras", "Kahramanmaraş", "قهرمان مرعش", "Kahramanmaraş", 37.5753, 36.9228),
  city("mardin", "Mardin", "ماردين", "Mardin", 37.3129, 40.734),
  city("mugla", "Muğla", "موغلا", "Muğla", 37.2154, 28.3634),
  city("mus", "Muş", "موش", "Muş", 38.7433, 41.5065),
  city("nevsehir", "Nevşehir", "نوشهر", "Nevşehir", 38.6244, 34.7239),
  city("nigde", "Niğde", "نيدا", "Niğde", 37.9667, 34.6833),
  city("ordu", "Ordu", "أوردو", "Ordu", 40.9839, 37.8764),
  city("rize", "Rize", "ريزة", "Rize", 41.0201, 40.5234),
  city("sakarya", "Sakarya", "صقاريا", "Sakarya", 40.7569, 30.3781),
  city("samsun", "Samsun", "سامسون", "Samsun", 41.2867, 36.33),
  city("siirt", "Siirt", "سعرد", "Siirt", 37.9333, 41.95),
  city("sinop", "Sinop", "سينوب", "Sinop", 42.0267, 35.1551),
  city("sivas", "Sivas", "سيواس", "Sivas", 39.7477, 37.0179),
  city("tekirdag", "Tekirdağ", "تكيرداغ", "Tekirdağ", 40.9781, 27.5117),
  city("tokat", "Tokat", "توقات", "Tokat", 40.3167, 36.55),
  city("trabzon", "Trabzon", "طرابزون", "Trabzon", 41.0027, 39.7168),
  city("tunceli", "Tunceli", "تونج إيلي", "Tunceli", 39.1061, 39.5481),
  city("sanliurfa", "Şanlıurfa", "شانلي أورفا", "Şanlıurfa", 37.1591, 38.7969),
  city("usak", "Uşak", "أوشاك", "Uşak", 38.6742, 29.4058),
  city("van", "Van", "وان", "Van", 38.4891, 43.4089),
  city("yozgat", "Yozgat", "يوزغات", "Yozgat", 39.82, 34.8044),
  city("zonguldak", "Zonguldak", "زنغولداق", "Zonguldak", 41.4564, 31.7987),
  city("aksaray", "Aksaray", "أق سراي", "Aksaray", 38.3686, 34.036),
  city("bayburt", "Bayburt", "بايبورت", "Bayburt", 40.2552, 40.2249),
  city("karaman", "Karaman", "كارامان", "Karaman", 37.1759, 33.2287),
  city("kirikkale", "Kırıkkale", "قيريق قلعة", "Kırıkkale", 39.8468, 33.5153),
  city("batman", "Batman", "بطمان", "Batman", 37.8812, 41.1351),
  city("sirnak", "Şırnak", "شرناق", "Şırnak", 37.5164, 42.4611),
  city("bartin", "Bartın", "بارتين", "Bartın", 41.6344, 32.3375),
  city("ardahan", "Ardahan", "أردهان", "Ardahan", 41.1105, 42.7022),
  city("igdir", "Iğdır", "إغدير", "Iğdır", 39.9167, 44.0333),
  city("yalova", "Yalova", "يالوفا", "Yalova", 40.65, 29.2667),
  city("karabuk", "Karabük", "قره بوك", "Karabük", 41.2049, 32.6277),
  city("kilis", "Kilis", "كيليس", "Kilis", 36.7184, 37.1212),
  city("osmaniye", "Osmaniye", "عثمانية", "Osmaniye", 37.0742, 36.2467),
  city("duzce", "Düzce", "دوزجه", "Düzce", 40.8438, 31.1565),
  city("bodrum", "Bodrum", "بودروم", "Bodrum", 37.0344, 27.4305),
  city("marmaris", "Marmaris", "مرمريس", "Marmaris", 36.855, 28.2742),
  city("fethiye", "Fethiye", "فتحية", "Fethiye", 36.621, 29.1164),
  city("alanya", "Alanya", "ألانيا", "Alanya", 36.5444, 32.0006),
  city("side", "Side", "سيدي", "Side", 36.7667, 31.3889),
  city("kusadasi", "Kuşadası", "كوش أداسي", "Kuşadası", 37.8579, 27.261),
  city("cappadocia", "Cappadocia", "كابادوكيا", "Kapadokya", 38.6431, 34.8289),
  city("goreme", "Göreme", "غوريم", "Göreme", 38.6431, 34.8289),
  city("sapanca", "Sapanca", "سبانجا", "Sapanca", 40.6914, 30.2678),
  city("ayder", "Ayder", "آيدر", "Ayder", 40.95, 41.1333),
  city("pamukkale", "Pamukkale", "باموكالي", "Pamukkale", 37.9137, 29.1187),
  city("cesme", "Çeşme", "تشيشمه", "Çeşme", 38.3228, 26.3064),
  city("kas", "Kaş", "كاش", "Kaş", 36.1997, 29.6378),
  city("belek", "Belek", "بيلك", "Belek", 36.8628, 31.0556),
  city("oludeniz", "Ölüdeniz", "أولودينيز", "Ölüdeniz", 36.55, 29.1167),
  city("dalaman", "Dalaman", "دالامان", "Dalaman", 36.7667, 28.8),
  city("datca", "Datça", "داتشا", "Datça", 36.7278, 27.6842),
  city("didim", "Didim", "ديديم", "Didim", 37.3756, 27.2678),
  city("kalkan", "Kalkan", "كالكان", "Kalkan", 36.2653, 29.4153),
];

/** Major commercial / scheduled-passenger airports. */
const AIRPORTS: TurkeyLocation[] = [
  airport("IST", "Istanbul Airport", "مطار إسطنبول", "İstanbul Havalimanı", "istanbul", 41.2753, 28.7519),
  airport("SAW", "Sabiha Gökçen Airport", "مطار صبيحة كوكجن", "Sabiha Gökçen Havalimanı", "istanbul", 40.8986, 29.3092),
  airport("AYT", "Antalya Airport", "مطار أنطاليا", "Antalya Havalimanı", "antalya", 36.8987, 30.8005),
  airport("ADB", "Izmir Adnan Menderes Airport", "مطار إزمير عدنان مندريس", "İzmir Adnan Menderes Havalimanı", "izmir", 38.2924, 27.157),
  airport("ESB", "Ankara Esenboğa Airport", "مطار أنقرة أسنبوغا", "Ankara Esenboğa Havalimanı", "ankara", 40.1281, 32.9951),
  airport("BJV", "Milas–Bodrum Airport", "مطار ميلاس بودروم", "Milas-Bodrum Havalimanı", "bodrum", 37.2506, 27.6643),
  airport("DLM", "Dalaman Airport", "مطار دالامان", "Dalaman Havalimanı", "dalaman", 36.7131, 28.7925),
  airport("GZT", "Gaziantep Airport", "مطار غازي عنتاب", "Gaziantep Havalimanı", "gaziantep", 36.9472, 37.4787),
  airport("TZX", "Trabzon Airport", "مطار طرابزون", "Trabzon Havalimanı", "trabzon", 40.995, 39.7897),
  airport("ASR", "Kayseri Erkilet Airport", "مطار قيصري إركيليت", "Kayseri Erkilet Havalimanı", "kayseri", 38.7704, 35.4954),
  airport("VAN", "Van Ferit Melen Airport", "مطار وان فريت ملان", "Van Ferit Melen Havalimanı", "van", 38.4682, 43.3323),
  airport("SZF", "Samsun Çarşamba Airport", "مطار سامسون تشارشامبا", "Samsun Çarşamba Havalimanı", "samsun", 41.2545, 36.5671),
  airport("EZS", "Elazığ Airport", "مطار إلازيغ", "Elazığ Havalimanı", "elazig", 38.6069, 39.2914),
  airport("NAV", "Nevşehir Kapadokya Airport", "مطار نوشهر كابادوكيا", "Nevşehir Kapadokya Havalimanı", "cappadocia", 38.7719, 34.5344),
  airport("ADA", "Adana Şakirpaşa Airport", "مطار أضنة شاكر باشا", "Adana Şakirpaşa Havalimanı", "adana", 36.9822, 35.2804),
  airport("DIY", "Diyarbakır Airport", "مطار ديار بكر", "Diyarbakır Havalimanı", "diyarbakir", 37.8939, 40.201),
  airport("GNY", "Şanlıurfa GAP Airport", "مطار شانلي أورفا غاب", "Şanlıurfa GAP Havalimanı", "sanliurfa", 37.4457, 38.8956),
  airport("HTY", "Hatay Airport", "مطار هاتاي", "Hatay Havalimanı", "hatay", 36.3628, 36.2822),
  airport("ERZ", "Erzurum Airport", "مطار أرضروم", "Erzurum Havalimanı", "erzurum", 39.9565, 41.1702),
  airport("MLX", "Malatya Airport", "مطار ملاطية", "Malatya Havalimanı", "malatya", 38.4353, 38.091),
  airport("KYA", "Konya Airport", "مطار قونية", "Konya Havalimanı", "konya", 37.979, 32.5619),
  airport("OGU", "Ordu-Giresun Airport", "مطار أوردو غيرسون", "Ordu-Giresun Havalimanı", "ordu", 40.966, 38.086),
  airport("GZP", "Gazipaşa-Alanya Airport", "مطار غازي باشا ألانيا", "Gazipaşa-Alanya Havalimanı", "alanya", 36.2993, 32.3006),
  airport("RZV", "Rize–Artvin Airport", "مطار ريزة أرتفين", "Rize-Artvin Havalimanı", "rize", 41.176, 40.849),
  airport("TEQ", "Tekirdağ Çorlu Airport", "مطار تكيرداغ تشورلو", "Tekirdağ Çorlu Havalimanı", "tekirdag", 41.1382, 27.9191),
  airport("YEI", "Bursa Yenişehir Airport", "مطار بورصة يني شهير", "Bursa Yenişehir Havalimanı", "bursa", 40.2552, 29.5628),
  airport("BAL", "Batman Airport", "مطار بطمان", "Batman Havalimanı", "batman", 37.929, 41.1166),
  airport("MQM", "Mardin Airport", "مطار ماردين", "Mardin Havalimanı", "mardin", 37.2233, 40.6317),
  airport("MSR", "Muş Airport", "مطار موش", "Muş Havalimanı", "mus", 38.7478, 41.6611),
  airport("AJI", "Ağrı Ahmed-i Hani Airport", "مطار أغري أحمد خاني", "Ağrı Ahmed-i Hani Havalimanı", "agri", 39.6545, 43.027),
  airport("IGD", "Iğdır Airport", "مطار إغدير", "Iğdır Havalimanı", "igdir", 39.9766, 43.8667),
  airport("BGG", "Bingöl Airport", "مطار بينغول", "Bingöl Havalimanı", "bingol", 38.8611, 40.5925),
  airport("YKO", "Hakkari Yüksekova Airport", "مطار هكاري يوكسكوفا", "Hakkari Yüksekova Havalimanı", "hakkari", 37.55, 44.2333),
  airport("NKT", "Şırnak Şerafettin Elçi Airport", "مطار شرناق شرف الدين ألجي", "Şırnak Şerafettin Elçi Havalimanı", "sirnak", 37.3639, 42.0583),
  airport("KCM", "Kahramanmaraş Airport", "مطار قهرمان مرعش", "Kahramanmaraş Havalimanı", "kahramanmaras", 37.5388, 36.9534),
  airport("VAS", "Sivas Nuri Demirağ Airport", "مطار سيواس نوري دميرآغ", "Sivas Nuri Demirağ Havalimanı", "sivas", 39.8138, 36.9039),
  airport("MZH", "Amasya Merzifon Airport", "مطار أماسيا ميرزيفون", "Amasya Merzifon Havalimanı", "amasya", 40.8294, 35.5219),
  airport("EDO", "Balıkesir Koca Seyit Airport", "مطار باليكسير كوجا سيد", "Balıkesir Koca Seyit Havalimanı", "balikesir", 39.5547, 27.0138),
  airport("AOE", "Eskişehir Hasan Polatkan Airport", "مطار إسكي شهير حسن بولاتكان", "Eskişehir Hasan Polatkan Havalimanı", "eskisehir", 39.81, 30.5194),
  airport("ISE", "Isparta Süleyman Demirel Airport", "مطار إسبرطة سليمان دميريل", "Isparta Süleyman Demirel Havalimanı", "isparta", 37.8554, 30.3684),
  airport("KZR", "Zafer Airport", "مطار ظفر", "Zafer Havalimanı", "kutahya", 39.1114, 30.13),
  airport("USQ", "Uşak Airport", "مطار أوشاك", "Uşak Havalimanı", "usak", 38.6815, 29.4717),
  airport("DNZ", "Denizli Çardak Airport", "مطار دنيزلي تشارداك", "Denizli Çardak Havalimanı", "denizli", 37.7856, 29.7013),
  airport("ERC", "Erzincan Airport", "مطار أرضنجان", "Erzincan Havalimanı", "erzincan", 39.7102, 39.527),
  airport("TJK", "Tokat Airport", "مطار توقات", "Tokat Havalimanı", "tokat", 40.3074, 36.3711),
  airport("ADF", "Adıyaman Airport", "مطار أديامان", "Adıyaman Havalimanı", "adiyaman", 37.7314, 38.4689),
  airport("SXZ", "Siirt Airport", "مطار سعرد", "Siirt Havalimanı", "siirt", 37.9789, 41.8404),
  airport("NOP", "Sinop Airport", "مطار سينوب", "Sinop Havalimanı", "sinop", 42.0158, 35.0664),
  airport("KFS", "Kastamonu Airport", "مطار قسطموني", "Kastamonu Havalimanı", "kastamonu", 41.3142, 33.7961),
  airport("CKZ", "Çanakkale Airport", "مطار جنق قلعة", "Çanakkale Havalimanı", "canakkale", 40.1377, 26.4268),
  airport("ONQ", "Zonguldak Çaycuma Airport", "مطار زنغولداق تشايجوما", "Zonguldak Çaycuma Havalimanı", "zonguldak", 41.5061, 32.0886),
  airport("KSY", "Kars Harakani Airport", "مطار قارص هاركاني", "Kars Harakani Havalimanı", "kars", 40.5622, 43.115),
  airport("BZI", "Balıkesir Merkez Airport", "مطار باليكسير المركزي", "Balıkesir Merkez Havalimanı", "balikesir", 39.6193, 27.926),
];

export const TURKEY_LOCATIONS: TurkeyLocation[] = [...CITIES, ...AIRPORTS];

const BY_ID = new Map(TURKEY_LOCATIONS.map((loc) => [loc.id, loc]));
const BY_SLUG = new Map(TURKEY_LOCATIONS.map((loc) => [loc.slug, loc]));
const BY_IATA = new Map(
  TURKEY_LOCATIONS.filter((loc) => loc.iata).map((loc) => [loc.iata as string, loc])
);

export const TURKEY_CITIES = CITIES;
export const TURKEY_AIRPORTS = AIRPORTS;

/** High-demand pickup set used by the nationwide seed fleet. */
export const MAJOR_PICKUP_IDS: string[] = [
  "istanbul",
  "airport-ist",
  "airport-saw",
  "ankara",
  "airport-esb",
  "izmir",
  "airport-adb",
  "antalya",
  "airport-ayt",
  "bodrum",
  "airport-bjv",
  "dalaman",
  "airport-dlm",
  "fethiye",
  "marmaris",
  "alanya",
  "airport-gzp",
  "cappadocia",
  "nevsehir",
  "airport-nav",
  "kayseri",
  "airport-asr",
  "trabzon",
  "airport-tzx",
  "gaziantep",
  "airport-gzt",
  "bursa",
  "airport-yei",
  "kusadasi",
  "cesme",
];

export function getLocationById(id: string): TurkeyLocation | undefined {
  return BY_ID.get(id);
}

export function getLocationBySlug(slug: string): TurkeyLocation | undefined {
  return BY_SLUG.get(slug);
}

export function getLocationByIata(iata: string): TurkeyLocation | undefined {
  return BY_IATA.get(iata.trim().toUpperCase());
}

export function locationDisplayName(
  loc: TurkeyLocation,
  locale: Locale
): string {
  const name =
    locale === "ar"
      ? loc.names.ar
      : locale === "tr"
        ? loc.names.tr
        : loc.names.en;
  return loc.iata ? `${name} (${loc.iata})` : name;
}

export function locationTypeLabel(type: LocationType, locale: Locale): string {
  switch (type) {
    case "city":
      return locale === "ar" ? "مدينة" : locale === "tr" ? "Şehir" : "City";
    case "airport":
      return locale === "ar" ? "مطار" : locale === "tr" ? "Havalimanı" : "Airport";
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

function normalizeQuery(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u");
}

function locationSearchBlob(loc: TurkeyLocation): string {
  return normalizeQuery(
    [
      loc.id,
      loc.slug,
      loc.iata || "",
      loc.cityId || "",
      loc.names.ar,
      loc.names.en,
      loc.names.tr,
    ].join(" ")
  );
}

export function filterTurkeyLocations(
  query: string,
  locale: Locale,
  limit = 12
): TurkeyLocation[] {
  const raw = query.trim();
  if (!raw) return [];
  const q = normalizeQuery(raw);
  const iataGuess = raw.toUpperCase();

  const scored = TURKEY_LOCATIONS.map((loc) => {
    let score = 0;
    if (loc.iata && loc.iata === iataGuess) score += 100;
    if (loc.id === q || loc.slug === q) score += 90;
    const name = normalizeQuery(locationDisplayName(loc, locale));
    if (name.startsWith(q)) score += 40;
    if (normalizeQuery(loc.names.en).startsWith(q)) score += 30;
    if (normalizeQuery(loc.names.tr).startsWith(q)) score += 30;
    if (loc.names.ar.includes(raw)) score += 35;
    if (locationSearchBlob(loc).includes(q)) score += 10;
    if (loc.type === "airport" && score > 0) score += 2;
    return { loc, score };
  })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.loc.names.en.localeCompare(b.loc.names.en));

  return scored.slice(0, limit).map((row) => row.loc);
}

/** Resolve a typed id, IATA, slug, or free-text location name. */
export function resolveLocationQuery(query: string): TurkeyLocation | undefined {
  const raw = query.trim();
  if (!raw) return undefined;
  const byId = getLocationById(raw) || getLocationBySlug(raw);
  if (byId) return byId;
  const byIata = getLocationByIata(raw);
  if (byIata) return byIata;

  const paren = raw.match(/\(([A-Z]{3})\)/i);
  if (paren) {
    const fromCode = getLocationByIata(paren[1]);
    if (fromCode) return fromCode;
  }

  const q = normalizeQuery(raw.replace(/\s*\([A-Z]{3}\)\s*/i, " "));
  return TURKEY_LOCATIONS.find((loc) => {
    return (
      normalizeQuery(loc.names.en) === q ||
      normalizeQuery(loc.names.tr) === q ||
      loc.names.ar === raw ||
      normalizeQuery(loc.names.ar) === q
    );
  });
}

export function relatedLocationIds(loc: TurkeyLocation): string[] {
  const ids = new Set<string>([loc.id]);
  if (loc.type === "airport" && loc.cityId) {
    ids.add(loc.cityId);
  }
  if (loc.type === "city") {
    for (const other of TURKEY_LOCATIONS) {
      if (other.type === "airport" && other.cityId === loc.id) {
        ids.add(other.id);
      }
    }
    if (loc.id === "cappadocia") {
      ids.add("nevsehir");
      ids.add("goreme");
      ids.add("airport-nav");
    }
    if (loc.id === "nevsehir" || loc.id === "goreme") {
      ids.add("cappadocia");
      ids.add("airport-nav");
    }
  }
  return [...ids];
}
