/**
 * Transfers provider config — env fallbacks + server store overlay via /api/transfers-config.
 * Official Travelpayouts widget: tpemb.com/content promo 1504 / shmarker 324632.324632.
 */

import {
  extractScriptUrl,
  isNumericTravelpayoutsId,
  isTravelpayoutsPlaceholder,
} from "@/lib/travelpayouts-utils";
import {
  applyTpembCurrencyParams,
  forceHttpsTpembUrl,
  normalizeTransfersCurrency,
} from "@/lib/tpemb-embed";

export type TransferProvider = "internal" | "travelpayouts";

export const TRANSFERS_TP_FLAG_KEYS = [
  "powered_by",
  "b_counter",
  "b_benefit",
  "b_descr",
  "b_about",
  "b_map",
  "b_reviews",
  "b_breadcrumbs",
  "b_poweredby",
  "b_numbers",
  "b_trustpilot",
  "b_assortment",
  "b_reliable",
  "b_extended",
  "b_how",
  "b_faq",
  "b_why",
  "b_easybook",
] as const;

export type TransfersTpFlagKey = (typeof TRANSFERS_TP_FLAG_KEYS)[number];

export interface TransfersTravelpayoutsConfig {
  marker: string;
  trs: string;
  locale: string;
  currency: string;
  campaignId: string;
  promoId: string;
  colorScheme: string;
  header: string;
  flags: Record<string, string>;
  embedScript: string;
}

export interface TransfersPublicConfig {
  provider: TransferProvider;
  travelpayouts: TransfersTravelpayoutsConfig;
}

export const TRANSFERS_CONFIG_ENV_KEYS = [
  "NEXT_PUBLIC_TRANSFERS_PROVIDER",
  "NEXT_PUBLIC_TRANSFERS_TP_MARKER",
  "NEXT_PUBLIC_TRANSFERS_TP_TRS",
  "NEXT_PUBLIC_TRANSFERS_TP_LOCALE",
  "NEXT_PUBLIC_TRANSFERS_TP_CURRENCY",
  "NEXT_PUBLIC_TRANSFERS_TP_CAMPAIGN_ID",
  "NEXT_PUBLIC_TRANSFERS_TP_PROMO_ID",
  "NEXT_PUBLIC_TRANSFERS_TP_COLOR_SCHEME",
  "NEXT_PUBLIC_TRANSFERS_TP_HEADER",
  "NEXT_PUBLIC_TRANSFERS_TP_FLAGS",
  "NEXT_PUBLIC_TRANSFERS_TP_SCRIPT",
] as const;

/** Header text from the official Travelpayouts embed (URL-encoded in the script). */
export const TRANSFERS_TP_DEFAULT_HEADER =
  "نوفر لكم أرخص الأسعار لترانسفير المطار في عموم تركيا";

/**
 * Marketing / chrome flags. /transfers shows constructor search + results only.
 * `powered_by` stays on — that is the official Travelpayouts script attribution.
 */
export const TRANSFERS_TP_FORCED_OFF_FLAGS = [
  "b_counter",
  "b_benefit",
  "b_descr",
  "b_about",
  "b_map",
  "b_reviews",
  "b_breadcrumbs",
  "b_poweredby",
  "b_numbers",
  "b_trustpilot",
  "b_assortment",
  "b_reliable",
  "b_extended",
  "b_how",
  "b_faq",
  "b_why",
  "b_easybook",
] as const;

export const TRANSFERS_TP_WIDGET_FLAGS: Record<string, string> = {
  powered_by: "true",
  b_counter: "false",
  b_benefit: "false",
  b_descr: "false",
  b_about: "false",
  b_map: "false",
  b_reviews: "false",
  b_breadcrumbs: "false",
  b_poweredby: "false",
  b_numbers: "false",
  b_trustpilot: "false",
  b_assortment: "false",
  b_reliable: "false",
  b_extended: "false",
  b_how: "false",
  b_faq: "false",
  b_why: "false",
  b_easybook: "false",
};

export const TRANSFERS_TP_DEFAULTS = {
  marker: "324632.324632",
  trs: "489039",
  locale: "en",
  currency: "usd",
  campaignId: "22",
  promoId: "1504",
  colorScheme: "blue",
  header: TRANSFERS_TP_DEFAULT_HEADER,
} as const;

/** shmarker may be partner-only (`324632`) or partner.project (`324632.324632`). */
export function isTransfersTravelpayoutsMarker(value: string): boolean {
  const v = String(value || "").trim();
  return /^\d{4,8}(\.\d{4,8})?$/.test(v);
}

