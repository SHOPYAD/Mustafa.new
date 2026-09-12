export const STUDIO_PLATFORMS = [
  "instagram",
  "tiktok",
  "facebook",
  "youtube",
] as const;
export type StudioPlatform = (typeof STUDIO_PLATFORMS)[number];

export const STUDIO_SLOTS = ["morning", "afternoon", "evening"] as const;
export type StudioSlot = (typeof STUDIO_SLOTS)[number];

export const STUDIO_FORMATS = ["slide", "reel", "story"] as const;
export type StudioFormat = (typeof STUDIO_FORMATS)[number];

export const STUDIO_LOCALES = ["ar", "en", "tr"] as const;
export type StudioLocale = (typeof STUDIO_LOCALES)[number];

export type WeeklyPlanItem = {
  day: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  date: string;
  platform: StudioPlatform;
  slot: StudioSlot;
  format: StudioFormat;
  topic: string;
  destination: string;
  captionDraft: string;
  sourceIds: string[];
  score: number;
};

export type WeeklyPlan = {
  id: string;
  weekStart: string;
  locale: StudioLocale;
  generatedAt: string;
  items: WeeklyPlanItem[];
  sourcesUsed: string[];
  limitations: string[];
};

export function isStudioPlatform(value: string): value is StudioPlatform {
  return (STUDIO_PLATFORMS as readonly string[]).includes(value);
}

export function isStudioSlot(value: string): value is StudioSlot {
  return (STUDIO_SLOTS as readonly string[]).includes(value);
}

export function isStudioFormat(value: string): value is StudioFormat {
  return (STUDIO_FORMATS as readonly string[]).includes(value);
}

export function isStudioLocale(value: string): value is StudioLocale {
  return (STUDIO_LOCALES as readonly string[]).includes(value);
}
