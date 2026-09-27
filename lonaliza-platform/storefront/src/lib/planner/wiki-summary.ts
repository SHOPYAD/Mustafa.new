import { createLru } from "./lru";
import { localAliases } from "./place-photos";
import { catalogPoisForCity } from "./catalog";

const UA = "LonalizaPlanner/1.0 (https://lonaliza.com; info@lonaliza.com)";

export type WikiSummaryResult = {
  title?: string;
  description?: string;
  sourceUrl?: string;
};

const cache = createLru<WikiSummaryResult>(500);

async function directSummary(title: string, lang: string): Promise<WikiSummaryResult | null> {
  try {
    const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.trim())}?redirect=true`;
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      title?: string;
      extract?: string;
      content_urls?: { desktop?: { page?: string } };
      type?: string;
    };
    if (json.type === "disambiguation" || !json.extract) return null;
    return {
      title: json.title,
      description: json.extract,
      sourceUrl: json.content_urls?.desktop?.page,
    };
  } catch {
    return null;
  }
}

function titleRelevance(pageTitle: string, query: string): boolean {
  const normTitle = pageTitle.toLowerCase().replace(/[\(\)\[\]\-—_]/g, " ").trim();
  const normQuery = query.toLowerCase().replace(/[\(\)\[\]\-—_]/g, " ").trim();
  if (normTitle.includes(normQuery) || normQuery.includes(normTitle)) return true;
  const qWords = normQuery.split(/\s+/).filter((w) => w.length >= 3 && !/^(the|and|city|tour|trip|near|في|مع|من|على)$/i.test(w));
  return qWords.length > 0 && qWords.some((w) => normTitle.includes(w));
}

async function searchSummary(query: string, lang: string): Promise<WikiSummaryResult | null> {
  try {
    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&prop=extracts|info&inprop=url&exintro=1&explaintext=1&format=json&origin=*`;
    const res = await fetch(url, { headers: { "User-Agent": UA }, next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      query?: {
        pages?: Record<
          string,
          {
            title?: string;
            extract?: string;
            fullurl?: string;
          }
        >;
      };
    };
    const pages = Object.values(json.query?.pages || {});
    // Strictly require pages whose title actually matches query terms
    const relevantHit = pages.find((p) => {
      if (!p.extract || /disambiguation|^list of/i.test(p.title || "")) return false;
      return titleRelevance(p.title || "", query);
    });
    // Never fall back to an arbitrary unrelated article (e.g. random cities)
    if (!relevantHit) return null;
    return {
      title: relevantHit.title,
      description: relevantHit.extract,
      sourceUrl: relevantHit.fullurl,
    };
  } catch {
    return null;
  }
}

export async function wikiSummary(
  title: string,
  lang: "en" | "ar" | "tr" | "fr" = "en",
  city = ""
): Promise<WikiSummaryResult> {
  const cleanTitle = String(title || "").trim();
  if (!cleanTitle) return {};
  const key = `${lang}|${cleanTitle.toLowerCase()}|${city.toLowerCase()}`;
  const hit = cache.get(key);
  if (hit) return hit;

  let result: WikiSummaryResult | null = null;

  // 0. Curated catalog match for known destinations (stripping brackets and fuzzy matching)
  if (city) {
    const pois = catalogPoisForCity(city);
    const cleanNorm = cleanTitle.toLowerCase().replace(/[\(\)\[\]\-—_]/g, " ").trim();
    const seed = pois.find((p) => {
      const arNorm = (p.titleAr || "").toLowerCase().replace(/[\(\)\[\]\-—_]/g, " ").trim();
      const enNorm = (p.titleEn || "").toLowerCase().replace(/[\(\)\[\]\-—_]/g, " ").trim();
      return (
        arNorm === cleanNorm ||
        enNorm === cleanNorm ||
        (cleanNorm.length >= 4 && (arNorm.includes(cleanNorm) || cleanNorm.includes(arNorm))) ||
        (cleanNorm.length >= 4 && (enNorm.includes(cleanNorm) || cleanNorm.includes(enNorm)))
      );
    });
    if (seed && (seed.detailAr || seed.detailEn)) {
      result = {
        title: lang === "ar" ? seed.titleAr : seed.titleEn,
        description: (lang === "ar" ? seed.detailAr : seed.detailEn) || undefined,
        image: seed.image,
      };
    }
  }

  // 1. Direct summary in requested language
  if (!result || !result.description) {
    result = await directSummary(cleanTitle, lang);
  }

  // 2. Search summary in requested language
  if (!result || !result.description) {
    const q = city ? `${cleanTitle} ${city}` : cleanTitle;
    result = await searchSummary(q, lang);
  }

  // 3. If requested language was Arabic and yielded no description, try aliases
  const aliases = localAliases(cleanTitle);
  if ((!result || !result.description) && lang === "ar") {
    for (const alias of aliases.slice(0, 3)) {
      result = await directSummary(alias, "ar");
      if (result?.description) break;
      result = await searchSummary(alias, "ar");
      if (result?.description) break;
    }
  }

  // 4. Cross-language fallback: if still empty or missing extract, search with local aliases in English / local language
  if (!result || !result.description) {
    const searchTerms = [cleanTitle, ...aliases];
    const fallbackLangs =
      lang === "ar"
        ? city.toLowerCase().includes("turkey") || city.toLowerCase().includes("trabzon")
          ? ["tr", "en"]
          : ["en", "fr"]
        : ["en"];
    for (const flang of fallbackLangs) {
      if (flang === lang) continue;
      for (const term of searchTerms.slice(0, 3)) {
        const queryTerm = city ? `${term} ${city}` : term;
        const fb = (await directSummary(term, flang)) || (await searchSummary(queryTerm, flang));
        if (fb?.description) {
          result = {
            title: fb.title,
            description: fb.description,
            image: fb.image,
            sourceUrl: fb.sourceUrl,
          };
          break;
        }
      }
      if (result?.description) break;
    }
  }

  const out: WikiSummaryResult = result || { title: cleanTitle };

  if (!out.image || !out.description) {
    try {
      const { fetchWikidataPlace } = await import("@/lib/server/wikidata");
      const wd = await fetchWikidataPlace(cleanTitle, lang);
      if (wd) {
        if (!out.image && wd.image) out.image = wd.image;
        if (!out.description && wd.description) out.description = wd.description;
      }
    } catch {
      /* ignore */
    }
  }

  if (out.image) {
    out.images = [out.image];
  }

  cache.set(key, out);
  return out;
}

