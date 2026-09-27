import { createWriteStream, existsSync } from "fs";
import { promises as fs } from "fs";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

const execFileAsync = promisify(execFile);
const ROOT = path.join(process.cwd());
const ENV_FILE = path.join(ROOT, ".data", "server-env.json");
const CACHE_DIR = path.join(ROOT, ".data", "geonames");
const PB_URL = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";
const CITIES_ZIP = "https://download.geonames.org/export/dump/cities15000.zip";
const COUNTRY_INFO = "https://download.geonames.org/export/dump/countryInfo.txt";
const ADMIN1_INFO = "https://download.geonames.org/export/dump/admin1CodesASCII.txt";
const WORLD_POP_MIN = 50000;

const COUNTRY_I18N = {
  TR: ["Turkey", "تركيا", "Türkiye"],
  AE: ["United Arab Emirates", "الإمارات", "Birleşik Arap Emirlikleri"],
  SA: ["Saudi Arabia", "السعودية", "Suudi Arabistan"],
  QA: ["Qatar", "قطر", "Katar"],
  KW: ["Kuwait", "الكويت", "Kuveyt"],
  BH: ["Bahrain", "البحرين", "Bahreyn"],
  OM: ["Oman", "عُمان", "Umman"],
  EG: ["Egypt", "مصر", "Mısır"],
  JO: ["Jordan", "الأردن", "Ürdün"],
  IQ: ["Iraq", "العراق", "Irak"],
  LB: ["Lebanon", "لبنان", "Lübnan"],
  SY: ["Syria", "سوريا", "Suriye"],
  MA: ["Morocco", "المغرب", "Fas"],
  TN: ["Tunisia", "تونس", "Tunus"],
  DZ: ["Algeria", "الجزائر", "Cezayir"],
  FR: ["France", "فرنسا", "Fransa"],
  DE: ["Germany", "ألمانيا", "Almanya"],
  GB: ["United Kingdom", "بريطانيا", "Birleşik Krallık"],
  IT: ["Italy", "إيطاليا", "İtalya"],
  ES: ["Spain", "إسبانيا", "İspanya"],
  NL: ["Netherlands", "هولندا", "Hollanda"],
  AT: ["Austria", "النمسا", "Avusturya"],
  CH: ["Switzerland", "سويسرا", "İsviçre"],
  BE: ["Belgium", "بلجيكا", "Belçika"],
  PT: ["Portugal", "البرتغال", "Portekiz"],
  GR: ["Greece", "اليونان", "Yunanistan"],
  CZ: ["Czechia", "التشيك", "Çekya"],
  HU: ["Hungary", "المجر", "Macaristan"],
  PL: ["Poland", "بولندا", "Polonya"],
  SE: ["Sweden", "السويد", "İsveç"],
  NO: ["Norway", "النرويج", "Norveç"],
  DK: ["Denmark", "الدنمارك", "Danimarka"],
  FI: ["Finland", "فنلندا", "Finlandiya"],
  US: ["United States", "الولايات المتحدة", "Amerika Birleşik Devletleri"],
  CA: ["Canada", "كندا", "Kanada"],
  MX: ["Mexico", "المكسيك", "Meksika"],
  BR: ["Brazil", "البرازيل", "Brezilya"],
  AR: ["Argentina", "الأرجنتين", "Arjantin"],
  RU: ["Russia", "روسيا", "Rusya"],
  CN: ["China", "الصين", "Çin"],
  JP: ["Japan", "اليابان", "Japonya"],
  KR: ["South Korea", "كوريا الجنوبية", "Güney Kore"],
  TH: ["Thailand", "تايلاند", "Tayland"],
  VN: ["Vietnam", "فيتنام", "Vietnam"],
  MY: ["Malaysia", "ماليزيا", "Malezya"],
  SG: ["Singapore", "سنغافورة", "Singapur"],
  ID: ["Indonesia", "إندونيسيا", "Endonezya"],
  IN: ["India", "الهند", "Hindistan"],
  PK: ["Pakistan", "باكستان", "Pakistan"],
  BD: ["Bangladesh", "بنغلاديش", "Bangladeş"],
  IR: ["Iran", "إيران", "İran"],
  AZ: ["Azerbaijan", "أذربيجان", "Azerbaycan"],
  GE: ["Georgia", "جورجيا", "Gürcistan"],
  AM: ["Armenia", "أرمينيا", "Ermenistan"],
  KZ: ["Kazakhstan", "كازاخستان", "Kazakistan"],
  UZ: ["Uzbekistan", "أوزبكستان", "Özbekistan"],
  KG: ["Kyrgyzstan", "قرغيزستان", "Kırgızistan"],
  AU: ["Australia", "أستراليا", "Avustralya"],
  NZ: ["New Zealand", "نيوزيلندا", "Yeni Zelanda"],
  ZA: ["South Africa", "جنوب أفريقيا", "Güney Afrika"],
  NG: ["Nigeria", "نيجيريا", "Nijerya"],
  KE: ["Kenya", "كينيا", "Kenya"],
  UA: ["Ukraine", "أوكرانيا", "Ukrayna"],
  RO: ["Romania", "رومانيا", "Romanya"],
  BG: ["Bulgaria", "بلغاريا", "Bulgaristan"],
  RS: ["Serbia", "صربيا", "Sırbistan"],
  HR: ["Croatia", "كرواتيا", "Hırvatistan"],
  BA: ["Bosnia and Herzegovina", "البوسنة", "Bosna-Hersek"],
  AL: ["Albania", "ألبانيا", "Arnavutluk"],
  CY: ["Cyprus", "قبرص", "Kıbrıs"],
  MT: ["Malta", "مالطا", "Malta"],
  IE: ["Ireland", "أيرلندا", "İrlanda"],
  IL: ["Israel", "إسرائيل", "İsrail"],
  PS: ["Palestine", "فلسطين", "Filistin"],
  YE: ["Yemen", "اليمن", "Yemen"],
  SD: ["Sudan", "السودان", "Sudan"],
  LY: ["Libya", "ليبيا", "Libya"],
  ET: ["Ethiopia", "إثيوبيا", "Etiyopya"],
  PH: ["Philippines", "الفلبين", "Filipinler"],
  TW: ["Taiwan", "تايوان", "Tayvan"],
  HK: ["Hong Kong", "هونغ كونغ", "Hong Kong"],
  MO: ["Macao", "ماكاو", "Makao"],
};

