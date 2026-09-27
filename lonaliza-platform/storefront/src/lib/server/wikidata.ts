/**
 * Wikidata Structured Knowledge Graph Client
 * Fetches verified Q-entities, P625 coordinates, P18 images, and P856 official websites.
 */

export interface WikidataEntityDetail {
  id: string;
  label: string;
  description?: string;
  lat?: number;
  lng?: number;
  image?: string;
  officialWebsite?: string;
  wikipediaUrl?: string;
}

const memoryCache = new Map<string, { exp: number; data: WikidataEntityDetail | null }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 72; // 72 hours

export async function fetchWikidataPlace(query: string, lang = "en"): Promise<WikidataEntityDetail | null> {
  const clean = query.trim();
  if (!clean) return null;
  const cacheKey = `wd_${clean.toLowerCase()}_${lang}`;
  const hit = memoryCache.get(cacheKey);
  if (hit && hit.exp > Date.now()) return hit.data;

  try {
    // 1. Search entity Q-ID
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
      clean
    )}&language=${lang}&limit=1&format=json`;
    const searchRes = await fetch(searchUrl, { next: { revalidate: 86400 } });
    if (!searchRes.ok) return null;
    const searchJson = await searchRes.json();
    const firstHit = searchJson?.search?.[0];
    if (!firstHit?.id) {
      memoryCache.set(cacheKey, { exp: Date.now() + CACHE_TTL_MS, data: null });
      return null;
    }

    const qid = firstHit.id;

    // 2. Fetch Entity Claims
    const claimsUrl = `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`;
    const claimsRes = await fetch(claimsUrl, { next: { revalidate: 86400 * 3 } });
    if (!claimsRes.ok) return null;
    const claimsJson = await claimsRes.json();
    const entity = claimsJson?.entities?.[qid];
    if (!entity) return null;

    const claims = entity.claims || {};

    // P625: Coordinates
    let lat: number | undefined;
    let lng: number | undefined;
    const p625 = claims.P625?.[0]?.mainsnak?.datavalue?.value;
    if (p625 && typeof p625.latitude === "number" && typeof p625.longitude === "number") {
      lat = p625.latitude;
      lng = p625.longitude;
    }

    // Image handling reserved for Google Places Live Agent
    let image: string | undefined;

    // P856: Official website
    const officialWebsite = claims.P856?.[0]?.mainsnak?.datavalue?.value || undefined;

    // Wikipedia link
    const wikiSitelink = entity.sitelinks?.[`${lang}wiki`]?.title || entity.sitelinks?.enwiki?.title;
    const wikipediaUrl = wikiSitelink
      ? `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(wikiSitelink)}`
      : undefined;

    const label = entity.labels?.[lang]?.value || entity.labels?.en?.value || firstHit.label || clean;
    const description =
      entity.descriptions?.[lang]?.value || entity.descriptions?.en?.value || firstHit.description;

    const result: WikidataEntityDetail = {
      id: qid,
      label,
      description,
      lat,
      lng,
      image,
      officialWebsite,
      wikipediaUrl,
    };

    memoryCache.set(cacheKey, { exp: Date.now() + CACHE_TTL_MS, data: result });
    return result;
  } catch (err) {
    console.warn("[Wikidata] Fetch error:", err);
    return null;
  }
}
