import {
  EVERGREEN_TOPICS,
  inferDestination,
} from "@/lib/automation/content/catalog";
import {
  decodeXmlEntities,
  fetchText,
  stripGoogleJsonPreamble,
} from "@/lib/automation/content/fetch-text";
import {
  productMatchBoost,
  recencyFromDate,
  scoreTopic,
  rankTopics,
} from "@/lib/automation/content/score";
import {
  CONTENT_RSS_SOURCES,
  TRENDS_DAILY_URLS,
} from "@/lib/automation/content/sources";
import { getServerEnv } from "@/lib/server/env-store";
import type {
  ContentSourceId,
  DiscoveredTopic,
} from "@/lib/automation/types";

export type DiscoverMeta = {
  sourcesUsed: string[];
  limitations: string[];
};

type RawHit = {
  title: string;
  link?: string;
  publishedAt?: string;
  sourceId: string;
  sourceName: string;
  kind: ContentSourceId;
  interest?: number;
};

function slugId(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function parseRssItems(xml: string): { title: string; link?: string; pubDate?: string }[] {
  const items: { title: string; link?: string; pubDate?: string }[] = [];
  const blocks = xml.split(/<item[\s>]/i).slice(1);
  const fallback = blocks.length ? blocks : xml.split(/<entry[\s>]/i).slice(1);
  for (const block of fallback.slice(0, 20)) {
    const title =
      decodeXmlEntities(
        (block.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || ""
      ) || "";
    if (!title) continue;
    const link = decodeXmlEntities(
      (block.match(/<link[^>]*>([\s\S]*?)<\/link>/i) || [])[1] ||
        (block.match(/<link[^>]+href=["']([^"']+)/i) || [])[1] ||
        ""
    );
    const pubDate =
      decodeXmlEntities(
        (block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) || [])[1] ||
          (block.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i) || [])[1] ||
          (block.match(/<published[^>]*>([\s\S]*?)<\/published>/i) || [])[1] ||
          ""
      ) || undefined;
    items.push({ title, link: link || undefined, pubDate });
  }
  return items;
}

function parseDailyTrends(raw: string): { title: string; traffic?: number }[] {
  try {
    const json = JSON.parse(stripGoogleJsonPreamble(raw)) as {
      default?: {
        trendingSearchesDays?: Array<{
          trendingSearches?: Array<{
            title?: { query?: string };
            formattedTraffic?: string;
          }>;
        }>;
      };
    };
    const out: { title: string; traffic?: number }[] = [];
    for (const day of json.default?.trendingSearchesDays || []) {
      for (const row of day.trendingSearches || []) {
        const title = String(row.title?.query || "").trim();
        if (!title) continue;
        const traffic = Number(String(row.formattedTraffic || "").replace(/[^\d]/g, ""));
        out.push({
          title,
          traffic: Number.isFinite(traffic) ? Math.min(100, traffic / 20) : undefined,
        });
      }
    }
    return out.slice(0, 24);
  } catch {
    return [];
  }
}

function travelRelated(title: string): boolean {
  return /turkey|türkiye|turkiye|istanbul|antalya|trabzon|cappadocia|kapadokya|تركيا|إسطنبول|اسطنبول|أنطاليا|طرابزون|كابادوكيا|سياح|سفر|tatil|seyahat|vize|تأشير|otel|hotel|uçak|طيران/i.test(
    title
  );
}

async function fetchRssHits(
  enabled: Set<ContentSourceId>,
  meta: DiscoverMeta
): Promise<RawHit[]> {
  const hits: RawHit[] = [];
  for (const source of CONTENT_RSS_SOURCES) {
    if (!enabled.has(source.kind)) continue;
    if (source.kind === "official" && source.url.includes(".html")) {
      const page = await fetchText(source.url, { timeoutMs: 7000 });
      if (!page.ok) {
        meta.limitations.push(`تعذّر مصدر رسمي: ${source.name}`);
        continue;
      }
      const titles = [
        ...page.text.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi),
        ...page.text.matchAll(/<(h1|h2|h3)[^>]*>([\s\S]*?)<\/\1>/gi),
      ]
        .map((m) => decodeXmlEntities(m[2] || m[1] || ""))
        .filter((t) => t.length > 12 && travelRelated(t))
        .slice(0, 8);
      if (titles.length) {
        meta.sourcesUsed.push(source.name);
        for (const title of titles) {
          hits.push({
            title,
            sourceId: source.id,
            sourceName: source.name,
            kind: "official",
          });
        }
      } else {
        meta.limitations.push(`المصدر الرسمي أعاد عناوين فقط دون نتائج سفر: ${source.name}`);
      }
      continue;
    }
    const res = await fetchText(source.url);
    if (!res.ok) {
      meta.limitations.push(`تعذّر RSS: ${source.name} (${res.status || "network"})`);
      continue;
    }
    const items = parseRssItems(res.text).filter((item) => travelRelated(item.title));
    if (!items.length) {
      meta.limitations.push(`لا عناوين سفر من: ${source.name}`);
      continue;
    }
    meta.sourcesUsed.push(source.name);
    for (const item of items) {
      hits.push({
        title: item.title,
        link: item.link,
        publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : undefined,
        sourceId: source.id,
        sourceName: source.name,
        kind: source.kind,
      });
    }
  }
  return hits;
}

async function fetchUnofficialTrends(meta: DiscoverMeta): Promise<RawHit[]> {
  const hits: RawHit[] = [];
  for (const url of TRENDS_DAILY_URLS) {
    const res = await fetchText(url, {
      headers: { Accept: "application/json, text/plain" },
    });
    if (!res.ok) {
      meta.limitations.push(`تعذّر Google Trends غير الرسمي (${res.status || "network"})`);
      continue;
    }
    const rows = parseDailyTrends(res.text).filter((row) => travelRelated(row.title));
    if (!rows.length) continue;
    meta.sourcesUsed.push(`Google Trends daily (${url.includes("geo=SA") ? "SA" : "TR"})`);
    for (const row of rows) {
      hits.push({
        title: row.title,
        sourceId: "trends-daily",
        sourceName: "Google Trends (unofficial public)",
        kind: "trends",
        interest: row.traffic,
        publishedAt: new Date().toISOString(),
      });
    }
  }
  return hits;
}

async function fetchSerpApiTrends(meta: DiscoverMeta): Promise<RawHit[]> {
  const key =
    (await getServerEnv("SERPAPI_KEY")) ||
    (await getServerEnv("GOOGLE_TRENDS_API_KEY")) ||
    process.env.SERPAPI_KEY ||
    process.env.GOOGLE_TRENDS_API_KEY ||
    "";
  if (!key) {
    meta.limitations.push(
      "لا يوجد SERPAPI_KEY / GOOGLE_TRENDS_API_KEY — الاعتماد على Trends العام وRSS فقط"
    );
    return [];
  }
  const url = new URL("https://serpapi.com/search.json");
  url.searchParams.set("engine", "google_trends");
  url.searchParams.set("q", "Turkey travel,Istanbul,Antalya,Cappadocia");
  url.searchParams.set("geo", "SA");
  url.searchParams.set("api_key", key);
  const res = await fetchText(url.toString());
  if (!res.ok) {
    meta.limitations.push("مفتاح Trends موجود لكن الطلب فشل — تم التجاهل");
    return [];
  }
  try {
    const json = JSON.parse(res.text) as {
      interest_over_time?: {
        timeline_data?: Array<{ values?: Array<{ query?: string; extracted_value?: number }> }>;
      };
    };
    const last = json.interest_over_time?.timeline_data?.at(-1)?.values || [];
    meta.sourcesUsed.push("SerpAPI / Google Trends");
    return last
      .filter((row) => row.query)
      .map((row) => ({
        title: String(row.query),
        sourceId: "serpapi-trends",
        sourceName: "SerpAPI Google Trends",
        kind: "trends" as const,
        interest: Number(row.extracted_value) || 50,
        publishedAt: new Date().toISOString(),
      }));
  } catch {
    meta.limitations.push("تعذّر قراءة استجابة Trends المدفوعة");
    return [];
  }
}

function evergreenAsHits(now: Date): DiscoveredTopic[] {
  return EVERGREEN_TOPICS.map((seed) => {
    const recencyScore = 62;
    const trendInterest = seed.baseInterest;
    const scored = scoreTopic({
      trendInterest,
      recencyScore,
      destination: seed.destination,
    });
    return {
      id: seed.id,
      titleAr: seed.titleAr,
      titleEn: seed.titleEn,
      titleTr: seed.titleTr,
      queryAr: seed.queryAr,
      queryEn: seed.queryEn,
      destination: seed.destination,
      angle: seed.angle,
      sourceIds: ["evergreen-alrayyan"],
      sourceTitles: [],
      trendInterest,
      recencyScore,
      relevanceScore: scored.relevanceScore,
      score: scored.score,
      publishedAt: now.toISOString(),
    };
  });
}

function hitToTopic(hit: RawHit, now: Date): DiscoveredTopic {
  const destination = inferDestination(hit.title);
  const recencyScore = recencyFromDate(hit.publishedAt, now);
  const trendInterest = clampInterest(
    (hit.interest ?? (hit.kind === "trends" ? 72 : 48)) + productMatchBoost(hit.title)
  );
  const scored = scoreTopic({
    trendInterest,
    recencyScore,
    destination,
  });
  const id = `rss-${slugId(hit.title) || hit.sourceId}`;
  return {
    id,
    titleAr: hit.title,
    titleEn: hit.title,
    titleTr: hit.title,
    queryAr: hit.title,
    queryEn: hit.title,
    destination,
    angle: hit.kind,
    sourceIds: [hit.sourceId],
    sourceTitles: [hit.title],
    publishedAt: hit.publishedAt,
    trendInterest,
    recencyScore,
    relevanceScore: scored.relevanceScore,
    score: scored.score,
  };
}

function clampInterest(value: number): number {
  return Math.max(8, Math.min(100, Math.round(value)));
}

export async function discoverRankedTopics(input: {
  sources: ContentSourceId[];
  now: Date;
  log?: (message: string) => void;
}): Promise<{ topics: DiscoveredTopic[]; meta: DiscoverMeta }> {
  const enabled = new Set(input.sources);
  const meta: DiscoverMeta = { sourcesUsed: ["كتالوج الريان الدائم (تركيا)"], limitations: [] };
  const evergreen = evergreenAsHits(input.now);
  const hits: RawHit[] = [];

  if (enabled.has("rss") || enabled.has("official")) {
    hits.push(...(await fetchRssHits(enabled, meta)));
  }
  if (enabled.has("trends")) {
    hits.push(...(await fetchUnofficialTrends(meta)));
    hits.push(...(await fetchSerpApiTrends(meta)));
  }

  const fromLive = hits
    .filter((hit) => travelRelated(hit.title))
    .map((hit) => hitToTopic(hit, input.now));

  input.log?.(
    `اكتشاف المواضيع: دائم=${evergreen.length} مباشر=${fromLive.length} مصادر=${meta.sourcesUsed.join(", ")}`
  );

  return {
    topics: rankTopics([...fromLive, ...evergreen]),
    meta,
  };
}
