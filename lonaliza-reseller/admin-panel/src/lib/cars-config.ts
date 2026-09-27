/**
 * Cars provider config — env fallbacks + server store overlay via /api/cars-config.
 * Travelpayouts car-rental widget (tpemb.com/content, promo 2466).
 */

import {
  extractScriptUrl,
  isNumericTravelpayoutsId,
  isTravelpayoutsPlaceholder,
} from "@/lib/travelpayouts-utils";
import { applyTpembCurrencyParams, forceTpembLocale } from "@/lib/tpemb-embed";

export type CarProvider = "internal" | "travelpayouts";

export interface CarsTravelpayoutsConfig {
  marker: string;
  trs: string;
  locale: string;
  country: string;
  city: string;
  campaignId: string;
  promoId: string;
  embedScript: string;
}

export interface CarsPublicConfig {
  provider: CarProvider;
  travelpayouts: CarsTravelpayoutsConfig;
}

export const CARS_CONFIG_ENV_KEYS = [
  "NEXT_PUBLIC_CARS_PROVIDER",
  "NEXT_PUBLIC_CARS_TP_MARKER",
  "NEXT_PUBLIC_CARS_TP_TRS",
  "NEXT_PUBLIC_CARS_TP_LOCALE",
  "NEXT_PUBLIC_CARS_TP_COUNTRY",
  "NEXT_PUBLIC_CARS_TP_CITY",
  "NEXT_PUBLIC_CARS_TP_CAMPAIGN_ID",
  "NEXT_PUBLIC_CARS_TP_PROMO_ID",
  "NEXT_PUBLIC_CARS_TP_SCRIPT",
] as const;

export const CARS_TP_DEFAULTS = {
  marker: "324632.566091",
  trs: "489039",
  locale: "ar",
  country: "109",
  city: "65991",
  campaignId: "87",
  promoId: "2466",
} as const;

/** Official embed flags from the Travelpayouts cars script (promo 2466). */
export const CARS_TP_WIDGET_FLAGS: Record<string, string> = {
  powered_by: "true",
};

export type CarsSearchQuery = {
  location?: string;
  date?: string;
  returnDate?: string;
  country?: string;
  city?: string;
  guests?: string;
};

/**
 * Travelpayouts car-details is an in-widget modal that pushStates `lr_*`
 * (and leftover `currency`/`curr`) onto the parent URL. Those keys are
 * widget-owned — they must not re-bootstrap the embed.
 */
export function isCarsWidgetOwnedParam(key: string): boolean {
  const k = key.trim().toLowerCase();
  return k.startsWith("lr_") || k === "currency" || k === "curr";
}

/** Stable key of real search fields only (pickup/dates). Ignores lr_*. */
export function carsSearchBootstrapKey(query: CarsSearchQuery): string {
  return [
    query.location ?? "",
    query.date ?? "",
    query.returnDate ?? "",
    query.country ?? "",
    query.city ?? "",
    query.guests ?? "",
  ].join("\0");
}

/** shmarker may be partner-only (`324632`) or partner.project (`324632.566091`). */
export function isCarsTravelpayoutsMarker(value: string): boolean {
  const v = String(value || "").trim();
  return /^\d{4,8}(\.\d{4,8})?$/.test(v);
}

function parseProvider(raw: string | undefined): CarProvider {
  return raw === "internal" ? "internal" : "travelpayouts";
}

