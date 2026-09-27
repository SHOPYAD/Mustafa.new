import type { PlannerStopKind } from "@/types/planner";
import { haversineKm, validLatLng } from "./geo";
import { nominatimSearch } from "./nominatim";
import {
  cachedCityPois,
  cityPackQuality,
  readCityPack,
  warehouseCityKey,
  withCityHarvest,
  writeCityPack,
  type WarehousePoi,
} from "./poi-warehouse";
import { isJunkPlaceTitle, isTouristPoi, rankTouristPoi } from "./tourist-filter";
import { isGenericStockPhoto } from "./place-photos";

const UA = "LonalizaPlanner/1.0 (https://lonaliza.com; travel planner)";

export type WorldPoi = WarehousePoi;

function kindFromText(raw: string): PlannerStopKind {
  const t = raw.toLowerCase();
  if (/\b(hotel|otel|إقامة)\b/.test(t)) return "hotel";
  if (/\b(restaurant|cafe|مطعم|مقهى)\b/.test(t)) return "food";
  if (/\b(shop|bazaar|mall|سوق|تسوق)\b/.test(t)) return "shopping";
  if (/\b(airport|مطار)\b/.test(t)) return "airport";
  return "attraction";
}

function secureImage(url?: string): string | undefined {
  if (!url) return undefined;
  return url.replace(/^http:\/\//i, "https://");
}

function commonsThumb(url: string): string {
  if (!url) return "";
  const https = url.replace(/^http:\/\//i, "https://");
  return https.startsWith("http") ? https : "";
}

export function poisNearCenter(pois: WorldPoi[], lat?: number, lng?: number, maxKm = 95): WorldPoi[] {
  const valid = pois.filter((p) => validLatLng(p.lat, p.lng));
  if (!validLatLng(lat, lng)) return valid;
  return valid.filter((p) => haversineKm({ lat: p.lat, lng: p.lng }, { lat: lat as number, lng: lng as number }) <= maxKm);
}

function cleanCity(city: string): string {
  return String(city || "")
    .replace(/,.+$/, "")
    .replace(/\b(turkey|turkiye|france|egypt|saudi arabia)\b/gi, "")
    .trim();
}

async function wikidataPois(lat: number, lng: number): Promise<WorldPoi[]> {
  const query = `
SELECT DISTINCT ?item ?itemLabel ?labelAr ?coord ?image ?links WHERE {
  SERVICE wikibase:around {
    ?item wdt:P625 ?coord.
    bd:serviceParam wikibase:center "Point(${lng} ${lat})"^^geo:wktLiteral.
    bd:serviceParam wikibase:radius "110".
  }
  {
    ?item wdt:P31/wdt:P279* wd:Q570116.
  } UNION { ?item wdt:P31/wdt:P279* wd:Q33506. }
  UNION { ?item wdt:P31/wdt:P279* wd:Q839954. }
  UNION { ?item wdt:P31/wdt:P279* wd:Q23413. }
  UNION { ?item wdt:P31/wdt:P279* wd:Q4989906. }
  UNION { ?item wdt:P31/wdt:P279* wd:Q23397. }
  UNION { ?item wdt:P31/wdt:P279* wd:Q34038. }
  UNION { ?item wdt:P31/wdt:P279* wd:Q39816. }
  UNION { ?item wdt:P31/wdt:P279* wd:Q35509. }
  UNION { ?item wdt:P31/wdt:P279* wd:Q46169. }
  UNION { ?item wdt:P31/wdt:P279* wd:Q16560. }
  UNION { ?item wdt:P31/wdt:P279* wd:Q9259. }
  OPTIONAL { ?item wdt:P18 ?image. }
  OPTIONAL { ?item wikibase:sitelinks ?links. }
  OPTIONAL { ?item rdfs:label ?labelAr FILTER (LANG(?labelAr) = "ar"). }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,ar". }
}
LIMIT 200`.trim();
  try {
    const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/sparql-results+json" },
      next: { revalidate: 3600 },
    });
    const json = (await res.json()) as {
      results?: {
        bindings?: Array<{
          itemLabel?: { value?: string };
          labelAr?: { value?: string };
          coord?: { value?: string };
          image?: { value?: string };
          links?: { value?: string };
        }>;
      };
    };
    const out: WorldPoi[] = [];
    for (const row of json.results?.bindings || []) {
      const titleEn = row.itemLabel?.value || "";
      if (!titleEn || /^Q\d+$/.test(titleEn)) continue;
      const point = String(row.coord?.value || "").match(/Point\(([-\d.]+)\s+([-\d.]+)\)/);
      if (!point) continue;
      out.push({
        titleEn,
        titleAr: row.labelAr?.value || titleEn,
        lat: Number(point[2]),
        lng: Number(point[1]),
        kind: "attraction",
        image: row.image?.value ? secureImage(commonsThumb(row.image.value)) : undefined,
        popularity: Number(row.links?.value) || 0,
        source: "wikidata",
      });
    }
    return out;
  } catch {
    return [];
  }
}

