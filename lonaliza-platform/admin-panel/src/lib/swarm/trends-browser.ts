import type { TrendHit } from "@/lib/swarm/article-pipeline-types";

/** One browser session walks these in order. They are not fired together. */
export const FRANCE_TREND_QUERIES: Array<{ q: string; geo: string; hl: string }> = [
  { q: "France travel", geo: "US", hl: "en-US" },
  { q: "Paris travel", geo: "US", hl: "en-US" },
  { q: "France travel", geo: "SA", hl: "en-US" },
  { q: "Paris travel", geo: "SA", hl: "en-US" },
  { q: "سفر فرنسا", geo: "SA", hl: "ar" },
  { q: "سياحة باريس", geo: "SA", hl: "ar" },
];

export function hitsFromRelatedBody(raw: string, geo: string): TrendHit[] {
  const start = raw.indexOf("{");
  if (start < 0) return [];
  let parsed: {
    default?: {
      rankedList?: Array<{
        rankedKeyword?: Array<{ query?: string; formattedValue?: string; topic?: { title?: string } }>;
      }>;
    };
  };
  try {
    parsed = JSON.parse(raw.slice(start)) as typeof parsed;
  } catch {
    return [];
  }
  const hits: TrendHit[] = [];
  for (const list of parsed.default?.rankedList || []) {
    for (const row of list.rankedKeyword || []) {
      const query = String(row.query || row.topic?.title || "").trim();
      if (!query) continue;
      hits.push({ query, geo, interest: row.formattedValue ? String(row.formattedValue) : undefined });
    }
  }
  return hits;
}

export function trendsBlockReason(input: { navStatus: number | null; title: string; url: string; body: string }): string | null {
  const blob = `${input.title}\n${input.body}`.toLowerCase();
  if (input.navStatus === 429 || blob.includes("error 429") || blob.includes("too many requests") || blob.includes("http 429")) {
    return `HTTP 429 ${input.url}`;
  }
  if (input.url.includes("consent.google.com") || blob.includes("before you continue")) {
    return `consent wall ${input.url}`;
  }
  if (blob.includes("unusual traffic") || blob.includes("captcha") || blob.includes("our systems have detected")) {
    return `blocked ${input.url}`;
  }
  return null;
}
