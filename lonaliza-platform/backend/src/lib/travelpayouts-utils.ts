/**
 * Travelpayouts white-label helpers — flightSearch deep links and the
 * official Page-type host (search.lonaliza.com).
 *
 * DNS must stay: search.lonaliza.com CNAME whitelabel.travelpayouts.com
 * (grey cloud). Do not replace that CNAME with an A record to this box.
 * SSL cannot be issued here while CNAME points at Travelpayouts (HTTP-01
 * would hit AWS). Certificate must come from Travelpayouts for the custom
 * host, or a Cloudflare orange-cloud wrap with encryption Full (not Full
 * Strict). Do not switch the zone to Flexible — that would weaken lonaliza.com.
 */

/** Official WL Page origin. Leave CNAME on Travelpayouts; do not host this subdomain here. */
export const TRAVELPAYOUTS_WHITE_LABEL_ORIGIN = "https://search.lonaliza.com";

/**
 * Same-origin nginx proxy of the WL Page (`/tpwl/` → whitelabel.travelpayouts.com
 * with Host: search.lonaliza.com). Used as the /flights iframe src so we can
 * read iframe.contentDocument.scrollHeight. Do not change the search CNAME.
 */
export const TRAVELPAYOUTS_WHITE_LABEL_PROXY_PATH = "/tpwl/";

export type TravelpayoutsFieldValues = {
  marker: string;
  trs: string;
  domain: string;
  widgetDomain: string;
  embedScript: string;
  cookiePolicyScript: string;
  locale?: string;
  currency?: string;
};

export type TravelpayoutsEmbedConfig = {
  marker: string;
  trs: string;
  domain: string;
  widgetDomain: string;
  locale?: string;
  currency?: string;
  embedScript?: string;
  linkColor?: string;
};

const NUMERIC_ID_PATTERN = /^\d{4,8}$/;

/** Travelpayouts partner / project IDs are numeric (e.g. 339296, 71760). */
export function isNumericTravelpayoutsId(value: string): boolean {
  return NUMERIC_ID_PATTERN.test(String(value || "").trim());
}

const PLACEHOLDER_LITERALS = new Set([
  "shmarker",
  "marker",
  "trs",
  "[:embed_script:]",
  "[:cookie_policy_script:]",
  "[:widget_domain:]",
  "[:domain:]",
  "target_host",
  "https://...",
  "https://",
]);

/** Extract `src` from a pasted script tag or return a bare URL. */
export function extractScriptUrl(raw: string): string {
  const trimmed = String(raw || "").trim();
  if (!trimmed) return "";

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const srcMatch = trimmed.match(/src\s*=\s*["']([^"']+)["']/i);
  if (srcMatch?.[1]) {
    return srcMatch[1].trim();
  }

  return trimmed;
}