function parseProvider(raw: string | undefined): TransferProvider {
  return raw === "travelpayouts" ? "travelpayouts" : "internal";
}

function forceSearchOnlyFlags(flags: Record<string, string>): Record<string, string> {
  const next = { ...flags };
  for (const key of TRANSFERS_TP_FORCED_OFF_FLAGS) {
    next[key] = "false";
  }
  return next;
}

export function parseTransfersTpFlags(raw: string | undefined): Record<string, string> {
  const defaults = { ...TRANSFERS_TP_WIDGET_FLAGS };
  if (!raw?.trim()) return forceSearchOnlyFlags(defaults);
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return forceSearchOnlyFlags(defaults);
    }
    const next = { ...defaults };
    for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (TRANSFERS_TP_FLAG_KEYS.includes(key as TransfersTpFlagKey)) {
        next[key] = String(value);
      }
    }
    return forceSearchOnlyFlags(next);
  } catch {
    return forceSearchOnlyFlags(defaults);
  }
}

export function serializeTransfersTpFlags(flags: Record<string, string>): string {
  const merged = forceSearchOnlyFlags({
    ...TRANSFERS_TP_WIDGET_FLAGS,
    ...flags,
  });
  const compact: Record<string, string> = {};
  for (const key of TRANSFERS_TP_FLAG_KEYS) {
    compact[key] = merged[key] ?? TRANSFERS_TP_WIDGET_FLAGS[key];
  }
  return JSON.stringify(compact);
}

