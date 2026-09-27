/**
 * Wikivoyage Travel Guide Ingestion Client
 * Extracts authentic See, Do, Eat, Drink, and Understand sections from Wikivoyage.
 */

export interface WikivoyageGuide {
  title: string;
  see: string[];
  eat: string[];
  drink: string[];
  do: string[];
  tips: string[];
  rawEat?: string;
  rawDrink?: string;
}

const memoryCache = new Map<string, { exp: number; data: WikivoyageGuide }>();
const CACHE_TTL_MS = 1000 * 60 * 60 * 48; // 48h

function cleanWikitext(text: string): string {
  return text
    .replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, "$1") // [[Target|Label]] -> Label
    .replace(/\{\{[^}]+\}\}/g, "") // remove templates
    .replace(/'''?/g, "") // bold/italic
    .replace(/==+[^=]+==+/g, "") // headings
    .replace(/https?:\/\/\S+/g, "") // links
    .replace(/\s+/g, " ")
    .trim();
}

function extractKeyItems(sectionWikitext: string): string[] {
  const items: string[] = [];
  // Match bolded names or bullet points
  const lines = sectionWikitext.split("\n");
  for (const line of lines) {
    const boldMatch = line.match(/'''([^']{3,40})'''/);
    if (boldMatch) {
      const clean = cleanWikitext(line);
      if (clean.length > 15 && clean.length < 280) {
        items.push(clean);
      }
    } else if (line.startsWith("*")) {
      const clean = cleanWikitext(line);
      if (clean.length > 20 && clean.length < 280) {
        items.push(clean);
      }
    }
    if (items.length >= 8) break;
  }
  return items;
}

export async function fetchWikivoyageGuide(destination: string): Promise<WikivoyageGuide | null> {
  const clean = destination.trim().replace(/\s*\(.*\)/, "");
  if (!clean) return null;
  const cacheKey = `wv_${clean.toLowerCase()}`;
  const hit = memoryCache.get(cacheKey);
  if (hit && hit.exp > Date.now()) return hit.data;

  try {
    // 1. Get sections list
    const secUrl = `https://en.wikivoyage.org/w/api.php?action=parse&page=${encodeURIComponent(
      clean
    )}&prop=sections&format=json`;
    const secRes = await fetch(secUrl, { next: { revalidate: 86400 } });
    if (!secRes.ok) return null;
    const secJson = await secRes.json();
    const sections: Array<{ index: string; line: string }> = secJson?.parse?.sections || [];
    if (!sections.length) return null;

    const findSection = (keyword: RegExp) => sections.find((s) => keyword.test(s.line));
    const seeSec = findSection(/^see/i);
    const doSec = findSection(/^do/i);
    const eatSec = findSection(/^eat/i);
    const drinkSec = findSection(/^drink/i);
    const understandSec = findSection(/^understand/i);

    const fetchSectionText = async (idx?: string): Promise<string> => {
      if (!idx) return "";
      try {
        const u = `https://en.wikivoyage.org/w/api.php?action=parse&page=${encodeURIComponent(
          clean
        )}&section=${idx}&prop=wikitext&format=json`;
        const r = await fetch(u, { next: { revalidate: 86400 } });
        const j = await r.json();
        return j?.parse?.wikitext?.["*"] || "";
      } catch {
        return "";
      }
    };

    const [seeRaw, doRaw, eatRaw, drinkRaw, understandRaw] = await Promise.all([
      fetchSectionText(seeSec?.index),
      fetchSectionText(doSec?.index),
      fetchSectionText(eatSec?.index),
      fetchSectionText(drinkSec?.index),
      fetchSectionText(understandSec?.index),
    ]);

    const result: WikivoyageGuide = {
      title: clean,
      see: extractKeyItems(seeRaw),
      do: extractKeyItems(doRaw),
      eat: extractKeyItems(eatRaw),
      drink: extractKeyItems(drinkRaw),
      tips: extractKeyItems(understandRaw).slice(0, 4),
      rawEat: cleanWikitext(eatRaw).slice(0, 600),
      rawDrink: cleanWikitext(drinkRaw).slice(0, 400),
    };

    memoryCache.set(cacheKey, { exp: Date.now() + CACHE_TTL_MS, data: result });
    return result;
  } catch (err) {
    console.warn("[Wikivoyage] Fetch error:", err);
    return null;
  }
}
