/**
 * Production tracking / SEO integrations.
 * Values come from process.env and/or the server env store (via getIntegrationsFromValues).
 */

import type { SiteIntegrations } from "@/types/site-integrations";

export const PLATFORM_DASHBOARD_URLS = {
  googleSearchConsole: "https://search.google.com/search-console",
  googleAds: "https://ads.google.com",
  googleAnalytics: "https://analytics.google.com",
  googleTagManager: "https://tagmanager.google.com",
  facebookEventsManager: "https://business.facebook.com/events_manager",
  facebookEventsManagerAlt: "https://www.facebook.com/events_manager",
  tiktokEventsManager: "https://ads.tiktok.com/i18n/events_manager",
} as const;

/** Strip to safe ID tokens: letters, digits, hyphen, underscore */
export function sanitizeTrackingId(raw: string, maxLen = 64): string {
  return String(raw || "")
    .trim()
    .replace(/[^A-Za-z0-9_-]/g, "")
    .slice(0, maxLen);
}

/**
 * Extract google-site-verification content from a raw paste
 * (token only or full `<meta …>` tag).
 */
export function extractGoogleSiteVerification(raw: string): string {
  const trimmed = String(raw || "").trim();
  if (!trimmed) return "";
  const metaMatch = trimmed.match(/content\s*=\s*["']([^"']+)["']/i);
  const value = metaMatch?.[1] ?? trimmed;
  return value.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 128);
}

function flagFromValue(v: string | undefined): boolean | undefined {
  const raw = (v || "").trim().toLowerCase();
  if (!raw) return undefined;
  if (raw === "true" || raw === "1" || raw === "yes") return true;
  if (raw === "false" || raw === "0" || raw === "no") return false;
  return undefined;
}

function enabledByIdOrFlag(
  id: string,
  flagValue: string | undefined,
  idLooksValid: boolean
): boolean {
  const flag = flagFromValue(flagValue);
  if (flag === false) return false;
  if (flag === true) return idLooksValid;
  return idLooksValid;
}

function readFrom(
  values: Record<string, string | undefined> | undefined,
  name: string
): string {
  if (values && values[name] !== undefined) {
    return String(values[name] || "").trim();
  }
  return (process.env[name] || "").trim();
}

/** Build SiteIntegrations from an explicit map (server store / API) or process.env. */
export function getIntegrationsFromValues(
  values?: Record<string, string | undefined>
): SiteIntegrations {
  const gscRaw = readFrom(values, "NEXT_PUBLIC_GSC_VERIFICATION");
  const gscMeta = extractGoogleSiteVerification(gscRaw);
  const gaId = sanitizeTrackingId(readFrom(values, "NEXT_PUBLIC_GA_ID"), 32);
  const gtmId = sanitizeTrackingId(readFrom(values, "NEXT_PUBLIC_GTM_ID"), 32);
  const adsId = sanitizeTrackingId(
    readFrom(values, "NEXT_PUBLIC_GOOGLE_ADS_ID"),
    32
  );
  const adsLabel = sanitizeTrackingId(
    readFrom(values, "NEXT_PUBLIC_GOOGLE_ADS_LABEL"),
    64
  );
  const fbId = sanitizeTrackingId(
    readFrom(values, "NEXT_PUBLIC_META_PIXEL_ID"),
    32
  );
  const ttId = sanitizeTrackingId(
    readFrom(values, "NEXT_PUBLIC_TIKTOK_PIXEL_ID"),
    64
  );

  return {
    googleSearchConsole: {
      enabled: enabledByIdOrFlag(
        gscMeta,
        readFrom(values, "NEXT_PUBLIC_GSC_ENABLED"),
        gscMeta.length > 0
      ),
      verificationMeta: gscMeta,
      propertyUrl: readFrom(values, "NEXT_PUBLIC_SITE_URL").slice(0, 500),
    },
    googleAnalytics: {
      enabled: enabledByIdOrFlag(
        gaId,
        readFrom(values, "NEXT_PUBLIC_GA_ENABLED"),
        /^G-[A-Z0-9]+$/i.test(gaId)
      ),
      measurementId: gaId,
    },
    googleTagManager: {
      enabled: enabledByIdOrFlag(
        gtmId,
        readFrom(values, "NEXT_PUBLIC_GTM_ENABLED"),
        /^GTM-[A-Z0-9]+$/i.test(gtmId)
      ),
      containerId: gtmId,
    },
    googleAds: {
      enabled: enabledByIdOrFlag(
        adsId,
        readFrom(values, "NEXT_PUBLIC_GOOGLE_ADS_ENABLED"),
        /^AW-[0-9]+$/i.test(adsId)
      ),
      conversionId: adsId,
      conversionLabel: adsLabel,
    },
    facebookPixel: {
      enabled: enabledByIdOrFlag(
        fbId,
        readFrom(values, "NEXT_PUBLIC_META_PIXEL_ENABLED"),
        /^\d{5,20}$/.test(fbId)
      ),
      pixelId: fbId,
    },
    tiktokPixel: {
      enabled: enabledByIdOrFlag(
        ttId,
        readFrom(values, "NEXT_PUBLIC_TIKTOK_PIXEL_ENABLED"),
        /^[A-Z0-9]{10,64}$/i.test(ttId)
      ),
      pixelId: ttId,
    },
  };
}

/** Build SiteIntegrations from process.env (client bundle / fallback). */
export function getIntegrationsFromEnv(): SiteIntegrations {
  return getIntegrationsFromValues();
}

