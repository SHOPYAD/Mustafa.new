import { generateGeminiContent } from "@/lib/server/gemini-swarm-client";
import type { Locale } from "@/lib/i18n/types";
import type { PlannerDay, PlannerTrip } from "@/types/planner";
import { placeCaption, writeDayNarrative } from "./day-copy";

type DayCopy = { day: number; titleAr: string; titleEn: string; narrative: string };

const TEMPLATE_RE =
  /وقت ممتع في .+ للتجول والتصوير|A fun stretch at |keyifli yürüyüş, fotoğraf|Un moment agréable à |للتجول والتصوير واستراحة خفيفة/;

export function isTemplateNarrative(text: string): boolean {
  return TEMPLATE_RE.test(String(text || ""));
}

export async function writeUniqueProgramCopy(trip: PlannerTrip, locale: Locale): Promise<PlannerTrip> {
  const city = locale === "ar" ? trip.titleAr.split("—")[0]?.trim() || trip.destination : trip.destination;
  const payload = trip.days.map((d) => ({
    day: d.day,
    places: d.stops
      .filter((s) => s.kind !== "hotel")
      .map((s) => ({
        ar: placeCaption(s, "ar"),
        en: placeCaption(s, "en"),
        slot: locale === "ar" ? s.slotAr : s.slotEn,
      })),
  }));

  const langName = locale === "ar" ? "Arabic" : locale === "tr" ? "Turkish" : locale === "fr" ? "French" : "English";
  const result = await generateGeminiContent<{ days?: DayCopy[] }>({
    temperature: 0.9,
    maxTokens: 2800,
    timeoutMs: 22000,
    responseMimeType: "application/json",
    systemInstruction:
      "You are a master luxury travel designer for Lonaliza VIP Tourism. Write captivating, sensory, day-by-day vacation stories for high-end travelers. Describe the rhythm of the day: morning pickup in private Mercedes VIP vehicle, breathtaking scenic stops, lunch with regional culinary highlights, afternoon immersion in genuine historic or natural landmarks, and relaxing evening unwinding. Never repeat sentences. Never write dull encyclopedia facts. Never use generic fillers.",
    prompt: `Write an exclusive, highly engaging ${trip.durationDays}-day leisure itinerary for ${city}.
Language of titles AND narratives: ${langName} only (no mixed languages).
Tone: Luxurious, inspiring, authentic, experiential — a true dream vacation.
Pacing: Morning private departure -> midday highlights & dining -> afternoon exploration -> evening sunset/leisure.
Each day MUST feel distinct and name the real places in realistic visiting order:
${JSON.stringify(payload)}
Return JSON: {"days":[{"day":1,"titleAr":"...","titleEn":"...","narrative":"4-6 evocative, exciting sentences describing the day's journey"}]}
titleAr: Elegant Arabic title. titleEn: English title. narrative in ${langName}.
Forbidden: Repetitive opening sentences across days, encyclopedic history lectures, village mosques, saying "province".`,
  });

  const parsed = result.data as DayCopy[] | { days?: DayCopy[] } | undefined;
  const written: DayCopy[] = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.days)
      ? parsed.days
      : [];
  const byDay = new Map(written.map((d) => [Number(d.day), d]));

  trip.days = trip.days.map((day) => {
    const hit = byDay.get(day.day);
    const narrative =
      hit?.narrative && !isTemplateNarrative(hit.narrative) && hit.narrative.trim().length > 40
        ? hit.narrative.trim()
        : writeDayNarrative(day, trip.durationDays, city, locale);
    return {
      ...day,
      titleAr: hit?.titleAr?.trim() || day.titleAr,
      titleEn: hit?.titleEn?.trim() || day.titleEn,
      notes: narrative,
    };
  });
  return trip;
}
