import type {
  AutomationJob,
  AutomationJobContext,
  ContentImageProvider,
  ContentJobSettings,
  ContentLocale,
  ContentSourceId,
} from "@/lib/automation/types";

const SOURCE_IDS: ContentSourceId[] = ["trends", "rss", "official"];
const LOCALES: ContentLocale[] = ["ar", "tr", "en"];
const IMAGE_PROVIDERS: ContentImageProvider[] = [
  "unsplash",
  "pexels",
  "wikimedia",
  "auto",
];

function asLocale(value: unknown): ContentLocale | null {
  const v = String(value || "").trim().toLowerCase();
  return LOCALES.includes(v as ContentLocale) ? (v as ContentLocale) : null;
}

function asSource(value: unknown): ContentSourceId | null {
  const v = String(value || "").trim().toLowerCase();
  return SOURCE_IDS.includes(v as ContentSourceId)
    ? (v as ContentSourceId)
    : null;
}

function asImageProvider(value: unknown): ContentImageProvider | null {
  const v = String(value || "").trim().toLowerCase();
  return IMAGE_PROVIDERS.includes(v as ContentImageProvider)
    ? (v as ContentImageProvider)
    : null;
}

function asBool(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (v === "true" || v === "1" || v === "yes") return true;
    if (v === "false" || v === "0" || v === "no") return false;
  }
  return undefined;
}

function asCount(value: unknown, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(8, Math.floor(n));
}

function asMinWords(value: unknown, fallback: number): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 400) return fallback;
  return Math.min(4000, Math.floor(n));
}

export const DEFAULT_CONTENT_SETTINGS: Required<
  Omit<ContentJobSettings, "publishAt">
> & { publishAt?: string } = {
  sources: ["trends", "rss", "official"],
  locales: ["ar"],
  autoPublish: false,
  imageProvider: "auto",
  minWords: 1200,
  count: 1,
  dryRun: false,
  draft: true,
};

export function readContentSettings(
  job: Partial<AutomationJob>,
  ctx?: AutomationJobContext
): Required<Omit<ContentJobSettings, "publishAt">> & { publishAt?: string } {
  const nested = {
    ...(job.config || {}),
    ...(job.settings || {}),
  };
  const localesRaw = nested.locales || job.locales || [];
  const locales = (Array.isArray(localesRaw) ? localesRaw : [localesRaw])
    .map(asLocale)
    .filter((x): x is ContentLocale => Boolean(x));
  const jobLocale = asLocale(job.locale);
  const sourcesRaw = Array.isArray(nested.sources)
    ? nested.sources
    : DEFAULT_CONTENT_SETTINGS.sources;
  const sources = sourcesRaw
    .map(asSource)
    .filter((x): x is ContentSourceId => Boolean(x));

  const autoPublish =
    asBool(nested.autoPublish) ??
    asBool(job.autoPublish) ??
    DEFAULT_CONTENT_SETTINGS.autoPublish;
  const draft =
    asBool(nested.draft) ?? (autoPublish ? false : DEFAULT_CONTENT_SETTINGS.draft);
  const dryRun =
    asBool(ctx?.dryRun) ??
    asBool(nested.dryRun) ??
    asBool(job.dryRun) ??
    DEFAULT_CONTENT_SETTINGS.dryRun;

  return {
    sources: sources.length ? sources : DEFAULT_CONTENT_SETTINGS.sources,
    locales: locales.length
      ? locales
      : jobLocale
        ? [jobLocale]
        : DEFAULT_CONTENT_SETTINGS.locales,
    autoPublish,
    imageProvider:
      asImageProvider(nested.imageProvider) ||
      DEFAULT_CONTENT_SETTINGS.imageProvider,
    minWords: asMinWords(nested.minWords, DEFAULT_CONTENT_SETTINGS.minWords),
    count: asCount(nested.count ?? job.count, DEFAULT_CONTENT_SETTINGS.count),
    publishAt: typeof nested.publishAt === "string" ? nested.publishAt : job.publishAt,
    dryRun,
    draft,
  };
}

export function shouldPublishNow(input: {
  autoPublish: boolean;
  draft: boolean;
  publishAt?: string;
  now: Date;
}): boolean {
  if (input.draft && !input.autoPublish) return false;
  if (!input.autoPublish) return false;
  if (!input.publishAt) return true;
  const at = Date.parse(input.publishAt);
  if (!Number.isFinite(at)) return true;
  return at <= input.now.getTime();
}
