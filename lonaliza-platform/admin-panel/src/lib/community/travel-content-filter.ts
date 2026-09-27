/**
 * Travel-only ingest gate for Lonaliza reels / community posts.
 * Allowlist tourism tags; reject beauty/fashion/NSFW; never treat #reels as travel.
 */

export const TRAVEL_ALLOW_TAGS = [
  "travel",
  "tourism",
  "hotel",
  "hotels",
  "flight",
  "flights",
  "airline",
  "lonaliza_travel",
  "lonaliza",
  "tour",
  "tours",
  "vacation",
  "holiday",
  "resort",
  "booking",
  "istanbul",
  "trabzon",
  "antalya",
  "cappadocia",
  "turkey",
  "turkiye",
  "سياحة",
  "سفر",
  "فندق",
  "فنادق",
  "طيران",
  "رحلة",
  "رحلات",
  "منتجع",
  "اسطنبول",
  "إسطنبول",
  "طرابزون",
] as const;

export const TRAVEL_REJECT_TAGS = [
  "beauty",
  "beautiful",
  "girl",
  "girls",
  "boy",
  "dance",
  "dancing",
  "model",
  "models",
  "nsfw",
  "sexy",
  "onlyfans",
  "fashion",
  "makeup",
  "lingerie",
  "cute",
  "cosplay",
  "tiktokdance",
] as const;

const TRAVEL_ALLOW_SET = new Set(TRAVEL_ALLOW_TAGS.map((t) => t.toLowerCase()));
const TRAVEL_REJECT_SET = new Set(TRAVEL_REJECT_TAGS.map((t) => t.toLowerCase()));

const TRAVEL_CONTENT_KEYWORDS = [
  "سياحة",
  "سفر",
  "فندق",
  "فنادق",
  "رحلة",
  "رحلات",
  "جولة",
  "منتجع",
  "طيران",
  "اسطنبول",
  "إسطنبول",
  "طرابزون",
  "بورصة",
  "أنطاليا",
  "كابادوكيا",
  "لوناليزا",
  "مطار",
  "travel",
  "tourism",
  "hotel",
  "resort",
  "trip",
  "tour",
  "vacation",
  "holiday",
  "flight",
  "airline",
  "istanbul",
  "trabzon",
  "antalya",
  "cappadocia",
  "turkey",
  "lonaliza",
  "gezi",
  "seyahat",
  "tatil",
  "otel",
  "turizm",
  "voyage",
  "tourisme",
];

const REJECT_CONTENT_KEYWORDS = [
  "onlyfans",
  "nsfw",
  "porn",
  "xxx",
  "nude",
  "lingerie",
  "رقص",
  "إباحي",
];

const REJECT_TITLE_RE =
  /little\s*angel|#\s*(beauty|beautiful|girl|girls|dance|dancing|model|nsfw)\b/i;

const TRAVEL_CATEGORIES = new Set([
  "hotels",
  "tours",
  "vip-tours",
  "cars",
  "flights",
  "activities",
  "dining",
  "transfers",
]);

export type TravelFilterInput = {
  content?: string;
  title?: string;
  description?: string;
  tags?: string[];
  category?: string;
  destination?: string;
  pubkey?: string;
  source?: "relay" | "local";
};

export type TravelFilterResult = {
  ok: boolean;
  reason: "allow" | "reject_tag" | "reject_keyword" | "no_travel_signal" | "unverified_pubkey";
};

function extractHashtags(text: string): string[] {
  if (!text) return [];
  const tags: string[] = [];
  const re = /#([^\s#]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const raw = m[1].replace(/[^\p{L}\p{N}_-]+/gu, "").toLowerCase();
    if (raw) tags.push(raw);
  }
  return tags;
}