/** Normalize a pasted script tag / protocol-relative URL to https. */
export function normalizeTransfersScriptUrl(raw: string): string {
  const extracted = extractScriptUrl(raw);
  if (!extracted) return "";
  if (extracted.startsWith("//")) return `https:${extracted}`;
  if (/^https?:\/\//i.test(extracted)) {
    return extracted.replace(/^http:\/\//i, "https://");
  }
  if (extracted.startsWith("tpemb.com/")) return `https://${extracted}`;
  return extracted;
}

export type ParsedTransfersTpEmbed = {
  marker?: string;
  trs?: string;
  locale?: string;
  currency?: string;
  campaignId?: string;
  promoId?: string;
  colorScheme?: string;
  header?: string;
  flags?: Record<string, string>;
  embedScript?: string;
};

/** Parse a pasted tpemb script tag or URL into admin fields. */
export function parseTransfersTpEmbed(raw: string): ParsedTransfersTpEmbed {
  const urlStr = normalizeTransfersScriptUrl(raw);
  if (!urlStr) return {};
  try {
    const url = new URL(urlStr);
    const flags: Record<string, string> = {};
    for (const key of TRANSFERS_TP_FLAG_KEYS) {
      const value = url.searchParams.get(key);
      if (value !== null) flags[key] = value;
    }
    return {
      marker: url.searchParams.get("shmarker") || undefined,
      trs: url.searchParams.get("trs") || undefined,
      locale: url.searchParams.get("locale") || undefined,
      currency:
        url.searchParams.get("currency") ||
        url.searchParams.get("curr") ||
        undefined,
      campaignId: url.searchParams.get("campaign_id") || undefined,
      promoId: url.searchParams.get("promo_id") || undefined,
      colorScheme: url.searchParams.get("color_scheme") || undefined,
      header: url.searchParams.get("header") || undefined,
      flags: Object.keys(flags).length ? flags : undefined,
      embedScript: urlStr,
    };
  } catch {
    return { embedScript: urlStr };
  }
}

function resolvedFlags(config: Partial<TransfersTravelpayoutsConfig>): Record<string, string> {
  return forceSearchOnlyFlags({
    ...TRANSFERS_TP_WIDGET_FLAGS,
    ...config.flags,
  });
}

export function buildTransfersTpScriptUrl(
  config: Pick<
    TransfersTravelpayoutsConfig,
    "marker" | "trs" | "locale" | "campaignId" | "promoId" | "colorScheme"
  > &
    Partial<Pick<TransfersTravelpayoutsConfig, "header" | "flags" | "currency">>
): string {
  const params = new URLSearchParams();
  params.set("trs", config.trs.trim() || TRANSFERS_TP_DEFAULTS.trs);
  params.set("shmarker", config.marker.trim() || TRANSFERS_TP_DEFAULTS.marker);
  params.set("locale", config.locale.trim() || TRANSFERS_TP_DEFAULTS.locale);
  const currency = normalizeTransfersCurrency(
    config.currency || TRANSFERS_TP_DEFAULTS.currency
  );
  params.set("currency", currency);
  params.set("curr", currency);
  const flags = resolvedFlags(config);
  params.set("powered_by", flags.powered_by);
  params.set(
    "color_scheme",
    config.colorScheme.trim() || TRANSFERS_TP_DEFAULTS.colorScheme
  );
  params.set(
    "header",
    (config.header || "").trim() || TRANSFERS_TP_DEFAULT_HEADER
  );
  params.set("b_counter", flags.b_counter);
  params.set("b_benefit", flags.b_benefit);
  params.set("b_descr", flags.b_descr);
  params.set("b_about", flags.b_about);
  params.set("b_map", flags.b_map);
  params.set("b_reviews", flags.b_reviews);
  params.set("b_breadcrumbs", flags.b_breadcrumbs);
  params.set("b_poweredby", flags.b_poweredby);
  params.set("b_numbers", flags.b_numbers);
  params.set("b_trustpilot", flags.b_trustpilot);
  params.set("b_assortment", flags.b_assortment);
  params.set("b_reliable", flags.b_reliable);
  params.set("b_extended", flags.b_extended);
  params.set("b_how", flags.b_how);
  params.set("b_faq", flags.b_faq);
  params.set("b_why", flags.b_why);
  params.set("b_easybook", flags.b_easybook);
  params.set(
    "campaign_id",
    config.campaignId.trim() || TRANSFERS_TP_DEFAULTS.campaignId
  );
  params.set("promo_id", config.promoId.trim() || TRANSFERS_TP_DEFAULTS.promoId);
  return `https://tpemb.com/content?${params.toString()}`;
}

export const TRANSFERS_TP_DEFAULT_SCRIPT = buildTransfersTpScriptUrl({
  marker: TRANSFERS_TP_DEFAULTS.marker,
  trs: TRANSFERS_TP_DEFAULTS.trs,
  locale: TRANSFERS_TP_DEFAULTS.locale,
  campaignId: TRANSFERS_TP_DEFAULTS.campaignId,
  promoId: TRANSFERS_TP_DEFAULTS.promoId,
  colorScheme: TRANSFERS_TP_DEFAULTS.colorScheme,
  header: TRANSFERS_TP_DEFAULTS.header,
  flags: TRANSFERS_TP_WIDGET_FLAGS,
});

export type TransfersSearchQuery = {
  from?: string;
  to?: string;
  date?: string;
  time?: string;
  guests?: string;
};

function applyTransfersSearchQuery(
  rawUrl: string,
  query: TransfersSearchQuery
): string {
  if (!rawUrl) return rawUrl;
  const hasQuery =
    query.from || query.to || query.date || query.time || query.guests;
  if (!hasQuery) return rawUrl;
  try {
    const url = new URL(rawUrl);
    if (query.from) {
      url.searchParams.set("from", query.from);
      url.searchParams.set("pickup", query.from);
      url.searchParams.set("fn", query.from);
    }
    if (query.to) {
      url.searchParams.set("to", query.to);
      url.searchParams.set("dropoff", query.to);
      url.searchParams.set("tn", query.to);
    }
    if (query.date) url.searchParams.set("date", query.date);
    if (query.time) url.searchParams.set("time", query.time);
    if (query.guests) {
      url.searchParams.set("passengers", query.guests);
      url.searchParams.set("pax", query.guests);
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
}

/** Overlay admin-editable fields onto a tpemb URL (pasted or generated). */
export function applyTransfersFieldsToScriptUrl(
  rawUrl: string,
  config: TransfersTravelpayoutsConfig
): string {
  const httpsUrl = forceHttpsTpembUrl(rawUrl);
  if (!httpsUrl) return "";
  try {
    const url = new URL(httpsUrl);
    url.searchParams.set(
      "trs",
      config.trs.trim() || TRANSFERS_TP_DEFAULTS.trs
    );
    url.searchParams.set(
      "shmarker",
      config.marker.trim() || TRANSFERS_TP_DEFAULTS.marker
    );
    url.searchParams.set(
      "locale",
      config.locale.trim() || TRANSFERS_TP_DEFAULTS.locale
    );
    applyTpembCurrencyParams(
      url,
      config.currency || TRANSFERS_TP_DEFAULTS.currency
    );
    url.searchParams.set(
      "color_scheme",
      config.colorScheme.trim() || TRANSFERS_TP_DEFAULTS.colorScheme
    );
    url.searchParams.set(
      "header",
      config.header.trim() || TRANSFERS_TP_DEFAULT_HEADER
    );
    url.searchParams.set(
      "campaign_id",
      config.campaignId.trim() || TRANSFERS_TP_DEFAULTS.campaignId
    );
    url.searchParams.set(
      "promo_id",
      config.promoId.trim() || TRANSFERS_TP_DEFAULTS.promoId
    );
    const flags = resolvedFlags(config);
    for (const key of TRANSFERS_TP_FLAG_KEYS) {
      url.searchParams.set(key, flags[key] ?? TRANSFERS_TP_WIDGET_FLAGS[key]);
    }
    return url.toString();
  } catch {
    return httpsUrl;
  }
}

export function resolveTransfersTpScriptUrl(
  config: TransfersTravelpayoutsConfig,
  query: TransfersSearchQuery = {}
): string {
  const override = normalizeTransfersScriptUrl(config.embedScript);
  const base =
    override ||
    (config.marker.trim() && config.trs.trim()
      ? buildTransfersTpScriptUrl(config)
      : "");
  if (!base) return "";
  return applyTransfersSearchQuery(
    applyTransfersFieldsToScriptUrl(base, config),
    query
  );
}

export function buildTransfersConfigFromMap(
  map: Record<string, string>
): TransfersPublicConfig {
  return {
    provider: parseProvider(map.NEXT_PUBLIC_TRANSFERS_PROVIDER),
    travelpayouts: {
      marker:
        map.NEXT_PUBLIC_TRANSFERS_TP_MARKER || TRANSFERS_TP_DEFAULTS.marker,
      trs: map.NEXT_PUBLIC_TRANSFERS_TP_TRS || TRANSFERS_TP_DEFAULTS.trs,
      locale:
        map.NEXT_PUBLIC_TRANSFERS_TP_LOCALE || TRANSFERS_TP_DEFAULTS.locale,
      currency: normalizeTransfersCurrency(
        map.NEXT_PUBLIC_TRANSFERS_TP_CURRENCY || TRANSFERS_TP_DEFAULTS.currency
      ),
      campaignId:
        map.NEXT_PUBLIC_TRANSFERS_TP_CAMPAIGN_ID ||
        TRANSFERS_TP_DEFAULTS.campaignId,
      promoId:
        map.NEXT_PUBLIC_TRANSFERS_TP_PROMO_ID || TRANSFERS_TP_DEFAULTS.promoId,
      colorScheme:
        map.NEXT_PUBLIC_TRANSFERS_TP_COLOR_SCHEME ||
        TRANSFERS_TP_DEFAULTS.colorScheme,
      header:
        map.NEXT_PUBLIC_TRANSFERS_TP_HEADER || TRANSFERS_TP_DEFAULT_HEADER,
      flags: parseTransfersTpFlags(map.NEXT_PUBLIC_TRANSFERS_TP_FLAGS),
      embedScript:
        map.NEXT_PUBLIC_TRANSFERS_TP_SCRIPT || TRANSFERS_TP_DEFAULT_SCRIPT,
    },
  };
}

/** Client/build-time fallback from process.env. */
export function getTransfersConfigFromEnv(): TransfersPublicConfig {
  const map: Record<string, string> = {};
  for (const key of TRANSFERS_CONFIG_ENV_KEYS) {
    const val = process.env[key];
    if (val) map[key] = val;
  }
  return buildTransfersConfigFromMap(map);
}

export function isTransfersTravelpayoutsReady(
  config: TransfersTravelpayoutsConfig
): boolean {
  const marker = config.marker.trim();
  const trs = config.trs.trim();

  if (!marker || !trs) return false;
  if (!isTransfersTravelpayoutsMarker(marker)) return false;
  if (!isNumericTravelpayoutsId(trs)) return false;
  if (isTravelpayoutsPlaceholder(trs, "trs")) return false;

  const url = resolveTransfersTpScriptUrl(config);
  return Boolean(url);
}

export function validateTransfersTravelpayoutsFields(config: {
  marker: string;
  trs: string;
  embedScript?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const marker = config.marker.trim();
  const trs = config.trs.trim();

  if (!marker || !isTransfersTravelpayoutsMarker(marker)) {
    errors.push("marker");
  }
  if (
    !trs ||
    !isNumericTravelpayoutsId(trs) ||
    isTravelpayoutsPlaceholder(trs, "trs")
  ) {
    errors.push("trs");
  }

  const override = normalizeTransfersScriptUrl(config.embedScript || "");
  if (override && isTravelpayoutsPlaceholder(override, "embed")) {
    errors.push("embedScript");
  }

  return { valid: errors.length === 0, errors };
}