export function shouldLoadGtag(i: SiteIntegrations): boolean {
  const gaOk =
    i.googleAnalytics.enabled &&
    /^G-[A-Z0-9]+$/i.test(i.googleAnalytics.measurementId);
  const adsOk =
    i.googleAds.enabled && /^AW-[0-9]+$/i.test(i.googleAds.conversionId);
  return gaOk || adsOk;
}

export function shouldLoadGtm(i: SiteIntegrations): boolean {
  return (
    i.googleTagManager.enabled &&
    /^GTM-[A-Z0-9]+$/i.test(i.googleTagManager.containerId)
  );
}

export function shouldLoadFacebookPixel(i: SiteIntegrations): boolean {
  return i.facebookPixel.enabled && /^\d{5,20}$/.test(i.facebookPixel.pixelId);
}

export function shouldLoadTikTokPixel(i: SiteIntegrations): boolean {
  return (
    i.tiktokPixel.enabled &&
    /^[A-Z0-9]{10,64}$/i.test(i.tiktokPixel.pixelId)
  );
}

export function getGscVerificationContent(i: SiteIntegrations): string {
  if (!i.googleSearchConsole.enabled) return "";
  return extractGoogleSiteVerification(i.googleSearchConsole.verificationMeta);
}

/** Mask a secret/ID for admin display (keep first/last few chars). */
export function maskValue(value: string, visible = 4): string {
  const v = String(value || "").trim();
  if (!v) return "";
  if (v.length <= visible * 2) return "•".repeat(Math.min(v.length, 8));
  return `${v.slice(0, visible)}…${v.slice(-visible)}`;
}

export type IntegrationStatusRow = {
  key: string;
  title: string;
  envVar: string;
  configured: boolean;
  enabled: boolean;
  maskedValue: string;
  dashboardUrl: string;
  helpEnvVars: string[];
};

export function getIntegrationStatusRows(
  i: SiteIntegrations = getIntegrationsFromEnv()
): IntegrationStatusRow[] {
  return [
    {
      key: "gsc",
      title: "Google Search Console",
      envVar: "NEXT_PUBLIC_GSC_VERIFICATION",
      configured: Boolean(i.googleSearchConsole.verificationMeta),
      enabled: i.googleSearchConsole.enabled,
      maskedValue: maskValue(i.googleSearchConsole.verificationMeta, 6),
      dashboardUrl: PLATFORM_DASHBOARD_URLS.googleSearchConsole,
      helpEnvVars: ["NEXT_PUBLIC_GSC_VERIFICATION", "NEXT_PUBLIC_GSC_ENABLED"],
    },
    {
      key: "ga",
      title: "Google Analytics (GA4)",
      envVar: "NEXT_PUBLIC_GA_ID",
      configured: Boolean(i.googleAnalytics.measurementId),
      enabled: i.googleAnalytics.enabled,
      maskedValue: maskValue(i.googleAnalytics.measurementId),
      dashboardUrl: PLATFORM_DASHBOARD_URLS.googleAnalytics,
      helpEnvVars: ["NEXT_PUBLIC_GA_ID", "NEXT_PUBLIC_GA_ENABLED"],
    },
    {
      key: "gtm",
      title: "Google Tag Manager",
      envVar: "NEXT_PUBLIC_GTM_ID",
      configured: Boolean(i.googleTagManager.containerId),
      enabled: i.googleTagManager.enabled,
      maskedValue: maskValue(i.googleTagManager.containerId),
      dashboardUrl: PLATFORM_DASHBOARD_URLS.googleTagManager,
      helpEnvVars: ["NEXT_PUBLIC_GTM_ID", "NEXT_PUBLIC_GTM_ENABLED"],
    },
    {
      key: "ads",
      title: "Google Ads",
      envVar: "NEXT_PUBLIC_GOOGLE_ADS_ID",
      configured: Boolean(i.googleAds.conversionId),
      enabled: i.googleAds.enabled,
      maskedValue: maskValue(i.googleAds.conversionId),
      dashboardUrl: PLATFORM_DASHBOARD_URLS.googleAds,
      helpEnvVars: [
        "NEXT_PUBLIC_GOOGLE_ADS_ID",
        "NEXT_PUBLIC_GOOGLE_ADS_LABEL",
        "NEXT_PUBLIC_GOOGLE_ADS_ENABLED",
      ],
    },
    {
      key: "meta",
      title: "Meta (Facebook) Pixel",
      envVar: "NEXT_PUBLIC_META_PIXEL_ID",
      configured: Boolean(i.facebookPixel.pixelId),
      enabled: i.facebookPixel.enabled,
      maskedValue: maskValue(i.facebookPixel.pixelId),
      dashboardUrl: PLATFORM_DASHBOARD_URLS.facebookEventsManager,
      helpEnvVars: [
        "NEXT_PUBLIC_META_PIXEL_ID",
        "NEXT_PUBLIC_META_PIXEL_ENABLED",
      ],
    },
    {
      key: "tiktok",
      title: "TikTok Pixel",
      envVar: "NEXT_PUBLIC_TIKTOK_PIXEL_ID",
      configured: Boolean(i.tiktokPixel.pixelId),
      enabled: i.tiktokPixel.enabled,
      maskedValue: maskValue(i.tiktokPixel.pixelId),
      dashboardUrl: PLATFORM_DASHBOARD_URLS.tiktokEventsManager,
      helpEnvVars: [
        "NEXT_PUBLIC_TIKTOK_PIXEL_ID",
        "NEXT_PUBLIC_TIKTOK_PIXEL_ENABLED",
      ],
    },
  ];
}
