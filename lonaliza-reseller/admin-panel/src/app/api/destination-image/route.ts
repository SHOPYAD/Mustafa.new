import { NextRequest, NextResponse } from "next/server";

const cache = new Map<string, { url: string; at: number }>();
const TTL_MS = 7 * 24 * 60 * 60 * 1000;
const UA = "LonalizaTravel/1.0 (https://lonaliza.com; support@lonaliza.com)";

function clean(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

async function wikiJson(url: string): Promise<Record<string, unknown> | null> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as Record<string, unknown>;
}

function thumbnailFromPages(payload: Record<string, unknown> | null): string {
  const query = payload?.query as Record<string, unknown> | undefined;
  const pages = query?.pages as Record<string, Record<string, unknown>> | undefined;
  if (!pages) return "";
  for (const page of Object.values(pages)) {
    const thumb = page.thumbnail as { source?: string } | undefined;
    const src = String(thumb?.source || "").trim();
    if (src.startsWith("https://")) return src;
  }
  return "";
}

async function pageImage(title: string): Promise<string> {
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("titles", title);
  url.searchParams.set("prop", "pageimages");
  url.searchParams.set("pithumbsize", "800");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  return thumbnailFromPages(await wikiJson(url.toString()));
}

async function searchTitle(query: string): Promise<string> {
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("list", "search");
  url.searchParams.set("srsearch", query);
  url.searchParams.set("srlimit", "1");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  const payload = await wikiJson(url.toString());
  const queryRec = payload?.query as Record<string, unknown> | undefined;
  const hits = Array.isArray(queryRec?.search) ? queryRec.search : [];
  const first = hits[0] as { title?: string } | undefined;
  return String(first?.title || "").trim();
}

export async function GET(req: NextRequest) {
  const city = clean(req.nextUrl.searchParams.get("city") || "");
  const country = clean(req.nextUrl.searchParams.get("country") || "");
  if (!city) {
    return NextResponse.json({ ok: false, url: "" }, { status: 400 });
  }
  const key = `${city}|${country}`.toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) {
    return NextResponse.json({ ok: Boolean(hit.url), url: hit.url });
  }

  let url = "";
  try {
    url = (await pageImage(city)) || (country ? await pageImage(`${city}, ${country}`) : "");
    if (!url) {
      const found = await searchTitle(country ? `${city} ${country}` : city);
      if (found) url = await pageImage(found);
    }
  } catch {
    url = "";
  }
  cache.set(key, { url, at: Date.now() });
  return NextResponse.json({ ok: Boolean(url), url });
}