const CITY_I18N = {
  "istanbul|tr": ["إسطنبول", "İstanbul"],
  "antalya|tr": ["أنطاليا", "Antalya"],
  "ankara|tr": ["أنقرة", "Ankara"],
  "izmir|tr": ["إزمير", "İzmir"],
  "bodrum|tr": ["بودروم", "Bodrum"],
  "trabzon|tr": ["طرابزون", "Trabzon"],
  "cappadocia|tr": ["كابادوكيا", "Kapadokya"],
  "göreme|tr": ["غوريمه", "Göreme"],
  "goreme|tr": ["غوريمه", "Göreme"],
  "alanya|tr": ["ألانيا", "Alanya"],
  "belek|tr": ["بيلك", "Belek"],
  "side|tr": ["سيدي", "Side"],
  "marmaris|tr": ["مرمريس", "Marmaris"],
  "fethiye|tr": ["فتحية", "Fethiye"],
  "kuşadası|tr": ["كوشاداسي", "Kuşadası"],
  "kusadasi|tr": ["كوشاداسي", "Kuşadası"],
  "bursa|tr": ["بورصة", "Bursa"],
  "gaziantep|tr": ["غازي عنتاب", "Gaziantep"],
  "mardin|tr": ["ماردين", "Mardin"],
  "van|tr": ["وان", "Van"],
  "sultanahmet|tr": ["السلطان أحمد", "Sultanahmet"],
  "taksim|tr": ["تقسيم", "Taksim"],
  "arnavutköy|tr": ["أرنافوت كوي", "Arnavutköy"],
  "arnavutkoy|tr": ["أرنافوت كوي", "Arnavutköy"],
  "konya|tr": ["قونية", "Konya"],
  "pamukkale|tr": ["باموكالي", "Pamukkale"],
  "çeşme|tr": ["تششمه", "Çeşme"],
  "cesme|tr": ["تششمه", "Çeşme"],
  "ölüdeniz|tr": ["أولودينيز", "Ölüdeniz"],
  "oludeniz|tr": ["أولودينيز", "Ölüdeniz"],
  "kaş|tr": ["كاش", "Kaş"],
  "kas|tr": ["كاش", "Kaş"],
  "sapanca|tr": ["سابانجا", "Sapanca"],
  "rize|tr": ["ريزه", "Rize"],
  "ayder|tr": ["آيدر", "Ayder"],
  "dubai|ae": ["دبي", "Dubai"],
  "paris|fr": ["باريس", "Paris"],
  "london|gb": ["لندن", "Londra"],
  "rome|it": ["روما", "Roma"],
  "barcelona|es": ["برشلونة", "Barselona"],
  "nha trang|vn": ["نها ترانغ", "Nha Trang"],
  "cairo|eg": ["القاهرة", "Kahire"],
  "mecca|sa": ["مكة", "Mekke"],
  "medina|sa": ["المدينة", "Medine"],
  "jeddah|sa": ["جدة", "Cidde"],
  "riyadh|sa": ["الرياض", "Riyad"],
  "doha|qa": ["الدوحة", "Doha"],
};

