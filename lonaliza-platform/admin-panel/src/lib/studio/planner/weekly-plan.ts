import { packFor } from "@/lib/automation/content/catalog";
import { discoverRankedTopics } from "@/lib/automation/content/discover";
import type { DiscoveredTopic } from "@/lib/automation/types";
import {
  type StudioFormat,
  type StudioLocale,
  type StudioPlatform,
  type StudioSlot,
  type WeeklyPlan,
  type WeeklyPlanItem,
  isStudioLocale,
} from "@/lib/studio/planner/types";

const ROTATION: Array<{
  platform: StudioPlatform;
  slot: StudioSlot;
  format: StudioFormat;
}> = [
  { platform: "instagram", slot: "morning", format: "slide" },
  { platform: "instagram", slot: "afternoon", format: "reel" },
  { platform: "tiktok", slot: "evening", format: "reel" },
  { platform: "instagram", slot: "morning", format: "story" },
  { platform: "facebook", slot: "afternoon", format: "slide" },
  { platform: "instagram", slot: "evening", format: "reel" },
  { platform: "youtube", slot: "morning", format: "reel" },
];

function mondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addUtcDays(start: Date, days: number): Date {
  const next = new Date(start);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function topicTitle(topic: DiscoveredTopic, locale: StudioLocale): string {
  switch (locale) {
    case "ar":
      return topic.titleAr || topic.titleEn;
    case "en":
    default:
      return topic.titleEn || topic.titleAr;
    case "tr":
      return topic.titleTr || topic.titleEn || topic.titleAr;
  }
}

function destLabel(topic: DiscoveredTopic, locale: StudioLocale): string {
  const pack = packFor(topic.destination);
  if (!pack) return locale === "tr" ? "Türkiye" : locale === "en" ? "Turkey" : "تركيا";
  switch (locale) {
    case "ar":
      return pack.nameAr;
    case "en":
    default:
      return pack.nameEn;
    case "tr":
      return pack.nameTr;
  }
}

function captionFor(
  topic: DiscoveredTopic,
  locale: StudioLocale,
  platform: StudioPlatform,
  format: StudioFormat
): string {
  const title = topicTitle(topic, locale);
  const dest = destLabel(topic, locale);
  const tags =
    locale === "tr"
      ? "#Alrayyan #Türkiye #Seyahat"
      : locale === "en"
        ? "#Alrayyan #TurkeyTravel #VisitTurkey"
        : "#لوناليزا #سياحة_تركيا #السفر";
  const cta =
    locale === "tr"
      ? "Rezervasyon: wa.me/905321796763"
      : locale === "en"
        ? "Book with Alrayyan: wa.me/905321796763"
        : "احجز مع لوناليزا: wa.me/905321796763";
  const hook =
    format === "story"
      ? locale === "en"
        ? "Swipe for this week's pick"
        : locale === "tr"
          ? "Bu haftanın önerisi"
          : "اختيار هذا الأسبوع"
      : format === "reel"
        ? locale === "en"
          ? "Save this reel before you book"
          : locale === "tr"
            ? "Rezervasyondan önce kaydet"
            : "احفظ الريل قبل الحجز"
        : locale === "en"
          ? "A slide from Alrayyan Tourism"
          : locale === "tr"
            ? "Alrayyan'dan bir slayt"
            : "سلايد من لوناليزا للسياحة والسفر";
  return `${hook}\n${title}\n${dest} · ${platform}\n${cta}\n${tags}`;
}

export function buildWeeklyPlanFromTopics(input: {
  topics: DiscoveredTopic[];
  locale: StudioLocale;
  weekStart: Date;
  now: Date;
  sourcesUsed: string[];
  limitations: string[];
}): WeeklyPlan {
  const items: WeeklyPlanItem[] = [];
  const used = new Set<string>();
  for (let i = 0; i < 7; i += 1) {
    const topic =
      input.topics.find((row) => !used.has(row.id)) ||
      input.topics[i % Math.max(1, input.topics.length)];
    if (topic) used.add(topic.id);
    const rot = ROTATION[i];
    const date = isoDate(addUtcDays(input.weekStart, i));
    items.push({
      day: (i + 1) as WeeklyPlanItem["day"],
      date,
      platform: rot.platform,
      slot: rot.slot,
      format: rot.format,
      topic: topic ? topicTitle(topic, input.locale) : "تركيا هذا الأسبوع",
      destination: topic ? destLabel(topic, input.locale) : "تركيا",
      captionDraft: topic
        ? captionFor(topic, input.locale, rot.platform, rot.format)
        : "",
      sourceIds: topic?.sourceIds || [],
      score: topic?.score || 0,
    });
  }
  return {
    id: `week-${isoDate(input.weekStart)}`,
    weekStart: isoDate(input.weekStart),
    locale: input.locale,
    generatedAt: input.now.toISOString(),
    items,
    sourcesUsed: input.sourcesUsed,
    limitations: input.limitations,
  };
}

export function parseStudioLocale(raw: unknown): StudioLocale {
  const value = typeof raw === "string" ? raw.trim().toLowerCase() : "";
  return isStudioLocale(value) ? value : "ar";
}

export async function generateWeeklyTourismPlan(input?: {
  locale?: unknown;
  weekStart?: unknown;
  now?: Date;
}): Promise<WeeklyPlan> {
  const locale = parseStudioLocale(input?.locale);
  const now = input?.now || new Date();
  const parsedStart =
    typeof input?.weekStart === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input.weekStart)
      ? new Date(`${input.weekStart}T00:00:00.000Z`)
      : mondayOf(now);
  const weekStart = Number.isNaN(parsedStart.getTime()) ? mondayOf(now) : parsedStart;

  const discovered = await discoverRankedTopics({
    sources: ["trends", "rss", "official"],
    now,
  });

  return buildWeeklyPlanFromTopics({
    topics: discovered.topics,
    locale,
    weekStart,
    now,
    sourcesUsed: discovered.meta.sourcesUsed,
    limitations: discovered.meta.limitations,
  });
}