function normalizeTag(value: string): string {
  return String(value || "")
    .trim()
    .replace(/^#/, "")
    .toLowerCase();
}

export function collectContentTags(input: TravelFilterInput): string[] {
  const fromField = (input.tags || []).map(normalizeTag).filter(Boolean);
  const blob = [input.content, input.title, input.description].filter(Boolean).join("\n");
  return [...new Set([...fromField, ...extractHashtags(blob)])];
}

export function hasRejectSignal(input: TravelFilterInput): boolean {
  const tags = collectContentTags(input);
  if (tags.some((t) => TRAVEL_REJECT_SET.has(t))) return true;
  const blob = [input.title, input.content, input.description].filter(Boolean).join("\n");
  if (REJECT_TITLE_RE.test(blob)) return true;
  const lower = blob.toLowerCase();
  return REJECT_CONTENT_KEYWORDS.some((kw) => lower.includes(kw.toLowerCase()));
}

export function hasTravelSignal(input: TravelFilterInput): boolean {
  const tags = collectContentTags(input);
  if (tags.some((t) => TRAVEL_ALLOW_SET.has(t))) return true;
  if (input.category && TRAVEL_CATEGORIES.has(input.category.toLowerCase())) {
    // Category alone is not enough for public-relay ingest.
    if (input.source !== "relay") return true;
  }
  const blob = [input.title, input.content, input.description, input.destination]
    .filter(Boolean)
    .join("\n")
    .toLowerCase();
  let hits = 0;
  for (const kw of TRAVEL_CONTENT_KEYWORDS) {
    if (blob.includes(kw.toLowerCase())) {
      hits += 1;
      if (hits >= 1 && input.source !== "relay") return true;
      if (hits >= 2) return true;
    }
  }
  return false;
}

export function evaluateTravelContent(input: TravelFilterInput): TravelFilterResult {
  if (hasRejectSignal(input)) {
    const tags = collectContentTags(input);
    if (tags.some((t) => TRAVEL_REJECT_SET.has(t))) {
      return { ok: false, reason: "reject_tag" };
    }
    return { ok: false, reason: "reject_keyword" };
  }
  if (!hasTravelSignal(input)) {
    return { ok: false, reason: "no_travel_signal" };
  }
  return { ok: true, reason: "allow" };
}

export function isTravelEligibleContent(input: TravelFilterInput): boolean {
  return evaluateTravelContent(input).ok;
}

export function isVerifiedSyndicationPubkey(
  pubkey: string | undefined,
  allowlist: string[] | undefined,
): boolean {
  if (!pubkey || !allowlist?.length) return false;
  const needle = pubkey.trim().toLowerCase();
  return allowlist.some((p) => p.trim().toLowerCase() === needle);
}

export type NostrLikeEvent = {
  content?: string;
  pubkey?: string;
  tags?: string[][];
};

export function eventToTravelInput(event: NostrLikeEvent, source: "relay" | "local" = "relay"): TravelFilterInput {
  const tags: string[] = [];
  for (const tag of event.tags || []) {
    const key = String(tag[0] || "").toLowerCase();
    const val = String(tag[1] || "");
    if (key === "t" || key === "c" || key === "d" || key === "category" || key === "destination") {
      tags.push(val);
    }
  }
  return {
    content: event.content || "",
    tags,
    pubkey: event.pubkey,
    source,
  };
}

export function canonicalMediaKey(url?: string): string {
  if (!url) return "";
  const path = url.split("?")[0].trim();
  const hash = path.match(/([a-f0-9]{64})/i);
  if (hash) return hash[1].toLowerCase();
  return path.toLowerCase();
}

export const DUPLICATE_WINDOW_SEC = 60;

export function isWithinDuplicateWindow(
  createdAtSec: number,
  nowSec = Math.floor(Date.now() / 1000),
  windowSec = DUPLICATE_WINDOW_SEC,
): boolean {
  return nowSec - createdAtSec >= 0 && nowSec - createdAtSec <= windowSec;
}

export function matchIdempotentPost<T extends { uploadUuid?: string; mediaHash?: string; created_at?: number }>(
  posts: T[],
  opts: { uploadUuid?: string; mediaHash?: string; nowSec?: number; windowSec?: number },
): T | undefined {
  const uuid = opts.uploadUuid?.trim();
  const hash = opts.mediaHash?.trim().toLowerCase();
  const nowSec = opts.nowSec ?? Math.floor(Date.now() / 1000);
  const windowSec = opts.windowSec ?? DUPLICATE_WINDOW_SEC;
  return posts.find((p) => {
    if (!isWithinDuplicateWindow(p.created_at || 0, nowSec, windowSec)) return false;
    if (uuid && p.uploadUuid && p.uploadUuid === uuid) return true;
    if (hash && p.mediaHash && p.mediaHash.toLowerCase() === hash) return true;
    return false;
  });
}