const TA_GEO = {
  "istanbul|tr": "293974",
  "antalya|tr": "297962",
  "ankara|tr": "298656",
  "izmir|tr": "298006",
  "bodrum|tr": "298666",
  "cappadocia|tr": "297982",
  "göreme|tr": "297982",
  "goreme|tr": "297982",
  "nevşehir|tr": "298030",
  "nevsehir|tr": "298030",
  "trabzon|tr": "298035",
  "alanya|tr": "298962",
  "belek|tr": "609082",
  "side|tr": "298964",
  "marmaris|tr": "298663",
  "fethiye|tr": "298658",
  "kuşadası|tr": "298031",
  "kusadasi|tr": "298031",
  "bursa|tr": "297977",
  "gaziantep|tr": "298007",
  "mardin|tr": "298032",
  "van|tr": "298038",
  "konya|tr": "298009",
  "denizli|tr": "298014",
  "pamukkale|tr": "298014",
  "çeşme|tr": "298655",
  "cesme|tr": "298655",
  "kaş|tr": "298659",
  "kas|tr": "298659",
  "rize|tr": "298034",
  "kayseri|tr": "298020",
  "adana|tr": "298004",
  "sultanahmet|tr": "293974",
  "taksim|tr": "293974",
  "arnavutköy|tr": "293974",
  "arnavutkoy|tr": "293974",
  "dubai|ae": "295424",
  "abu dhabi|ae": "298366",
  "paris|fr": "187147",
  "london|gb": "186338",
  "rome|it": "187791",
  "barcelona|es": "187497",
  "madrid|es": "187514",
  "amsterdam|nl": "188590",
  "berlin|de": "187323",
  "vienna|at": "190428",
  "prague|cz": "274707",
  "athens|gr": "189400",
  "cairo|eg": "294201",
  "sharm el sheikh|eg": "297549",
  "hurghada|eg": "297553",
  "bangkok|th": "293916",
  "phuket|th": "293920",
  "nha trang|vn": "293926",
  "ho chi minh city|vn": "293925",
  "hanoi|vn": "293924",
  "singapore|sg": "294265",
  "kuala lumpur|my": "298570",
  "new york city|us": "60763",
  "new york|us": "60763",
  "mecca|sa": "293993",
  "medina|sa": "293994",
  "jeddah|sa": "293986",
  "riyadh|sa": "293995",
  "doha|qa": "294008",
  "manama|bh": "298423",
  "muscat|om": "298414",
  "tbilisi|ge": "294195",
  "baku|az": "293936",
  "batumi|ge": "298562",
};