export function normalizeCarsScriptUrl(raw: string): string {
  const extracted = extractScriptUrl(raw);
  if (!extracted) return "";
  if (extracted.startsWith("//")) return `https:${extracted}`;
  if (/^https?:\/\//i.test(extracted)) {
    return extracted.replace(/^http:\/\//i, "https://");
  }
  if (extracted.startsWith("tpemb.com/")) return `https://${extracted}`;
  return extracted;
}

export function buildCarsTpScriptUrl(
  config: Pick<
    CarsTravelpayoutsConfig,
    "marker" | "trs" | "locale" | "country" | "city" | "campaignId" | "promoId"
  >,
  query: CarsSearchQuery = {}
): string {
  const params = new URLSearchParams();
  params.set("trs", config.trs.trim() || CARS_TP_DEFAULTS.trs);
  params.set("shmarker", config.marker.trim() || CARS_TP_DEFAULTS.marker);
  params.set("locale", config.locale.trim() || CARS_TP_DEFAULTS.locale);
  params.set(
    "country",
    (query.country || config.country).trim() || CARS_TP_DEFAULTS.country
  );
  params.set("city", (query.city || config.city).trim() || CARS_TP_DEFAULTS.city);
  params.set("powered_by", CARS_TP_WIDGET_FLAGS.powered_by);
  params.set("currency", "usd");
  params.set("curr", "usd");
  params.set(
    "campaign_id",
    config.campaignId.trim() || CARS_TP_DEFAULTS.campaignId
  );
  params.set("promo_id", config.promoId.trim() || CARS_TP_DEFAULTS.promoId);

  if (query.date) params.set("date", query.date);
  if (query.returnDate) params.set("returnDate", query.returnDate);
  if (query.location) params.set("location", query.location);
  if (query.guests) params.set("passengers", query.guests);

  return `https://tpemb.com/content?${params.toString()}`;
}

export function resolveCarsTpScriptUrl(
  config: CarsTravelpayoutsConfig,
  query: CarsSearchQuery = {}
): string {
  const locale = config.locale.trim() || CARS_TP_DEFAULTS.locale;
  const override = normalizeCarsScriptUrl(config.embedScript);
  if (override) {
    try {
      const url = new URL(override);
      if (query.country) url.searchParams.set("country", query.country);
      if (query.city) url.searchParams.set("city", query.city);
      if (query.date) url.searchParams.set("date", query.date);
      if (query.returnDate) url.searchParams.set("returnDate", query.returnDate);
      if (query.location) url.searchParams.set("location", query.location);
      if (query.guests) url.searchParams.set("passengers", query.guests);
      applyTpembCurrencyParams(url, "usd");
      return forceTpembLocale(url.toString(), locale);
    } catch {
      return forceTpembLocale(override, locale);
    }
  }
  if (!config.marker.trim() || !config.trs.trim()) return "";
  return forceTpembLocale(buildCarsTpScriptUrl(config, query), locale);
}

export function buildCarsConfigFromMap(
  map: Record<string, string>
): CarsPublicConfig {
  return {
    provider: parseProvider(map.NEXT_PUBLIC_CARS_PROVIDER),
    travelpayouts: {
      marker: map.NEXT_PUBLIC_CARS_TP_MARKER || CARS_TP_DEFAULTS.marker,
      trs: map.NEXT_PUBLIC_CARS_TP_TRS || CARS_TP_DEFAULTS.trs,
      locale: map.NEXT_PUBLIC_CARS_TP_LOCALE || CARS_TP_DEFAULTS.locale,
      country: map.NEXT_PUBLIC_CARS_TP_COUNTRY || CARS_TP_DEFAULTS.country,
      city: map.NEXT_PUBLIC_CARS_TP_CITY || CARS_TP_DEFAULTS.city,
      campaignId:
        map.NEXT_PUBLIC_CARS_TP_CAMPAIGN_ID || CARS_TP_DEFAULTS.campaignId,
      promoId: map.NEXT_PUBLIC_CARS_TP_PROMO_ID || CARS_TP_DEFAULTS.promoId,
      embedScript: map.NEXT_PUBLIC_CARS_TP_SCRIPT || "",
    },
  };
}

export function getCarsConfigFromEnv(): CarsPublicConfig {
  const map: Record<string, string> = {};
  for (const key of CARS_CONFIG_ENV_KEYS) {
    const val = process.env[key];
    if (val) map[key] = val;
  }
  return buildCarsConfigFromMap(map);
}

export function isCarsTravelpayoutsReady(
  config: CarsTravelpayoutsConfig
): boolean {
  const marker = config.marker.trim();
  const trs = config.trs.trim();

  if (!marker || !trs) return false;
  if (!isCarsTravelpayoutsMarker(marker)) return false;
  if (!isNumericTravelpayoutsId(trs)) return false;
  if (isTravelpayoutsPlaceholder(marker, "marker") && !marker.includes(".")) {
    return false;
  }
  if (isTravelpayoutsPlaceholder(trs, "trs")) return false;

  return Boolean(resolveCarsTpScriptUrl(config));
}

export function validateCarsTravelpayoutsFields(config: {
  marker: string;
  trs: string;
  embedScript?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const marker = config.marker.trim();
  const trs = config.trs.trim();

  if (!marker || !isCarsTravelpayoutsMarker(marker)) {
    errors.push("marker");
  }
  if (
    !trs ||
    !isNumericTravelpayoutsId(trs) ||
    isTravelpayoutsPlaceholder(trs, "trs")
  ) {
    errors.push("trs");
  }

  const override = normalizeCarsScriptUrl(config.embedScript || "");
  if (override && isTravelpayoutsPlaceholder(override, "embed")) {
    errors.push("embedScript");
  }

  return { valid: errors.length === 0, errors };
}