async function wikidataPoisByCity(city: string): Promise<WorldPoi[]> {
  const name = cleanCity(city);
  if (!name || name.length < 3) return [];
  const query = `
SELECT DISTINCT ?item ?itemLabel ?labelAr ?coord ?image ?links WHERE {
  ?place rdfs:label "${name.replace(/"/g, "")}"@en.
  ?item wdt:P131* ?place.
  ?item wdt:P625 ?coord.
  { ?item wdt:P31/wdt:P279* wd:Q570116. }
  UNION { ?item wdt:P31/wdt:P279* wd:Q33506. }
  UNION { ?item wdt:P31/wdt:P279* wd:Q839954. }
  UNION { ?item wdt:P31/wdt:P279* wd:Q39816. }
  UNION { ?item wdt:P31/wdt:P279* wd:Q35509. }
  OPTIONAL { ?item wdt:P18 ?image. }
  OPTIONAL { ?item wikibase:sitelinks ?links. }
  OPTIONAL { ?item rdfs:label ?labelAr FILTER (LANG(?labelAr) = "ar"). }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,ar". }
}
LIMIT 80`.trim();
  try {
    const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/sparql-results+json" },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(18000),
    });
    const json = (await res.json()) as {
      results?: {
        bindings?: Array<{
          itemLabel?: { value?: string };
          labelAr?: { value?: string };
          coord?: { value?: string };
          image?: { value?: string };
          links?: { value?: string };
        }>;
      };
    };
    const out: WorldPoi[] = [];
    for (const row of json.results?.bindings || []) {
      const titleEn = row.itemLabel?.value || "";
      if (!titleEn || /^Q\d+$/.test(titleEn) || isJunkPlaceTitle(titleEn)) continue;
      const point = String(row.coord?.value || "").match(/Point\(([-\d.]+)\s+([-\d.]+)\)/);
      if (!point) continue;
      out.push({
        titleEn,
        titleAr: row.labelAr?.value || titleEn,
        lat: Number(point[2]),
        lng: Number(point[1]),
        kind: "attraction",
        image: row.image?.value ? secureImage(commonsThumb(row.image.value)) : undefined,
        popularity: Number(row.links?.value) || 8,
        source: "wikidata",
      });
    }
    return out;
  } catch {
    return [];
  }
}