const CURATED = [
  ["sultanahmet", "Sultanahmet", "TR", "Istanbul", 41.0054, 28.9768, 15000],
  ["taksim", "Taksim", "TR", "Istanbul", 41.037, 28.985, 20000],
  ["arnavutkoy", "Arnavutköy", "TR", "Istanbul", 41.183, 28.74, 30000],
  ["cappadocia", "Cappadocia", "TR", "Nevşehir", 38.6431, 34.8283, 35000],
  ["goreme", "Göreme", "TR", "Nevşehir", 38.6431, 34.8283, 2000],
  ["belek", "Belek", "TR", "Antalya", 36.8628, 31.0556, 8000],
  ["side", "Side", "TR", "Antalya", 36.7667, 31.3889, 12000],
  ["oludeniz", "Ölüdeniz", "TR", "Muğla", 36.546, 29.124, 3000],
  ["pamukkale", "Pamukkale", "TR", "Denizli", 37.9137, 29.1187, 2500],
  ["sapanca", "Sapanca", "TR", "Sakarya", 40.6914, 30.2675, 40000],
  ["ayder", "Ayder", "TR", "Rize", 40.954, 41.135, 1500],
  ["cesme", "Çeşme", "TR", "İzmir", 38.3228, 26.3064, 40000],
  ["alacati", "Alaçatı", "TR", "İzmir", 38.282, 26.375, 8000],
  ["didim", "Didim", "TR", "Aydın", 37.3756, 27.2678, 40000],
  ["kemer", "Kemer", "TR", "Antalya", 36.5978, 30.5606, 45000],
  ["lara", "Lara", "TR", "Antalya", 36.855, 30.79, 20000],
  ["urgup", "Ürgüp", "TR", "Nevşehir", 38.6296, 34.912, 20000],
  ["avanos", "Avanos", "TR", "Nevşehir", 38.715, 34.8467, 13000],
  ["kas", "Kaş", "TR", "Antalya", 36.2018, 29.6377, 8000],
  ["kusadasi", "Kuşadası", "TR", "Aydın", 37.8579, 27.261, 113000],
];