/** True when a value looks like a template placeholder, not a real dashboard value. */
export function isTravelpayoutsPlaceholder(
  value: string,
  field?: "marker" | "trs" | "embed" | "domain" | "widgetDomain"
): boolean {
  const v = String(value || "").trim();
  if (!v) return true;

  const lower = v.toLowerCase();
  if (PLACEHOLDER_LITERALS.has(lower)) return true;
  if (lower.includes("[:") && lower.includes(":]")) return true;

  if (field === "marker") {
    if (lower === "shmarker" || lower === "marker") return true;
    return !isNumericTravelpayoutsId(v);
  }

  if (field === "trs") {
    if (lower === "trs") return true;
    return !isNumericTravelpayoutsId(v);
  }

  if (field === "embed") {
    if (!/^https?:\/\//i.test(v) && !v.includes("createElement")) return true;
  }

  return false;
}

export type TravelpayoutsValidation = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

export function validateTravelpayoutsFields(
  values: TravelpayoutsFieldValues
): TravelpayoutsValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const marker = values.marker.trim();
  const trs = values.trs.trim();
  const domain = values.domain.trim();
  const embedRaw = values.embedScript.trim();

  if (!marker) {
    errors.push("marker_missing");
  } else if (isTravelpayoutsPlaceholder(marker, "marker")) {
    errors.push("marker_invalid");
  }

  if (!trs) {
    errors.push("trs_missing");
  } else if (isTravelpayoutsPlaceholder(trs, "trs")) {
    errors.push("trs_invalid");
  }

  if (!domain) {
    errors.push("domain_missing");
  }

  const embedUrl = extractScriptUrl(embedRaw);
  if (embedRaw && (!embedUrl || isTravelpayoutsPlaceholder(embedUrl, "embed"))) {
    errors.push("embed_invalid");
  }

  if (
    values.cookiePolicyScript.trim() &&
    isTravelpayoutsPlaceholder(extractScriptUrl(values.cookiePolicyScript), "embed")
  ) {
    warnings.push("cookie_placeholder");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function normalizeWidgetDomain(widgetDomain: string): string {
  return String(widgetDomain || "wl.aviasales.com")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");
}

function normalizeTargetHost(domain: string): string {
  return String(domain || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");
}

/** Aviasales/Kayak widget hosted on tp.media (self-injects at the script tag). */
export function buildTravelpayoutsMediaWidgetUrl(
  config: TravelpayoutsEmbedConfig,
  promoId: string,
  extra?: Record<string, string>
): string {
  const marker = config.marker.trim();
  const trs = config.trs.trim();
  if (!isNumericTravelpayoutsId(marker) || !isNumericTravelpayoutsId(trs)) {
    return "";
  }

  const params = new URLSearchParams({
    currency: (config.currency || "usd").trim().toLowerCase(),
    trs,
    shmarker: marker,
    locale: (config.locale || "ar").trim(),
    promo_id: promoId,
    campaign_id: "100",
    powered_by: "false",
  });

  const primary = config.linkColor?.trim().replace(/^#/, "");
  if (primary) params.set("primary", `#${primary}`);

  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value) params.set(key, value);
    }
  }

  return `https://tp.media/content?${params.toString()}`;
}

/** Build the standard WL embed script URL from dashboard IDs (no HTML paste needed). */
export function buildTravelpayoutsEmbedScriptUrl(
  config: TravelpayoutsEmbedConfig
): string {
  const marker = config.marker.trim();
  const trs = config.trs.trim();
  const domain = normalizeTargetHost(config.domain);
  const widgetDomain = normalizeWidgetDomain(config.widgetDomain);

  if (!isNumericTravelpayoutsId(marker) || !isNumericTravelpayoutsId(trs) || !domain) {
    return "";
  }

  const params = new URLSearchParams({
    shmarker: marker,
    trs,
    target_host: domain,
  });

  const locale = config.locale?.trim();
  const currency = config.currency?.trim();
  if (locale) params.set("locale", locale);
  if (currency) params.set("currency", currency);

  return `https://${widgetDomain}/embed/script.js?${params.toString()}`;
}

/** Use admin override when set; otherwise auto-generate from marker + trs + domain. */
export function resolveTravelpayoutsEmbedUrl(config: TravelpayoutsEmbedConfig): string {
  const override = extractScriptUrl(config.embedScript || "");
  if (override && !isTravelpayoutsPlaceholder(override, "embed")) {
    return override;
  }
  return buildTravelpayoutsEmbedScriptUrl(config);
}

/** Pull IATA code from text like "Istanbul (IST)" or bare "IST". */
export function extractIataCode(text: string): string | null {
  const trimmed = String(text || "").trim();
  if (!trimmed) return null;

  const parens = trimmed.match(/\(([A-Za-z]{3})\)\s*$/);
  if (parens?.[1]) return parens[1].toUpperCase();

  if (/^[A-Za-z]{3}$/.test(trimmed)) return trimmed.toUpperCase();

  const words = trimmed.split(/\s+/);
  const last = words[words.length - 1];
  if (/^[A-Za-z]{3}$/.test(last)) return last.toUpperCase();

  return null;
}

export type FlightSearchQuery = {
  from?: string;
  to?: string;
  date?: string;
  returnDate?: string;
  guests?: string;
  flightType?: string;
  class?: string;
  flightSearch?: string;
  locale?: string;
};

/** Local calendar date `days` from now as `yyyy-mm-dd` (not a hardcoded date). */
export function isoDatePlusDays(days: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Homepage → `/flights` query string the flights page already understands.
 * Outbound is always today + 7 days at click time. One-way unless a return
 * offset is passed (then return = outbound + extra days).
 */
export function buildFlightsPageHref(input: {
  fromIata: string;
  toIata: string;
  guests?: string;
  cabinClass?: string;
  flightType?: "one-way" | "round-trip";
  returnOffsetDays?: number;
  /** yyyy-mm-dd. Defaults to today + 7 when omitted or invalid. */
  date?: string;
  returnDate?: string;
}): string {
  const date =
    input.date && /^\d{4}-\d{2}-\d{2}$/.test(input.date)
      ? input.date
      : isoDatePlusDays(7);
  const flightType = input.flightType ?? "one-way";
  const guests = input.guests || "1";
  const cabinClass = input.cabinClass || "economy";
  const returnDate =
    flightType === "round-trip"
      ? input.returnDate && /^\d{4}-\d{2}-\d{2}$/.test(input.returnDate)
        ? input.returnDate
        : isoDatePlusDays(7 + (input.returnOffsetDays ?? 7))
      : undefined;

  const query: FlightSearchQuery = {
    from: input.fromIata,
    to: input.toIata,
    date,
    returnDate,
    guests,
    flightType,
    class: cabinClass,
  };
  const flightSearch = buildFlightSearchParam(query);

  const params = new URLSearchParams();
  params.set("from", input.fromIata);
  params.set("to", input.toIata);
  params.set("date", date);
  if (returnDate) params.set("returnDate", returnDate);
  params.set("guests", guests);
  params.set("flightType", flightType);
  params.set("class", cabinClass);
  if (flightSearch) params.set("flightSearch", flightSearch);
  return `/flights?${params.toString()}`;
}

/** Convert yyyy-mm-dd → DDMM for Travelpayouts flightSearch strings. */
export function formatTpwlDate(isoDate: string): string | null {
  const m = String(isoDate || "").trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return `${m[3]}${m[2]}`;
}

function cabinClassLetter(className: string): string {
  const c = String(className || "").toLowerCase();
  if (c === "business") return "c";
  if (c === "premium" || c === "comfort") return "w";
  if (c === "first") return "f";
  return "";
}

/**
 * Build Travelpayouts `flightSearch` param from site query params.
 * Format: ORIGIN_DDMM_DEST_DDMM[class][adults][children][infants]
 */
export function buildFlightSearchParam(query: FlightSearchQuery): string | null {
  if (query.flightSearch?.trim()) {
    return query.flightSearch.trim();
  }

  const origin = extractIataCode(query.from || "");
  const destination = extractIataCode(query.to || "");
  const depart = formatTpwlDate(query.date || "");
  const adults = Math.min(9, Math.max(1, parseInt(query.guests || "1", 10) || 1));

  if (!origin || !destination || !depart) return null;

  let code = `${origin}${depart}${destination}`;

  const isRoundTrip =
    query.flightType !== "one-way" && query.flightType !== "multi-city";
  if (isRoundTrip && query.returnDate) {
    const ret = formatTpwlDate(query.returnDate);
    if (ret) code += ret;
  }

  code += cabinClassLetter(query.class || "");
  code += String(adults);

  return code;
}

/** iframe / deep-link URL for the live WL Page via same-origin `/tpwl/` proxy. */
export function buildWhiteLabelPageUrl(query: FlightSearchQuery = {}): string {
  const url = new URL(TRAVELPAYOUTS_WHITE_LABEL_PROXY_PATH, TRAVELPAYOUTS_WHITE_LABEL_ORIGIN);
  const locale = (query.locale || "ar").trim() || "ar";
  url.searchParams.set("locale", locale);
  url.searchParams.set("lang", locale);
  const flightSearch = buildFlightSearchParam(query);
  if (flightSearch) {
    url.searchParams.set("flightSearch", flightSearch);
  }
  return `${url.pathname}${url.search}`;
}

export function resolveEmbedScript(raw: string): {
  mode: "url" | "inline";
  url?: string;
  inline?: string;
} {
  const trimmed = String(raw || "").trim();
  if (!trimmed) return { mode: "url" };

  const url = extractScriptUrl(trimmed);
  if (/^https?:\/\//i.test(url) && url === trimmed.replace(/^<script[^>]*>/i, "").replace(/<\/script>$/i, "").trim()) {
    return { mode: "url", url };
  }

  if (/^https?:\/\//i.test(url) && !trimmed.includes("createElement")) {
    return { mode: "url", url };
  }

  if (trimmed.includes("createElement") || trimmed.includes("TPWL")) {
    const cleaned = trimmed
      .replace(/<\/?script[^>]*>/gi, "")
      .trim();
    return { mode: "inline", inline: cleaned };
  }

  if (/^https?:\/\//i.test(url)) {
    return { mode: "url", url };
  }

  return { mode: "url", url: url || trimmed };
}