async function wikipediaPois(lat: number, lng: number, lang: "ar" | "en"): Promise<WorldPoi[]> {
  try {
    const geoUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}|${lng}&gsradius=12000&gslimit=24&format=json&origin=*`;
    const geoRes = await fetch(geoUrl, { headers: { "User-Agent": UA }, next: { revalidate: 3600 } });
    const geo = (await geoRes.json()) as {
      query?: { geosearch?: Array<{ pageid: number; title: string; lat: number; lon: number }> };
    };
    const pages = geo.query?.geosearch || [];
    if (!pages.length) return [];
    const ids = pages.map((p) => p.pageid).join("|");
    const detUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&pageids=${ids}&prop=pageimages|extracts|pageterms&piprop=thumbnail&pithumbsize=800&exintro=1&explaintext=1&exsentences=2&format=json&origin=*`;
    const detRes = await fetch(detUrl, { headers: { "User-Agent": UA }, next: { revalidate: 3600 } });
    const det = (await detRes.json()) as {
      query?: {
        pages?: Record<
          string,
          { title?: string; extract?: string; thumbnail?: { source?: string }; terms?: { description?: string[] } }
        >;
      };
    };
    return pages
      .filter((p) => !isJunkPlaceTitle(p.title))
      .map((p) => {
      const page = det.query?.pages?.[String(p.pageid)];
      const extract = page?.extract || page?.terms?.description?.[0] || "";
      const title = page?.title || p.title;
      return {
        titleEn: title,
        titleAr: title,
        detailEn: lang === "en" ? extract : undefined,
        detailAr: lang === "ar" ? extract : undefined,
        lat: p.lat,
        lng: p.lon,
        kind: kindFromText(`${title} ${extract}`),
        image: secureImage(page?.thumbnail?.source),
        source: "wikipedia" as const,
      };
    });
  } catch {
    return [];
  }
}

async function wikipediaSearchPois(city: string): Promise<WorldPoi[]> {
  const name = cleanCity(city);
  if (!name) return [];
  const queries = [`${name} tourist attractions`, `${name} landmarks`, `${name} museum`];
  const titles: string[] = [];
  const seen = new Set<string>();
  for (const q of queries) {
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&srlimit=20&format=json&origin=*`;
      const res = await fetch(url, { headers: { "User-Agent": UA }, next: { revalidate: 86400 } });
      const json = (await res.json()) as { query?: { search?: Array<{ title?: string }> } };
      for (const row of json.query?.search || []) {
        const t = row.title || "";
        if (!t || seen.has(t) || /^list of|^category:/i.test(t) || new RegExp(`^${name}$`, "i").test(t)) continue;
        seen.add(t);
        titles.push(t);
      }
    } catch {
      /* next query */
    }
    if (titles.length >= 50) break;
  }
  return wikipediaPagesByTitle(titles.slice(0, 50), 12);
}

async function wikipediaPagesByTitle(titles: string[], popularity = 16): Promise<WorldPoi[]> {
  if (!titles.length) return [];
  const out: WorldPoi[] = [];
  for (let i = 0; i < titles.length; i += 12) {
    const chunk = titles.slice(i, i + 12);
    try {
      const detUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${chunk.map(encodeURIComponent).join("|")}&prop=coordinates|pageimages|extracts&piprop=thumbnail&pithumbsize=800&exintro=1&explaintext=1&exsentences=2&colimit=50&redirects=1&format=json&origin=*`;
      const res = await fetch(detUrl, { headers: { "User-Agent": UA }, next: { revalidate: 86400 } });
      const json = (await res.json()) as {
        query?: {
          pages?: Record<
            string,
            {
              title?: string;
              extract?: string;
              thumbnail?: { source?: string };
              coordinates?: Array<{ lat: number; lon: number }>;
            }
          >;
        };
      };
      for (const page of Object.values(json.query?.pages || {})) {
        const coord = page.coordinates?.[0];
        const title = page.title || "";
        if (!title || !coord || isJunkPlaceTitle(title)) continue;
        out.push({
          titleEn: title,
          titleAr: title,
          detailEn: page.extract,
          lat: coord.lat,
          lng: coord.lon,
          kind: kindFromText(`${title} ${page.extract || ""}`),
          image: secureImage(page.thumbnail?.source),
          popularity,
          source: "wikipedia",
        });
      }
    } catch {
      /* next chunk */
    }
  }
  return out;
}