function slug(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function placeKey(country, city, admin1 = "") {
  return `${String(country || "").toUpperCase()}:${slug(city)}:${slug(admin1)}`;
}

function lookupKey(city, country) {
  return `${slug(city).replace(/-/g, " ")}|${String(country || "").toLowerCase()}`;
}

function countryNames(code, fallbackEn = "") {
  const row = COUNTRY_I18N[code];
  if (row) return { en: row[0], ar: row[1], tr: row[2] };
  return { en: fallbackEn || code, ar: fallbackEn || code, tr: fallbackEn || code };
}

function cityNames(cityEn, country, alternates = "") {
  const hit = CITY_I18N[lookupKey(cityEn, country)];
  let ar = hit?.[0] || "";
  let tr = hit?.[1] || "";
  for (const name of String(alternates || "").split(",")) {
    const n = name.trim();
    if (!n) continue;
    if (!ar && /[\u0600-\u06FF]/.test(n)) ar = n;
    if (!tr && /[çğıöşüÇĞİÖŞÜ]/.test(n)) tr = n;
  }
  return {
    en: cityEn,
    ar: ar || cityEn,
    tr: tr || cityEn,
  };
}

function searchTokens(parts) {
  const set = new Set();
  for (const part of parts) {
    for (const raw of String(part || "").split(/[,\n]/)) {
      const token = raw.trim();
      if (!token || token.length > 80) continue;
      set.add(token.toLowerCase());
      const slugged = slug(token);
      if (slugged) {
        set.add(slugged.replace(/-/g, " "));
        set.add(slugged.replace(/-/g, ""));
      }
    }
  }
  let out = "";
  for (const token of set) {
    const next = out ? `${out} ${token}` : token;
    if (next.length > 1800) break;
    out = next;
  }
  return out;
}

function buildRecord(row) {
  const cc = String(row.country_code || "").toUpperCase();
  const names = cityNames(row.city_name_en, cc, row.alternates);
  const country = countryNames(cc, row.country_name_en);
  const admin1 = row.admin1 || "";
  return {
    place_key: placeKey(cc, row.city_name_en, admin1),
    country_code: cc,
    country_name_en: country.en,
    country_name_ar: country.ar,
    country_name_tr: country.tr,
    city_name_en: names.en,
    city_name_ar: names.ar,
    city_name_tr: names.tr,
    admin1,
    lat: Number(row.lat) || 0,
    lng: Number(row.lng) || 0,
    population: Math.max(0, Math.round(Number(row.population) || 0)),
    tripadvisor_geo_id: row.tripadvisor_geo_id || TA_GEO[lookupKey(row.city_name_en, cc)] || "",
    search_tokens: searchTokens([
      names.en,
      names.ar,
      names.tr,
      country.en,
      country.ar,
      country.tr,
      cc,
      admin1,
      row.alternates,
      row.ascii,
    ]),
  };
}

async function readEnvStore() {
  try {
    const raw = await fs.readFile(ENV_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return parsed.values && typeof parsed.values === "object" ? parsed.values : {};
  } catch {
    return {};
  }
}

async function adminToken(email, password) {
  const res = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identity: email, password }),
  });
  if (!res.ok) throw new Error(`PocketBase admin auth failed: ${await res.text()}`);
  const data = await res.json();
  return data.token;
}

async function listCollections(token) {
  const res = await fetch(`${PB_URL}/api/collections`, {
    headers: { Authorization: token },
  });
  const data = await res.json();
  return data.items || [];
}

