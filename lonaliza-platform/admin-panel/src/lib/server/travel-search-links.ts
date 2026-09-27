import { buildCarsSearchHref } from "@/lib/cars-search-href";
import { resolveLocationQuery } from "@/lib/cars/turkey-locations";
import { buildTransfersSearchHref } from "@/lib/transfers-search-href";
import {
  buildFlightsPageHref,
  extractIataCode,
} from "@/lib/travelpayouts-utils";
import type { Locale } from "@/lib/i18n/types";
import type {
  CarsSearchHints,
  FlightSearchHints,
  TransferSearchHints,
} from "@/types/sales-chat";

const ALLOWED_PREFIXES = [
  "/flights",
  "/transfers",
  "/cars",
  "/hotels",
  "/holidays",
  "/packages",
  "/package",
  "/vip-tours",
  "/tours",
];

const CITY_IATA: Record<string, string> = {
  istanbul: "IST",
  "istanbul (ist)": "IST",
  ist: "IST",
  saw: "SAW",
  "sahiha": "SAW",
  "sabiha": "SAW",
  antalya: "AYT",
  antalia: "AYT",
  antialya: "AYT",
  أسطنبول: "IST",
  اسطنبول: "IST",
  إسطنبول: "IST",
  استانبول: "IST",
  أنطاليا: "AYT",
  انطاليا: "AYT",
  أنطالية: "AYT",
  انطالية: "AYT",
  أنطلييا: "AYT",
  انطلييا: "AYT",
  trabzon: "TZX",
  طرابزون: "TZX",
  ankara: "ESB",
  أنقرة: "ESB",
  انقره: "ESB",
  izmir: "ADB",
  أزمير: "ADB",
  cappadocia: "ASR",
  kapadokya: "ASR",
  كابادوكيا: "ASR",
  kayseri: "ASR",
  dubai: "DXB",
  دبي: "DXB",
  "abu dhabi": "AUH",
  "أبوظبي": "AUH",
  ابوظبي: "AUH",
  sharjah: "SHJ",
  الشارقة: "SHJ",
  doha: "DOH",
  الدوحة: "DOH",
  riyadh: "RUH",
  الرياض: "RUH",
  jeddah: "JED",
  جدة: "JED",
  kuwait: "KWI",
  الكويت: "KWI",
  bahrain: "BAH",
  البحرين: "BAH",
  muscat: "MCT",
  مسقط: "MCT",
  amman: "AMM",
  عمّان: "AMM",
  عمان: "AMM",
  cairo: "CAI",
  القاهرة: "CAI",
  london: "LHR",
  لندن: "LHR",
  paris: "CDG",
  باريس: "CDG",
  cdg: "CDG",
  ory: "ORY",
  rome: "FCO",
  roma: "FCO",
  روما: "FCO",
  fco: "FCO",
  cia: "CIA",
  milan: "MXP",
  milano: "MXP",
  ميلانو: "MXP",
  ميلان: "MXP",
  mxp: "MXP",
  lin: "LIN",
  bgy: "BGY",
  barcelona: "BCN",
  برشلونة: "BCN",
  برشلونه: "BCN",
  bcn: "BCN",
  madrid: "MAD",
  مدريد: "MAD",
  mad: "MAD",
  vienna: "VIE",
  wien: "VIE",
  فيينا: "VIE",
  vie: "VIE",
  amsterdam: "AMS",
  أمستردام: "AMS",
  امستردام: "AMS",
  ams: "AMS",
  berlin: "BER",
  برلين: "BER",
  ber: "BER",
  munich: "MUC",
  "münchen": "MUC",
  ميونخ: "MUC",
  ميونك: "MUC",
  muc: "MUC",
  frankfurt: "FRA",
  فرانكفورت: "FRA",
  fra: "FRA",
  zurich: "ZRH",
  "zürich": "ZRH",
  زيورخ: "ZRH",
  زيوريخ: "ZRH",
  zrh: "ZRH",
  geneva: "GVA",
  "genève": "GVA",
  جنيف: "GVA",
  gva: "GVA",
  prague: "PRG",
  praha: "PRG",
  براغ: "PRG",
  prg: "PRG",
  budapest: "BUD",
  بودابست: "BUD",
  bud: "BUD",
  athens: "ATH",
  أثينا: "ATH",
  اثينا: "ATH",
  ath: "ATH",
  baku: "GYD",
  باكو: "GYD",
  gyd: "GYD",
  tbilisi: "TBS",
  تبليسي: "TBS",
  tbs: "TBS",
  "kuala lumpur": "KUL",
  كوالالمبور: "KUL",
  "كوالا لمبور": "KUL",
  kul: "KUL",
  bangkok: "BKK",
  بانكوك: "BKK",
  bkk: "BKK",
  phuket: "HKT",
  بوكيت: "HKT",
  فوكيت: "HKT",
  hkt: "HKT",
  singapore: "SIN",
  سنغافورة: "SIN",
  سنغافوره: "SIN",
  sin: "SIN",
  tokyo: "NRT",
  طوكيو: "NRT",
  nrt: "NRT",
  hnd: "HND",
  seoul: "ICN",
  سيول: "ICN",
  سول: "ICN",
  icn: "ICN",
  beijing: "PEK",
  بكين: "PEK",
  pek: "PEK",
  shanghai: "PVG",
  شنغهاي: "PVG",
  pvg: "PVG",
  "hong kong": "HKG",
  "هونغ كونغ": "HKG",
  "هونج كونج": "HKG",
  hkg: "HKG",
  bali: "DPS",
  بالي: "DPS",
  dps: "DPS",
  maldives: "MLE",
  مالديف: "MLE",
  المالديف: "MLE",
  mle: "MLE",
  seychelles: "SEZ",
  سيشل: "SEZ",
  sez: "SEZ",
  mauritius: "MRU",
  موريشيوس: "MRU",
  mru: "MRU",
  "new york": "JFK",
  نيويورك: "JFK",
  jfk: "JFK",
  nyc: "NYC",
  "los angeles": "LAX",
  "لوس أنجلوس": "LAX",
  "لوس انجلوس": "LAX",
  lax: "LAX",
  chicago: "ORD",
  شيكاغو: "ORD",
  ord: "ORD",
  miami: "MIA",
  ميامي: "MIA",
  mia: "MIA",
  toronto: "YYZ",
  تورونتو: "YYZ",
  yyz: "YYZ",
  sydney: "SYD",
  سيدني: "SYD",
  syd: "SYD",
  dammam: "DMM",
  الدمام: "DMM",
  dmm: "DMM",
  madinah: "MED",
  medina: "MED",
  "المدينة المنورة": "MED",
  "المدينه المنوره": "MED",
  المدينة: "MED",
  med: "MED",
  abha: "AHB",
  أبها: "AHB",
  ابها: "AHB",
  ahb: "AHB",
  alula: "ULH",
  العلا: "ULH",
  ulh: "ULH",
  taif: "TIF",
  الطائف: "TIF",
  tif: "TIF",
  salalah: "SLL",
  صلالة: "SLL",
  صلاله: "SLL",
  sll: "SLL",
  beirut: "BEY",
  بيروت: "BEY",
  bey: "BEY",
  tunis: "TUN",
  تونس: "TUN",
  tun: "TUN",
  marrakech: "RAK",
  marrakesh: "RAK",
  مراكش: "RAK",
  rak: "RAK",
  alexandria: "HBE",
  الإسكندرية: "HBE",
  الاسكندرية: "HBE",
  hbe: "HBE",
  "sharm el sheikh": "SSH",
  "شرم الشيخ": "SSH",
  ssh: "SSH",
  hurghada: "HRG",
  الغردقة: "HRG",
  الغردقه: "HRG",
  hrg: "HRG",
  casablanca: "CMN",
  "casa blanca": "CMN",
  cmn: "CMN",
  "الدار البيضاء": "CMN",
  الدارالبيضاء: "CMN",
  البيضاء: "CMN",
  كازابلانكا: "CMN",
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isIsoDate(value?: string): value is string {
  return Boolean(value && ISO_DATE.test(value));
}

export function sanitizeSiteHref(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  let value = String(raw).trim();
  if (!value) return undefined;

  try {
    if (/^https?:\/\//i.test(value)) {
      const url = new URL(value);
      const host = url.hostname.replace(/^www\./, "");
      if (host !== "lonaliza.com" && host !== "localhost") return undefined;
      value = `${url.pathname}${url.search}`;
    }
  } catch {
    return undefined;
  }

  if (!value.startsWith("/")) return undefined;
  if (value.startsWith("//")) return undefined;
  const pathOnly = value.split("?")[0];
  const allowed = ALLOWED_PREFIXES.some(
    (prefix) => pathOnly === prefix || pathOnly.startsWith(`${prefix}/`)
  );
  return allowed ? value : undefined;
}

export function resolveIataCode(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  const fromExtract = extractIataCode(String(raw));
  if (fromExtract) return fromExtract;

  const key = String(raw)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  if (CITY_IATA[key]) return CITY_IATA[key];

  const loc = resolveLocationQuery(String(raw));
  if (loc?.iata) return loc.iata;
  if (loc?.type === "city") {
    const airport = resolveLocationQuery(`${loc.names.en} airport`);
    if (airport?.iata) return airport.iata;
  }
  return undefined;
}

const CITY_NAMES_BY_LENGTH = Object.keys(CITY_IATA).sort((a, b) => b.length - a.length);

function cityCodeInChunk(chunk: string): string | undefined {
  const hay = String(chunk || "").trim();
  if (!hay) return undefined;
  const direct = resolveIataCode(hay);
  if (direct) return direct;
  const lower = hay.toLowerCase();
  for (const name of CITY_NAMES_BY_LENGTH) {
    if (name.length < 3) continue;
    if (lower.includes(name.toLowerCase())) return CITY_IATA[name];
  }
  return undefined;
}

function extractOdByCityScan(text: string): { from?: string; to?: string } {
  const lower = String(text || "").toLowerCase();
  if (!lower) return {};
  const found: { pos: number; code: string }[] = [];
  for (const name of CITY_NAMES_BY_LENGTH) {
    if (name.length < 3) continue;
    const idx = lower.indexOf(name.toLowerCase());
    if (idx < 0) continue;
    found.push({ pos: idx, code: CITY_IATA[name] });
  }
  found.sort((a, b) => a.pos - b.pos);
  const unique: string[] = [];
  for (const hit of found) {
    if (!unique.includes(hit.code)) unique.push(hit.code);
  }
  if (unique.length >= 2) return { from: unique[0], to: unique[1] };
  if (unique.length === 1) return { to: unique[0] };
  return {};
}

/** Pull origin/destination from typed speech like «من الدار البيضاء الى اسطنبول». */
export function extractOdFromText(text: string): { from?: string; to?: string } {
  const t = String(text || "").trim();
  if (!t) return {};
  const arRe =
    /من\s+(.+?)\s+(?:الى|إلى)\s+(.+?)(?=\s+(?:ذهاب|عودة|شخص|وزن|بعد|مباشر|رخيص|ارخص|رحلة|تذكرة|فقط|أفضل|افضل|وأفضل)|[،,]|$)/gi;
  const enRe = /\bfrom\s+(.+?)\s+to\s+(.+?)(?=\s|$|,)/gi;
  const matches = [...t.matchAll(arRe), ...t.matchAll(enRe)];
  const last = matches[matches.length - 1];
  if (last) {
    const from = cityCodeInChunk(last[1]);
    const to = cityCodeInChunk(last[2]);
    if (from || to) return { from, to };
  }
  return extractOdByCityScan(t);
}

export function textNamesOrigin(text: string): boolean {
  return /(?:^|[\s،,])(?:من|from)\s+\S+/i.test(String(text || ""));
}

export function buildAdvisorFlightHref(
  hints?: FlightSearchHints | null,
  fallbackHref?: string
): string | undefined {
  if (hints?.alreadyBookedFlights) return undefined;

  const fromIata = resolveIataCode(hints?.fromIata || hints?.from);
  const toIata = resolveIataCode(hints?.toIata || hints?.to);
  if (fromIata && toIata) {
    const guests = String(hints?.guests || "1");
    const flightType = hints?.flightType === "round-trip" ? "round-trip" : "one-way";
    return buildFlightsPageHref({
      fromIata,
      toIata,
      guests,
      cabinClass: hints?.cabinClass || "economy",
      flightType,
      date: isIsoDate(hints?.date) ? hints?.date : undefined,
      returnDate:
        flightType === "round-trip" && isIsoDate(hints?.returnDate)
          ? hints?.returnDate
          : undefined,
    });
  }

  return sanitizeSiteHref(fallbackHref);
}

export function buildAdvisorTransferHref(
  hints?: TransferSearchHints | null,
  fallbackHref?: string
): string | undefined {
  const from = String(hints?.from || "").trim();
  const to = String(hints?.to || "").trim();
  if (from && to) {
    return buildTransfersSearchHref({
      from,
      to,
      date: isIsoDate(hints?.date) ? hints.date : undefined,
      time: hints?.time,
      guests: hints?.guests,
    });
  }
  return sanitizeSiteHref(fallbackHref);
}

export function buildAdvisorCarsHref(
  hints?: CarsSearchHints | null,
  fallbackHref?: string,
  locale: Locale = "ar"
): string | undefined {
  const iata =
    resolveIataCode(hints?.iata || hints?.city) ||
    (hints?.city ? resolveIataCode(hints.city) : undefined);
  if (iata) {
    return buildCarsSearchHref({
      iata,
      locale,
      guests: Number(hints?.guests) || undefined,
      date: isIsoDate(hints?.date) ? hints.date : undefined,
      returnDate: isIsoDate(hints?.returnDate) ? hints.returnDate : undefined,
    });
  }
  return sanitizeSiteHref(fallbackHref);
}