async function wikipediaCategoryPois(city: string): Promise<WorldPoi[]> {
  const name = cleanCity(city);
  if (!name) return [];
  const cats = [
    `Category:Tourist attractions in ${name}`,
    `Category:Museums in ${name}`,
    `Category:Visitor attractions in ${name}`,
    `Category:Landmarks in ${name}`,
    ...(/(cappadocia|goreme|göreme|nevsehir)/i.test(name)
      ? [
          "Category:Tourist attractions in Cappadocia",
          "Category:Landforms of Cappadocia",
          "Category:Tourist attractions in Nevşehir Province",
        ]
      : []),
    ...(/(trabzon|rize|uzungol|ayder)/i.test(name)
      ? [
          "Category:Tourist attractions in Trabzon",
          "Category:Tourist attractions in Trabzon Province",
          "Category:Buildings and structures in Trabzon",
          "Category:Tourist attractions in Rize Province",
          "Category:Geography of Rize Province",
        ]
      : []),
  ];
  const titles: string[] = [];
  const seen = new Set<string>();
  for (const cat of cats) {
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${encodeURIComponent(cat)}&cmtype=page&cmlimit=50&format=json&origin=*`;
      const res = await fetch(url, { headers: { "User-Agent": UA }, next: { revalidate: 86400 } });
      const json = (await res.json()) as {
        query?: { categorymembers?: Array<{ title?: string }> };
      };
      for (const row of json.query?.categorymembers || []) {
        const title = row.title || "";
        if (!title || seen.has(title) || /list of|^category:/i.test(title)) continue;
        seen.add(title);
        titles.push(title);
      }
      if (titles.length >= 80) break;
    } catch {
      /* next category */
    }
  }
  if (!titles.length) return [];
  return wikipediaPagesByTitle(titles.slice(0, 80), 18);
}

async function nominatimCityPois(city: string): Promise<WorldPoi[]> {
  const queries = [`${city} museum`, `${city} old town`, `معالم سياحية ${city}`];
  const out: WorldPoi[] = [];
  const seen = new Set<string>();
  for (const q of queries) {
    const rows = await nominatimSearch(q, 8);
    for (const r of rows) {
      const title = (r.label || "").split(",")[0] || r.label;
      const key = title.toLowerCase();
      if (!title || seen.has(key)) continue;
      seen.add(key);
      out.push({
        titleEn: title,
        titleAr: title,
        lat: r.lat,
        lng: r.lng,
        kind: kindFromText(title),
        source: "osm",
      });
    }
    if (out.length >= 12) break;
  }
  return out;
}

async function wikiThumb(title: string): Promise<{ image?: string; extract?: string }> {
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages|extracts&piprop=thumbnail&pithumbsize=800&exintro=1&explaintext=1&exsentences=2&redirects=1&format=json&origin=*`;
    const res = await fetch(url, { headers: { "User-Agent": UA }, next: { revalidate: 86400 } });
    const json = (await res.json()) as {
      query?: { pages?: Record<string, { thumbnail?: { source?: string }; extract?: string; missing?: string }> };
    };
    const page = Object.values(json.query?.pages || {})[0];
    if (!page || page.missing) return {};
    return { image: secureImage(page.thumbnail?.source), extract: page.extract };
  } catch {
    return {};
  }
}

