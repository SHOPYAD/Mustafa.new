/**
 * Local LibreTranslate (Docker http://127.0.0.1:5000). Used by community posts and hotel reviews.
 * Never invents text — on failure the original string is returned.
 */

const LT_URL = process.env.LIBRETRANSLATE_URL || "http://127.0.0.1:5000/translate";
const MAX_CACHE = 4000;
const cache = new Map<string, string>();

export type LibreLang = "ar" | "en" | "tr";

function normLang(lang?: string): LibreLang {
  const l = String(lang || "ar").toLowerCase().slice(0, 2);
  if (l === "en") return "en";
  if (l === "tr") return "tr";
  return "ar";
}

function cacheKey(source: string, target: string, text: string): string {
  return `${source}:${target}:${text.slice(0, 240)}`;
}

function remember(key: string, value: string): string {
  if (cache.size > MAX_CACHE) cache.clear();
  cache.set(key, value);
  return value;
}

/** True when the text already looks like the site locale (skip a round-trip). */
export function alreadyInLang(text: string, lang?: string): boolean {
  const t = String(text || "").trim();
  if (!t) return true;
  const target = normLang(lang);
  const ar = (t.match(/[\u0600-\u06FF]/g) || []).length;
  const latin = (t.match(/[A-Za-z]/g) || []).length;
  if (target === "ar") return ar >= 6 && ar >= latin;
  if (target === "en") return latin >= 8 && ar < 4;
  return false;
}

async function postTranslate(q: string | string[], target: string, source = "auto"): Promise<string | string[]> {
  const res = await fetch(LT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q, source, target, format: "text" }),
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(`libretranslate ${res.status}`);
  const data = (await res.json()) as { translatedText?: string | string[] };
  if (data.translatedText == null) throw new Error("libretranslate empty");
  return data.translatedText;
}

export async function translateText(
  text: string,
  targetLang?: string,
  sourceLang = "auto"
): Promise<string> {
  const q = String(text || "").trim();
  if (!q) return "";
  const target = normLang(targetLang);
  if (alreadyInLang(q, target)) return q;
  const key = cacheKey(sourceLang, target, q);
  const hit = cache.get(key);
  if (hit) return hit;
  try {
    const out = await postTranslate(q, target, sourceLang);
    const translated = Array.isArray(out) ? String(out[0] || q) : String(out || q);
    return remember(key, translated || q);
  } catch {
    return q;
  }
}

export async function translateMany(texts: string[], targetLang?: string, sourceLang = "auto"): Promise<string[]> {
  const target = normLang(targetLang);
  const results = texts.map((t) => String(t || ""));
  const pending: Array<{ i: number; q: string; key: string }> = [];
  for (let i = 0; i < results.length; i += 1) {
    const q = results[i].trim();
    if (!q || alreadyInLang(q, target)) continue;
    const key = cacheKey(sourceLang, target, q);
    const hit = cache.get(key);
    if (hit) {
      results[i] = hit;
      continue;
    }
    pending.push({ i, q, key });
  }
  const CHUNK = 12;
  for (let offset = 0; offset < pending.length; offset += CHUNK) {
    const chunk = pending.slice(offset, offset + CHUNK);
    try {
      const out = await postTranslate(
        chunk.map((c) => c.q),
        target,
        sourceLang
      );
      const list = Array.isArray(out) ? out : [out];
      chunk.forEach((c, idx) => {
        const translated = String(list[idx] || c.q);
        results[c.i] = remember(c.key, translated || c.q);
      });
    } catch {
      await Promise.all(
        chunk.map(async (c) => {
          results[c.i] = await translateText(c.q, target, sourceLang);
        })
      );
    }
  }
  return results;
}