async function ensureCollection(token) {
  const existing = (await listCollections(token)).find((c) => c.name === "geo_places");
  const fields = [
    { name: "id", type: "text", required: true, primaryKey: true, autogeneratePattern: "[a-z0-9]{15}" },
    { name: "created", type: "autodate", onCreate: true, onUpdate: false },
    { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
    { name: "place_key", type: "text", required: true },
    { name: "country_code", type: "text", required: true },
    { name: "country_name_en", type: "text" },
    { name: "country_name_ar", type: "text" },
    { name: "country_name_tr", type: "text" },
    { name: "city_name_en", type: "text", required: true },
    { name: "city_name_ar", type: "text" },
    { name: "city_name_tr", type: "text" },
    { name: "admin1", type: "text" },
    { name: "lat", type: "number" },
    { name: "lng", type: "number" },
    { name: "population", type: "number" },
    { name: "tripadvisor_geo_id", type: "text" },
    { name: "search_tokens", type: "text" },
  ];
  const payload = {
    name: "geo_places",
    type: "base",
    listRule: null,
    viewRule: null,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    indexes: [
      "CREATE UNIQUE INDEX `idx_geo_places_key` ON `geo_places` (`place_key`)",
      "CREATE INDEX `idx_geo_places_tokens` ON `geo_places` (`search_tokens`)",
      "CREATE INDEX `idx_geo_places_country` ON `geo_places` (`country_code`)",
    ],
    fields,
  };
  if (existing) {
    const have = new Set((existing.fields || []).map((f) => f.name));
    const missing = fields.filter((f) => !have.has(f.name));
    if (!missing.length) return existing;
    const res = await fetch(`${PB_URL}/api/collections/${existing.id}`, {
      method: "PATCH",
      headers: { Authorization: token, "Content-Type": "application/json" },
      body: JSON.stringify({ fields: [...(existing.fields || []), ...missing] }),
    });
    if (!res.ok) throw new Error(`patch geo_places: ${await res.text()}`);
    return existing;
  }
  const res = await fetch(`${PB_URL}/api/collections`, {
    method: "POST",
    headers: { Authorization: token, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`create geo_places: ${await res.text()}`);
  return res.json();
}

async function downloadOnce(url, dest) {
  if (existsSync(dest)) {
    console.log(`cached ${path.basename(dest)}`);
    return dest;
  }
  await fs.mkdir(path.dirname(dest), { recursive: true });
  console.log(`downloading ${url}`);
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(`download failed ${url}: ${res.status}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
  return dest;
}

async function extractZip(zipPath, destDir) {
  await fs.mkdir(destDir, { recursive: true });
  try {
    await execFileAsync("unzip", ["-o", zipPath, "-d", destDir]);
    return;
  } catch {
    /* try python */
  }
  await execFileAsync("python3", [
    "-c",
    "import zipfile,sys; zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])",
    zipPath,
    destDir,
  ]);
}

function parseCountryInfo(text) {
  const map = new Map();
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const cols = line.split("\t");
    const code = cols[0];
    const name = cols[4];
    if (code && name) map.set(code, name);
  }
  return map;
}

function parseAdmin1(text) {
  const map = new Map();
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const [code, name] = line.split("\t");
    if (code && name) map.set(code, name);
  }
  return map;
}

function shouldKeep(country, pop, feature) {
  if (country === "TR") return true;
  if (feature === "PPLC") return true;
  return pop >= WORLD_POP_MIN;
}

function parseCities(text, countries, admin1) {
  const byKey = new Map();
  for (const line of text.split(/\r?\n/)) {
    if (!line) continue;
    const c = line.split("\t");
    const name = c[1];
    const ascii = c[2];
    const alternates = c[3];
    const lat = c[4];
    const lng = c[5];
    const feature = c[7];
    const country = c[8];
    const adminCode = c[10];
    const pop = Number(c[14]) || 0;
    if (!name || !country) continue;
    if (!shouldKeep(country, pop, feature)) continue;
    const adminName = admin1.get(`${country}.${adminCode}`) || "";
    const rec = buildRecord({
      city_name_en: name,
      country_code: country,
      country_name_en: countries.get(country) || country,
      admin1: adminName,
      lat,
      lng,
      population: pop,
      alternates,
      ascii,
    });
    const prev = byKey.get(rec.place_key);
    if (!prev || rec.population > prev.population) byKey.set(rec.place_key, rec);
  }
  return byKey;
}

function addCurated(byKey, countries) {
  for (const [key, en, cc, admin1, lat, lng, pop] of CURATED) {
    const rec = buildRecord({
      city_name_en: en,
      country_code: cc,
      country_name_en: countries.get(cc) || COUNTRY_I18N[cc]?.[0] || cc,
      admin1,
      lat,
      lng,
      population: pop,
      ascii: key,
    });
    const prev = byKey.get(rec.place_key);
    if (!prev) {
      byKey.set(rec.place_key, rec);
      continue;
    }
    if (!prev.tripadvisor_geo_id && rec.tripadvisor_geo_id) {
      prev.tripadvisor_geo_id = rec.tripadvisor_geo_id;
    }
    if (rec.city_name_ar && rec.city_name_ar !== rec.city_name_en) {
      prev.city_name_ar = rec.city_name_ar;
    }
    if (rec.city_name_tr && rec.city_name_tr !== rec.city_name_en) {
      prev.city_name_tr = rec.city_name_tr;
    }
    prev.search_tokens = searchTokens([prev.search_tokens, rec.search_tokens]);
  }
}

async function loadExistingKeys(token) {
  const map = new Map();
  let page = 1;
  while (true) {
    const res = await fetch(
      `${PB_URL}/api/collections/geo_places/records?page=${page}&perPage=200&fields=id,place_key,tripadvisor_geo_id`,
      { headers: { Authorization: token } }
    );
    if (!res.ok) break;
    const data = await res.json();
    for (const item of data.items || []) {
      map.set(item.place_key, item);
    }
    if (!data.items?.length || page >= (data.totalPages || 1)) break;
    page += 1;
  }
  return map;
}

async function upsertBatch(token, records, existing) {
  let created = 0;
  let updated = 0;
  for (const rec of records) {
    const found = existing.get(rec.place_key);
    if (found) {
      const next = { ...rec };
      if (found.tripadvisor_geo_id && !next.tripadvisor_geo_id) {
        next.tripadvisor_geo_id = found.tripadvisor_geo_id;
      }
      const res = await fetch(`${PB_URL}/api/collections/geo_places/records/${found.id}`, {
        method: "PATCH",
        headers: { Authorization: token, "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) throw new Error(`update ${rec.place_key}: ${await res.text()}`);
      updated += 1;
    } else {
      const res = await fetch(`${PB_URL}/api/collections/geo_places/records`, {
        method: "POST",
        headers: { Authorization: token, "Content-Type": "application/json" },
        body: JSON.stringify(rec),
      });
      if (!res.ok) throw new Error(`create ${rec.place_key}: ${await res.text()}`);
      created += 1;
    }
  }
  return { created, updated };
}

async function main() {
  const store = await readEnvStore();
  const email = process.env.POCKETBASE_ADMIN_EMAIL || store.POCKETBASE_ADMIN_EMAIL;
  const password = process.env.POCKETBASE_ADMIN_PASSWORD || store.POCKETBASE_ADMIN_PASSWORD;
  if (!email || !password) throw new Error("PocketBase admin credentials missing");

  const token = await adminToken(email, password);
  await ensureCollection(token);

  await fs.mkdir(CACHE_DIR, { recursive: true });
  const zipPath = path.join(CACHE_DIR, "cities15000.zip");
  const countryPath = path.join(CACHE_DIR, "countryInfo.txt");
  const adminPath = path.join(CACHE_DIR, "admin1CodesASCII.txt");
  await downloadOnce(CITIES_ZIP, zipPath);
  await downloadOnce(COUNTRY_INFO, countryPath);
  await downloadOnce(ADMIN1_INFO, adminPath);
  await extractZip(zipPath, CACHE_DIR);

  const citiesPath = path.join(CACHE_DIR, "cities15000.txt");
  if (!existsSync(citiesPath)) throw new Error("cities15000.txt missing after extract");

  const [citiesText, countryText, adminText] = await Promise.all([
    fs.readFile(citiesPath, "utf8"),
    fs.readFile(countryPath, "utf8"),
    fs.readFile(adminPath, "utf8"),
  ]);
  const countries = parseCountryInfo(countryText);
  const admin1 = parseAdmin1(adminText);
  const byKey = parseCities(citiesText, countries, admin1);
  addCurated(byKey, countries);
  const records = [...byKey.values()];
  const existing = await loadExistingKeys(token);
  console.log(`importing ${records.length} geo_places (existing ${existing.size})`);

  let created = 0;
  let updated = 0;
  const chunk = 40;
  for (let i = 0; i < records.length; i += chunk) {
    const part = records.slice(i, i + chunk);
    const result = await upsertBatch(token, part, existing);
    created += result.created;
    updated += result.updated;
    if (i % 400 === 0 || i + chunk >= records.length) {
      console.log(`progress ${Math.min(i + chunk, records.length)}/${records.length}`);
    }
  }
  console.log(`geo_places ready created=${created} updated=${updated} total=${records.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