function placeKey(title: string): string {
  return String(title || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .slice(0, 48);
}

export function mergePois(lists: WorldPoi[][]): WorldPoi[] {
  const seen = new Set<string>();
  const out: WorldPoi[] = [];
  for (const p of lists.flat().sort((a, b) => rankTouristPoi(b) - rankTouristPoi(a))) {
    if (!isTouristPoi(p)) continue;
    const key = placeKey(p.titleEn);
    if (seen.has(key)) continue;
    if (!validLatLng(p.lat, p.lng)) continue;
    if (/wikipedia|wikimedia|disambiguation/i.test(p.titleEn)) continue;
    const prev = out.find((x) => Math.abs(x.lat - p.lat) < 0.0008 && Math.abs(x.lng - p.lng) < 0.0008);
    if (prev) {
      if (!prev.image && p.image) prev.image = p.image;
      if (!prev.detailEn && p.detailEn) prev.detailEn = p.detailEn;
      if (!prev.detailAr && p.detailAr) prev.detailAr = p.detailAr;
      if ((p.popularity || 0) > (prev.popularity || 0)) prev.popularity = p.popularity;
      continue;
    }
    seen.add(key);
    out.push(p);
  }
  return out;
}

async function harvestWorldPois(input: { city: string; lat?: number; lng?: number }): Promise<WorldPoi[]> {
  const city = String(input.city || "").trim();
  const lat = Number(input.lat) || 0;
  const lng = Number(input.lng) || 0;
  const hasCenter = Boolean(lat && lng);
  const name = cleanCity(city) || city;
  const alt = /goreme|göreme|nevsehir|nevşehir/i.test(name)
    ? "Cappadocia"
    : /trabzon|rize|uzungol|ayder/i.test(name)
      ? "Trabzon"
      : name;

  const jobs: Array<Promise<WorldPoi[]>> = [
    wikipediaCategoryPois(name),
    wikipediaSearchPois(name),
    wikidataPoisByCity(name),
  ];
  if (alt !== name) {
    jobs.push(wikipediaCategoryPois(alt));
    jobs.push(wikipediaSearchPois(alt));
    jobs.push(wikidataPoisByCity(alt));
  }
  if (hasCenter) {
    jobs.push(wikidataPois(lat, lng));
  }
  if (/trabzon|rize|uzungol|ayder/i.test(name)) {
    jobs.push(wikipediaSearchPois("Uzungol"));
    jobs.push(wikipediaSearchPois("Ayder"));
    jobs.push(wikipediaCategoryPois("Rize"));
    jobs.push(wikidataPoisByCity("Rize"));
  }

  const lists = await Promise.all(jobs.map((j) => j.catch(() => [] as WorldPoi[])));
  let merged = poisNearCenter(mergePois(lists), lat, lng, 150);
  const quality = cityPackQuality(merged);
  if ((merged.length < 8 || quality.images < 4) && city) {
    const osm = await nominatimCityPois(city).catch(() => [] as WorldPoi[]);
    merged = poisNearCenter(mergePois([merged, osm.filter((p) => !isJunkPlaceTitle(p.titleEn))]), lat, lng, 110);
  }

  const missing = merged.filter((p) => !p.image || !p.detailEn).slice(0, 80);
  for (let i = 0; i < missing.length; i += 10) {
    await Promise.all(
      missing.slice(i, i + 10).map(async (p) => {
        const extra = await wikiThumb(p.titleEn);
        if (extra.image && (!p.image || isGenericStockPhoto(p.image))) p.image = extra.image;
        if (extra.extract && !p.detailEn) p.detailEn = extra.extract;
      })
    );
  }

  return merged.slice(0, 250);
}

export async function fetchWorldPois(input: { city: string; lat?: number; lng?: number }): Promise<WorldPoi[]> {
  const city = String(input.city || "").trim();
  const lat = Number(input.lat) || 0;
  const lng = Number(input.lng) || 0;
  const key = warehouseCityKey(city, lat, lng);
  const pack = key ? await readCityPack(key) : null;
  const isCurated = pack?.sources?.some((s) => s === "curated" || s === "lonaliza-vip");
  const cached = poisNearCenter(cachedCityPois(pack) || [], lat, lng, 150).filter(isTouristPoi);
  if (isCurated && cached.length >= 8) {
    return cached.slice(0, 250);
  }
  if (cached.filter((p) => p.image).length >= 10 && cached.length >= 12) {
    return cached.slice(0, 250);
  }

  if (!key) return harvestWorldPois(input);

  return withCityHarvest(key, async () => {
    const harvested = await harvestWorldPois(input);
    const merged = poisNearCenter(mergePois([harvested]), lat, lng, 150).filter(isTouristPoi);
    if (merged.length >= 6 && !isCurated) {
      await writeCityPack({
        cityKey: key,
        city: city || key,
        lat,
        lng,
        fetchedAt: new Date().toISOString(),
        sources: ["wikidata", "wikipedia"],
        pois: merged,
      });
    }
    return merged.slice(0, 250);
  });
}
